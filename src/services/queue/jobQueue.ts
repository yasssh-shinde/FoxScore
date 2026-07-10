import { supabaseAdmin } from '@/lib/supabase'
import { runFullAudit } from '../audit/reportBuilder'
import { sendAuditEmail } from '../emailService'

export type JobType = 'PROCESS_AUDIT' | 'SEND_EMAIL' | 'SEND_WEBHOOK'

export async function enqueueJob(jobType: JobType, payload: any, runAfterSeconds = 0): Promise<string | null> {
  try {
    const runAt = new Date(Date.now() + runAfterSeconds * 1000).toISOString()
    const { data, error } = await supabaseAdmin
      .from('background_jobs')
      .insert([{
        job_type: jobType,
        payload,
        status: 'pending',
        run_at: runAt,
        attempts: 0,
        max_attempts: 3,
      }])
      .select('id')
      .single()

    if (error) throw error
    console.log(`📥 Enqueued job ${jobType} successfully. Job ID: ${data.id}`)
    return data.id
  } catch (error) {
    console.error('🔴 Failed to enqueue background job:', error)
    return null
  }
}

export async function processJob(jobId: string): Promise<boolean> {
  const { data: job, error: fetchError } = await supabaseAdmin
    .from('background_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    console.error(`🔴 Job ${jobId} not found in database:`, fetchError)
    return false
  }

  if (job.status === 'completed' || job.status === 'failed_permanently') {
    return true // Already processed
  }

  // Update status to running and increment attempts
  const nextAttempt = job.attempts + 1
  await supabaseAdmin
    .from('background_jobs')
    .update({
      status: 'running',
      attempts: nextAttempt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)

  try {
    console.log(`⚙️ Executing job ${job.job_type} (Attempt ${nextAttempt}/${job.max_attempts})`)

    switch (job.job_type) {
      case 'PROCESS_AUDIT':
        await handleProcessAudit(job.payload)
        break
      case 'SEND_EMAIL':
        await handleSendEmail(job.payload)
        break
      case 'SEND_WEBHOOK':
        await handleSendWebhook(job.payload)
        break
      default:
        throw new Error(`Unsupported job type: ${job.job_type}`)
    }

    // Success! Mark completed
    await supabaseAdmin
      .from('background_jobs')
      .update({
        status: 'completed',
        error_log: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    console.log(`✅ Job ${jobId} (${job.job_type}) completed successfully`)
    return true
  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`❌ Job ${jobId} (${job.job_type}) failed:`, errorMsg)

    const isPermanentFailure = nextAttempt >= job.max_attempts
    const nextStatus = isPermanentFailure ? 'failed_permanently' : 'failed'
    
    // Exponential backoff: retry in 2^attempt minutes
    const backoffMinutes = Math.pow(2, nextAttempt)
    const nextRunAt = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString()

    await supabaseAdmin
      .from('background_jobs')
      .update({
        status: nextStatus,
        error_log: errorMsg,
        run_at: isPermanentFailure ? job.run_at : nextRunAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return false
  }
}

export async function runNextJobs(): Promise<number> {
  // Pull all pending or failed jobs whose run_at <= NOW
  const { data: jobs, error } = await supabaseAdmin
    .from('background_jobs')
    .select('id')
    .or('status.eq.pending,status.eq.failed')
    .lte('run_at', new Date().toISOString())
    .order('run_at', { ascending: true })
    .limit(10) // Process in batches of 10

  if (error || !jobs || jobs.length === 0) {
    return 0
  }

  console.log(`🚀 Found ${jobs.length} background jobs to run...`)
  let processedCount = 0

  for (const job of jobs) {
    const success = await processJob(job.id)
    if (success) processedCount++
  }

  return processedCount
}

// Job Handlers
export async function handleProcessAudit(payload: { lead_id: string }) {
  const leadId = payload.lead_id

  // 1. Fetch Lead
  const { data: lead, error: leadErr } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadErr || !lead) throw new Error(`Lead ${leadId} not found: ${leadErr?.message}`)

  console.log(`🔎 Running server audit on URL: ${lead.website_url}`)
  
  // 2. Perform server audit
  const report = await runFullAudit(lead.website_url)
  if (!report.success) throw new Error(report.error || 'Audit report generation failed')

  const scoreResult = report.scores
  const actualScore = scoreResult.overall

  // 3. Game/Prize matching logic (Guessed score is now out of 100)
  // Win condition: Guessed score is within ±2 points of actual score
  const scoreDifference = Math.abs(lead.guessed_score - actualScore)
  const isWinner = scoreDifference <= 2

  console.log(`🎯 Audit completed. Guess: ${lead.guessed_score}, Actual: ${actualScore}, Diff: ${scoreDifference}, Won: ${isWinner}`)

  // 4. Save to audit_results (excluding raw HTML for database performance)
  const { error: auditErr } = await supabaseAdmin
    .from('audit_results')
    .insert([{
      lead_id: leadId,
      website_score: scoreResult.website,
      seo_score: scoreResult.seo,
      google_score: scoreResult.google,
      social_score: scoreResult.social,
      overall_score: actualScore,
      audit_data: report.auditData, // This contains zero raw HTML now!
    }])

  if (auditErr) throw auditErr

  // 5. Update lead state
  const { error: updateErr } = await supabaseAdmin
    .from('leads')
    .update({
      actual_score: actualScore,
      won_prize: isWinner,
    })
    .eq('id', leadId)

  if (updateErr) throw updateErr

  // 6. Create Prize Claim history record if won or guessed (Fail-safe: ignore if table missing)
  try {
    const { error: claimErr } = await supabaseAdmin
      .from('prize_claims')
      .insert([{
        lead_id: leadId,
        guessed_score: lead.guessed_score,
        actual_score: actualScore,
        difference: scoreDifference,
        status: isWinner ? 'pending' : 'rejected', // Rejected if did not match, pending admin approval if matched
        ip_address: lead.ip_address || null,
      }])

    if (claimErr) {
      console.warn('⚠️ Could not save prize claim history (table may be missing). Run migrations.', claimErr.message)
    }
  } catch (err: any) {
    console.warn('⚠️ Could not save prize claim history:', err.message || err)
  }

  // 7. Enqueue follow-up tasks (Fail-safe: ignore if table missing)
  try {
    await enqueueJob('SEND_EMAIL', { lead_id: leadId })
  } catch (err: any) {
    console.warn('⚠️ Could not enqueue email job:', err.message || err)
  }
  
  try {
    await enqueueJob('SEND_WEBHOOK', { lead_id: leadId })
  } catch (err: any) {
    console.warn('⚠️ Could not enqueue webhook job:', err.message || err)
  }
}

async function handleSendEmail(payload: { lead_id: string }) {
  const { lead_id } = payload

  const { data: lead, error: leadErr } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', lead_id)
    .single()

  if (leadErr || !lead) throw new Error(`Lead ${lead_id} not found: ${leadErr?.message}`)

  const { data: audit, error: auditErr } = await supabaseAdmin
    .from('audit_results')
    .select('*')
    .eq('lead_id', lead_id)
    .single()

  if (auditErr || !audit) throw new Error(`Audit for lead ${lead_id} not found: ${auditErr?.message}`)

  // Send the email (handled by emailService.ts)
  const sent = await sendAuditEmail(lead, audit)
  if (!sent) throw new Error('Email delivery service reported failure')

  // Update emailed_at in reports/leads if needed. Let's record in reports if it exists
  const { data: report } = await supabaseAdmin
    .from('reports')
    .select('id')
    .eq('lead_id', lead_id)
    .single()

  if (report) {
    await supabaseAdmin
      .from('reports')
      .update({ emailed_at: new Date().toISOString() })
      .eq('id', report.id)
  }
}

async function handleSendWebhook(payload: { lead_id: string }) {
  const { lead_id } = payload

  const { data: lead, error: leadErr } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', lead_id)
    .single()

  if (leadErr || !lead) throw new Error(`Lead ${lead_id} not found: ${leadErr?.message}`)

  let webhookResponses: any[] = []

  // 1. WhatsApp Webhook
  if (process.env.WHATSAPP_WEBHOOK_URL) {
    console.log('📱 Triggering WhatsApp webhook for:', lead.full_name)
    try {
      const res = await fetch(process.env.WHATSAPP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.full_name,
          phone: lead.mobile_number,
          company: lead.company_name,
          website: lead.website_url,
          score: lead.actual_score,
        }),
      })

      const status = res.status
      const body = await res.json().catch(() => null)

      await supabaseAdmin.from('webhook_logs').insert([{
        event_type: 'whatsapp_webhook',
        lead_id,
        payload: { phone: lead.mobile_number, company: lead.company_name },
        response_status: status,
        response_body: body,
      }])
    } catch (e: any) {
      console.error('WhatsApp webhook error:', e)
      await supabaseAdmin.from('webhook_logs').insert([{
        event_type: 'whatsapp_webhook',
        lead_id,
        error: e.message || String(e),
      }])
    }
  }

  // 2. Google Sheets Webhook
  if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
    console.log('📊 Syncing lead to Google Sheets webhook...')
    try {
      const res = await fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          reference_id: lead.reference_id,
          full_name: lead.full_name,
          company_name: lead.company_name,
          email: lead.email,
          mobile_number: lead.mobile_number,
          website_url: lead.website_url,
          guessed_score: lead.guessed_score,
          actual_score: lead.actual_score,
          won_prize: lead.won_prize,
        }),
      })

      const status = res.status
      const body = await res.json().catch(() => null)

      await supabaseAdmin.from('webhook_logs').insert([{
        event_type: 'google_sheet_webhook',
        lead_id,
        payload: { reference_id: lead.reference_id, company: lead.company_name },
        response_status: status,
        response_body: body,
      }])
    } catch (e: any) {
      console.error('Google Sheet Sync Error:', e)
      await supabaseAdmin.from('webhook_logs').insert([{
        event_type: 'google_sheet_webhook',
        lead_id,
        error: e.message || String(e),
      }])
    }
  }
}

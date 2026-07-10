import { supabaseAdmin } from '@/lib/supabase'
import { runFullAudit } from '../audit/reportBuilder'
import { sendAuditEmail } from '../emailService'
import { after } from 'next/server'

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

  // Update status to running and increment attempts ONLY if it is not already running
  const isAlreadyRunning = job.status === 'running'
  const nextAttempt = isAlreadyRunning ? job.attempts : job.attempts + 1

  if (!isAlreadyRunning) {
    await supabaseAdmin
      .from('background_jobs')
      .update({
        status: 'running',
        attempts: nextAttempt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
  }

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
  let jobs = null
  let error = null

  // 1. Try using the atomic database dequeue RPC function
  const rpcRes = await supabaseAdmin
    .rpc('dequeue_next_jobs', { batch_size: 10 })

  if (!rpcRes.error && rpcRes.data) {
    jobs = rpcRes.data
  } else {
    console.warn(`⚠️ dequeue_next_jobs RPC failed or missing: ${rpcRes.error?.message || 'unknown'}. Falling back to standard query...`)
    
    // 2. Fallback: Pull pending or failed jobs whose run_at <= NOW
    const queryRes = await supabaseAdmin
      .from('background_jobs')
      .select('id')
      .or('status.eq.pending,status.eq.failed')
      .lte('run_at', new Date().toISOString())
      .order('run_at', { ascending: true })
      .limit(10)

    if (!queryRes.error && queryRes.data) {
      jobs = queryRes.data
      
      // Update status to running manually since standard select doesn't lock rows
      await Promise.all(
        jobs.map(async (job: any) => {
          await supabaseAdmin
            .from('background_jobs')
            .update({ status: 'running', updated_at: new Date().toISOString() })
            .eq('id', job.id)
        })
      )
    } else {
      error = queryRes.error
    }
  }

  if (error || !jobs || jobs.length === 0) {
    return 0
  }

  console.log(`🚀 Found ${jobs.length} background jobs to run...`)

  // Process jobs sequentially with 600ms delay (respects Resend 2 req/sec rate limit)
  const results = []
  for (const job of jobs) {
    results.push(await Promise.resolve(processJob(job.id)))
    if (jobs.length > 1) await new Promise(r => setTimeout(r, 600))
  }

  let processedCount = 0
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      processedCount++
    }
  })

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

  // Check if this is a partner site BEFORE running audit
  const isPartnerSite = lead.website_url.includes('achivoo.com') || lead.website_url.includes('seofox.io')

  let scoreResult: any
  let actualScore: number

  let auditData: any

  if (isPartnerSite) {
    // Partner sites always get perfect score - skip audit
    console.log(`⭐ Partner site detected (${lead.website_url}). Returning perfect score 100.`)
    actualScore = 100
    scoreResult = { overall: 100, website: 100, seo: 100, google: 100, social: 100, won: true }
    auditData = {
      website: [],
      seo: [],
      google: [],
      social: [],
      improvements: [],
      strengths: ['⭐ Partner site with perfect digital health'],
      priorityActions: []
    }
  } else {
    // 2. Perform server audit for regular sites
    console.log(`🔎 Running server audit on URL: ${lead.website_url}`)
    const report = await runFullAudit(lead.website_url)
    if (!report.success) throw new Error(report.error || 'Audit report generation failed')

    scoreResult = report.scores
    actualScore = scoreResult.overall
    auditData = report.auditData
  }

  // 3. Game/Prize matching logic - Exact score match only!
  const actualScoreOn10 = Math.round(actualScore / 10)
  const isWinner = lead.guessed_score === actualScoreOn10
  const scoreDifference = Math.abs(lead.guessed_score - actualScoreOn10)

  console.log(`🎯 Audit completed. Guess: ${lead.guessed_score} (x10 = ${lead.guessed_score * 10}), Actual: ${actualScore}, Diff: ${scoreDifference}, Won: ${isWinner}`)

  // 4-7. Execute ALL database operations in parallel (NOT sequentially)
  const [auditErr, updateErr, claimErr] = await Promise.all([
    // Save audit results
    supabaseAdmin
      .from('audit_results')
      .insert([{
        lead_id: leadId,
        website_score: scoreResult.website,
        seo_score: scoreResult.seo,
        google_score: scoreResult.google,
        social_score: scoreResult.social,
        overall_score: actualScore,
        audit_data: auditData,
      }])
      .then((res: any) => res.error),

    // Update lead state
    supabaseAdmin
      .from('leads')
      .update({
        actual_score: actualScore,
        won_prize: isWinner,
      })
      .eq('id', leadId)
      .then((res: any) => res.error),

    // Create prize claim
    supabaseAdmin
      .from('prize_claims')
      .insert([{
        lead_id: leadId,
        guessed_score: lead.guessed_score,
        actual_score: actualScoreOn10,
        difference: Math.abs(lead.guessed_score - actualScoreOn10),
        status: isWinner ? 'pending' : 'rejected',
        ip_address: lead.ip_address || null,
      }])
      .then((res: any) => res.error)
      .catch(() => null),
  ])

  if (auditErr) throw auditErr
  if (updateErr) throw updateErr
  if (claimErr) console.warn('⚠️ Prize claim save failed:', claimErr.message)

  // 8. Enqueue and immediately process follow-up tasks
  try {
    await enqueueJob('SEND_EMAIL', { lead_id: leadId }).catch(e => console.warn('Email job enqueue failed:', e))
    await enqueueJob('SEND_WEBHOOK', { lead_id: leadId }).catch(e => console.warn('Webhook job enqueue failed:', e))

    // Use Next.js after() to process jobs in background (won't block response)
    after(async () => {
      try {
        const count = await runNextJobs()
        if (count > 0) console.log(`⚡ Processed ${count} jobs immediately after audit`)
      } catch (e) {
        console.warn('Background job processing failed:', e)
      }
    })
  } catch (e) {
    console.warn('Failed to handle follow-up jobs:', e)
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

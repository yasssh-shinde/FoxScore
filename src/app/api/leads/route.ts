import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { enqueueJob, runNextJobs, handleProcessAudit } from '@/services/queue/jobQueue'
import { after } from 'next/server'
import { leadFormSchema } from '@/lib/validators/formSchema'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabaseAdmin
      .from('leads')
      .select(
        `*,
        lead_assignments(
          id,
          assigned_to,
          status,
          team_members!assigned_to(name, email)
        ),
        audit_results(overall_score)`,
        { count: 'exact' }
      )

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    let { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    )

    if (error) {
      console.warn(`⚠️ /api/leads joined query failed: ${error.message}. Falling back to simple leads query...`)
      
      let fallbackQuery = supabaseAdmin
        .from('leads')
        .select('*', { count: 'exact' })

      if (search) {
        fallbackQuery = fallbackQuery.or(
          `full_name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%`
        )
      }

      fallbackQuery = fallbackQuery.order(sortBy, { ascending: sortOrder === 'asc' })

      const fallbackRes = await fallbackQuery.range(
        (page - 1) * limit,
        page * limit - 1
      )

      if (fallbackRes.error) {
        return NextResponse.json({ error: fallbackRes.error.message }, { status: 400 })
      }

      data = fallbackRes.data
      count = fallbackRes.count
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // 1. Zod schema validation & sanitization
    const validationResult = leadFormSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((err: any) => err.message).join(' ')
      return NextResponse.json({ error: errorMessages }, { status: 400 })
    }

    const {
      full_name,
      company_name,
      mobile_number,
      email,
      website_url,
      google_business_url,
      instagram_url,
      facebook_url,
      linkedin_url,
      guessed_score,
    } = validationResult.data

    // Sanitize website URL protocol
    let website = website_url.trim()
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      website = 'https://' + website
    }

    // 2. Automated Round-Robin Lead Assignment
    // Fetch active team members and last lead assignment in parallel
    const [teamRes, lastAssignRes] = await Promise.all([
      supabaseAdmin
        .from('team_members')
        .select('id, name')
        .eq('status', 'active')
        .order('created_at', { ascending: true }),
      supabaseAdmin
        .from('lead_assignments')
        .select('assigned_to')
        .order('created_at', { ascending: false })
        .limit(1)
    ])

    if (teamRes.error) throw teamRes.error

    const teamMembers = teamRes.data
    const lastAssignment = lastAssignRes.data
    let assignedToId: string | null = null

    if (teamMembers && teamMembers.length > 0) {
      const lastAssignedId = lastAssignment?.[0]?.assigned_to

      if (lastAssignedId) {
        // Find index of last assignee in active team list
        const lastIdx = teamMembers.findIndex((m: any) => m.id === lastAssignedId)
        // Next assignee index
        const nextIdx = lastIdx === -1 ? 0 : (lastIdx + 1) % teamMembers.length
        assignedToId = teamMembers[nextIdx].id
      } else {
        assignedToId = teamMembers[0].id
      }
    }

    // Generate unique reference ID
    const referenceId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`

    // Get IP address and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'

    // 3. Create lead in database
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert([{
        reference_id: referenceId,
        full_name,
        company_name,
        mobile_number,
        email,
        website_url: website,
        google_business_url: google_business_url || null,
        instagram_url: instagram_url || null,
        facebook_url: facebook_url || null,
        linkedin_url: linkedin_url || null,
        guessed_score: guessed_score,
        actual_score: null, // Computed asynchronously
        won_prize: false,  // Evaluated during audit
        consultation_requested: false,
        checked_by: assignedToId,
        ip_address: ip,
      }])
      .select()
      .single()

    if (leadError) throw leadError

    // 4. Create assignment record
    if (assignedToId) {
      await supabaseAdmin
        .from('lead_assignments')
        .insert([{
          lead_id: lead.id,
          assigned_to: assignedToId,
          status: 'assigned',
        }])
    }

    // 5. Enqueue the audit process job (Run in background)
    const jobId = await enqueueJob('PROCESS_AUDIT', { lead_id: lead.id })

    after(async () => {
      if (!jobId) {
        console.warn(`⚠️ Background queue table missing. Falling back to synchronous audit execution in background...`)
        try {
          await handleProcessAudit({ lead_id: lead.id })
          console.log(`✅ Synchronous fallback audit completed in background for lead ${lead.id}`)
        } catch (syncErr: any) {
          console.error(`🔴 Synchronous fallback audit failed:`, syncErr.message || syncErr)
        }
      } else {
        console.log(`⚡ Next.js 15 after() executing queue worker...`)
        const count = await runNextJobs()
        console.log(`⚡ Queue worker finished. Processed ${count} jobs.`)
      }
    })

    // Return immediate response to the client
    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      reference_id: referenceId,
      job_id: jobId,
      assigned_to: assignedToId,
    }, { status: 201 })

  } catch (error: any) {
    console.error('🔴 Lead registration failed:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to submit challenge lead' },
      { status: 500 }
    )
  }
}

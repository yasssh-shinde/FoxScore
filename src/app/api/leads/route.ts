import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateAuditData, calculateScore } from '@/services/scoreCalculator'
import { sendWelcomeEmail } from '@/services/emailService'
import { RegistrationFormData } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('leads')
      .select(
        `*,
        lead_assignments(
          id,
          assigned_to,
          status,
          team_members(name, email)
        ),
        audit_results(overall_score)`,
        { count: 'exact' }
      )

    // Search filter
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Pagination
    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
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
    const body: RegistrationFormData & { guessed_score: number; checked_by?: string } = await req.json()

    // Generate reference ID
    const referenceId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Generate audit data (real scan) and calculate score
    console.log('🔍 Starting real website scan for:', body.website_url)
    const auditData = await generateAuditData(body.website_url)
    console.log('✅ Scan complete, calculating score')
    const scoreResult = calculateScore(auditData)

    // Check if won prize (compare guess out of 10 with actual overall score scaled to 10)
    const won = Math.round(scoreResult.overall / 10) === body.guessed_score

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([{
        reference_id: referenceId,
        full_name: body.full_name,
        company_name: body.company_name,
        mobile_number: body.mobile_number,
        email: body.email,
        website_url: body.website_url,
        google_business_url: body.google_business_url || null,
        instagram_url: body.instagram_url || null,
        facebook_url: body.facebook_url || null,
        linkedin_url: body.linkedin_url || null,
        guessed_score: body.guessed_score,
        actual_score: scoreResult.overall,
        won_prize: won,
        consultation_requested: false,
        checked_by: body.checked_by || null,
      }])
      .select()
      .single()

    if (leadError) throw leadError

    // Create audit result
    const { error: auditError } = await supabase
      .from('audit_results')
      .insert([{
        lead_id: lead.id,
        website_score: scoreResult.website,
        seo_score: scoreResult.seo,
        google_score: scoreResult.google,
        social_score: scoreResult.social,
        overall_score: scoreResult.overall,
        audit_data: auditData,
      }])

    if (auditError) throw auditError

    // Send welcome email (DISABLED FOR NOW - Limited free tier emails)
    // Enable when ready to launch: set ENABLE_EMAILS=true in .env.local
    if (process.env.ENABLE_EMAILS === 'true') {
      console.log('\n🔵 Starting email process for:', lead.email)
      try {
        const emailSent = await sendWelcomeEmail(lead, {
          ...auditData,
          overall_score: scoreResult.overall,
        } as any)
        console.log('✅ Email process completed:', emailSent)
      } catch (emailErr: any) {
        console.error('❌ Email failed:', emailErr?.message || emailErr)
      }
    } else {
      console.log('📧 Email disabled (ENABLE_EMAILS not set)')
    }

    // Optional: Trigger WhatsApp webhook
    if (process.env.WHATSAPP_WEBHOOK_URL) {
      await fetch(process.env.WHATSAPP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: body.full_name,
          phone: body.mobile_number,
          company: body.company_name,
          website: body.website_url,
          score: scoreResult.overall,
        }),
      }).catch((e) => console.error('Webhook error:', e))
    }

    // Optional: Sync with Google Sheets via Webapp Webhook
    if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      console.log('📊 Syncing lead to Google Sheets...')
      await fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          reference_id: referenceId,
          full_name: body.full_name,
          company_name: body.company_name,
          email: body.email,
          mobile_number: body.mobile_number,
          website_url: body.website_url,
          guessed_score: body.guessed_score,
          actual_score: scoreResult.overall,
          won_prize: won,
        }),
      }).catch((e) => console.error('Google Sheet Sync Error:', e))
    }

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      reference_id: referenceId,
      score: scoreResult.overall,
    })
  } catch (error: any) {
    let errorMsg = 'Unknown error'
    if (error?.message) errorMsg = error.message
    if (error?.error_description) errorMsg = error.error_description
    if (typeof error === 'string') errorMsg = error

    console.error('🔴 Lead creation error:', errorMsg)
    console.error('🔴 Full error object:', JSON.stringify(error, null, 2))

    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}

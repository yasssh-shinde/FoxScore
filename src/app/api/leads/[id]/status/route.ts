import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 })
    }

    // 1. Fetch Lead & Audit Results in parallel
    const [leadRes, auditRes] = await Promise.all([
      supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', id)
        .single(),
      supabaseAdmin
        .from('audit_results')
        .select('*')
        .eq('lead_id', id)
        .single()
    ])

    if (leadRes.error || !leadRes.data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const lead = leadRes.data
    const audit = auditRes.data

    // If actual_score is populated, it means the background worker finished the audit
    if (lead.actual_score !== null && audit) {
      // Find prize claim status
      const { data: claim } = await supabaseAdmin
        .from('prize_claims')
        .select('status, difference')
        .eq('lead_id', id)
        .single()

      return NextResponse.json({
        finished: true,
        actual_score: lead.actual_score,
        won_prize: lead.won_prize,
        claim_status: claim?.status || 'none',
        claim_difference: claim?.difference ?? 100,
        lead,
        audit,
      })
    }

    // Still processing
    return NextResponse.json({
      finished: false,
    })

  } catch (error: any) {
    console.error('🔴 Error checking audit status:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to query audit status' },
      { status: 500 }
    )
  }
}

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

    // Run queries in parallel
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

    return NextResponse.json({
      lead: leadRes.data,
      audit: auditRes.data || null, // Audit might be null if not completed yet
    })
  } catch (error: any) {
    console.error('Error fetching lead details:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}

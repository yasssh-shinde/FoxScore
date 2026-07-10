import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: audit } = await supabase
      .from('audit_results')
      .select('*')
      .eq('lead_id', params.id)
      .single()

    return NextResponse.json({ lead, audit })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}

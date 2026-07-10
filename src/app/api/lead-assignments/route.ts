import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const leadId = searchParams.get('lead_id')
    const assignedTo = searchParams.get('assigned_to')
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('lead_assignments')
      .select(`
        *,
        leads(full_name, company_name, email),
        team_members!assigned_to(name, email)
      `)

    if (leadId) query = query.eq('lead_id', leadId)
    if (assignedTo) query = query.eq('assigned_to', assignedTo)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch lead assignments' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabaseAdmin
      .from('lead_assignments')
      .insert([{
        lead_id: body.lead_id,
        assigned_to: body.assigned_to,
        assigned_by: body.assigned_by,
        status: 'assigned',
        notes: body.notes || '',
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create lead assignment' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body

    // If marking as contacted, set contacted_at
    if (updateData.status === 'contacted' && !updateData.contacted_at) {
      updateData.contacted_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('lead_assignments')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update lead assignment' },
      { status: 500 }
    )
  }
}

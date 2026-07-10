import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const assignedTo = searchParams.get('assigned_to')
    const status = searchParams.get('status') || 'pending'

    let query = supabase
      .from('follow_up_reminders')
      .select(`
        *,
        leads(full_name, company_name, email),
        team_members(name, email)
      `)
      .eq('status', status)
      .order('reminder_date', { ascending: true })

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch follow-up reminders' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabase
      .from('follow_up_reminders')
      .insert([{
        lead_id: body.lead_id,
        assigned_to: body.assigned_to,
        reminder_date: body.reminder_date,
        reminder_type: body.reminder_type || 'email',
        status: 'pending',
        title: body.title,
        description: body.description,
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create follow-up reminder' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body

    // If marking as sent, set sent_at
    if (updateData.status === 'sent' && !updateData.sent_at) {
      updateData.sent_at = new Date().toISOString()
    }

    // If marking as completed, set completed_at
    if (updateData.status === 'completed' && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('follow_up_reminders')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update follow-up reminder' },
      { status: 500 }
    )
  }
}

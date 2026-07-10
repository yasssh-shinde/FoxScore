import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabaseAdmin = getSupabaseAdmin()
    let query = supabaseAdmin
      .from('prize_claims')
      .select(`
        *,
        leads (
          full_name,
          company_name,
          email,
          mobile_number,
          reference_id
        )
      `, { count: 'exact' })

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      claims: data,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch prize claims' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { claim_id, status, admin_notes } = body

    if (!claim_id || !status) {
      return NextResponse.json({ error: 'Missing claim_id or status' }, { status: 400 })
    }

    if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const { data: claim, error: updateError } = await supabaseAdmin
      .from('prize_claims')
      .update({
        status,
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claim_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Update leads.won_prize based on claim approval
    await supabaseAdmin
      .from('leads')
      .update({
        won_prize: status === 'approved',
      })
      .eq('id', claim.lead_id)

    return NextResponse.json({
      success: true,
      message: `Prize claim ${claim_id} marked as ${status}.`,
      claim,
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update prize claim' },
      { status: 500 }
    )
  }
}

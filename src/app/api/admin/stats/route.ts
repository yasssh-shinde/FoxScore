import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // 1. Try to fetch from the leads_statistics view
    const { data, error } = await supabaseAdmin
      .from('leads_statistics')
      .select('*')
      .single()

    if (!error && data) {
      return NextResponse.json({
        stats: {
          totalLeads: data.total_leads,
          averageScore: data.average_score,
          highestScore: data.highest_score,
          lowestScore: data.lowest_score,
          prizeWinners: data.prize_winners,
        }
      })
    }

    // 2. Fallback: If view is missing or errors, calculate stats on-the-fly
    console.warn('⚠️ leads_statistics view not found or failed. Falling back to on-the-fly calculation...')
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('actual_score, won_prize')

    if (leadsError) {
      return NextResponse.json({ error: leadsError.message }, { status: 400 })
    }

    const scores = (leads || [])
      .map(l => l.actual_score)
      .filter(s => s !== null) as number[]

    const stats = {
      totalLeads: leads?.length || 0,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      prizeWinners: (leads || []).filter(l => l.won_prize).length,
    }

    return NextResponse.json({ stats })
  } catch (error: any) {
    console.error('Error fetching admin statistics:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

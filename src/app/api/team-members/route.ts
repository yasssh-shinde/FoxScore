import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('status', 'active')
      .order('name')

    if (error) {
      console.error('Supabase error:', error)
      // Return empty array instead of error to prevent app crash
      return NextResponse.json([])
    }

    // Ensure we always return an array
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error('Team members fetch error:', error)
    // Return empty array instead of error to prevent app crash
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        name: body.name,
        email: body.email,
        role: body.role || 'member',
        status: 'active',
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    )
  }
}

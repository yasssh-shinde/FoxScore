import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const TEAM_MEMBERS = [
  {
    name: 'Yash',
    email: 'yash@seofox.io',
    role: 'admin',
  },
  {
    name: 'Dnya',
    email: 'dnya@seofox.io',
    role: 'manager',
  },
  {
    name: 'Achyut',
    email: 'achyut@seofox.io',
    role: 'manager',
  },
  {
    name: 'Vaibhav',
    email: 'vaibhav@seofox.io',
    role: 'manager',
  },
  {
    name: 'Gargi',
    email: 'gargi@seofox.io',
    role: 'manager',
  },
]

export async function POST(req: NextRequest) {
  try {
    const secretKey = req.headers.get('x-secret-key')

    // Simple security check - you should use a proper API key
    if (secretKey !== process.env.SEED_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert(
        TEAM_MEMBERS.map(member => ({
          ...member,
          status: 'active',
        }))
      )
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Team members created successfully',
      count: data.length,
      members: data,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to seed team members' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      count: data.length,
      members: data,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

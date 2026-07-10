import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { processJob, runNextJobs } from '@/services/queue/jobQueue'
import { after } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabaseAdmin
      .from('background_jobs')
      .select('*', { count: 'exact' })

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
      jobs: data,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { job_id } = body

    if (!job_id) {
      return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })
    }

    // Reset job state for manual retry
    const { data: job, error: updateError } = await supabaseAdmin
      .from('background_jobs')
      .update({
        status: 'pending',
        attempts: 0,
        run_at: new Date().toISOString(),
        error_log: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Asynchronously kick off queue processing
    after(async () => {
      console.log(`⚡ Retrying job ${job_id} in background...`)
      await processJob(job_id)
      await runNextJobs()
    })

    return NextResponse.json({
      success: true,
      message: `Job ${job_id} reset to pending and execution started.`,
      job,
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to retry job' },
      { status: 500 }
    )
  }
}

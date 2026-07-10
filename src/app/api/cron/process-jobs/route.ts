import { NextRequest, NextResponse } from 'next/server'
import { runNextJobs } from '@/services/queue/jobQueue'

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🔄 Cron job triggered: Processing background jobs...')
    const processedCount = await runNextJobs()
    console.log(`✅ Processed ${processedCount} background jobs`)

    return NextResponse.json({
      success: true,
      processedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Cron job failed:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Failed to process jobs',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

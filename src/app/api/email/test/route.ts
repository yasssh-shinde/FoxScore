import { NextRequest, NextResponse } from 'next/server'
import { sendAuditEmail } from '@/services/emailService'

export async function GET(req: NextRequest) {
  try {
    // Get email from query params
    const email = req.nextUrl.searchParams.get('email')
    if (!email) {
      return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 })
    }

    // Test data
    const testLead = {
      id: 'test-123',
      email,
      full_name: 'Test User',
      company_name: 'Test Company',
      website_url: 'https://test.com',
      guessed_score: 7,
      actual_score: 7,
      won_prize: true,
      created_at: new Date().toISOString(),
      ip_address: '127.0.0.1',
      reference_id: 'test-ref',
      mobile_number: '9876543210',
    }

    const testAudit = {
      id: 'audit-123',
      lead_id: 'test-123',
      website_score: 85,
      seo_score: 75,
      google_score: 80,
      social_score: 70,
      overall_score: 77.5,
      audit_data: {
        website: [],
        seo: [],
        google: [],
        social: [],
        improvements: [
          '❌ Missing meta descriptions',
          '⚠️ Slow page load time',
          '❌ Mobile responsiveness issues'
        ],
        strengths: ['Good heading structure'],
        priorityActions: []
      },
      created_at: new Date().toISOString(),
    }

    console.log('🧪 Testing email send to:', email)
    const result = await sendAuditEmail(testLead as any, testAudit as any)

    return NextResponse.json({
      success: result,
      message: result ? 'Email sent successfully' : 'Email send failed',
      email,
    })
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({
      error: error.message || 'Test failed',
      stack: error.stack,
    }, { status: 500 })
  }
}

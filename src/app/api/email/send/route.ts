import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

let resend: any = null

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

export async function POST(req: NextRequest) {
  console.log('\n🔵 /api/email/send endpoint called')
  try {
    const { to, subject, text } = await req.json()

    console.log('📧 Email request received')
    console.log('   To:', to)
    console.log('   Subject:', subject)
    console.log('   API Key present:', !!process.env.RESEND_API_KEY)
    console.log('   API Key starts with:', process.env.RESEND_API_KEY?.substring(0, 10))

    const sendTo = to  // Send to actual email

    console.log(`📮 Sending to: ${sendTo}`)

    const result = await getResend().emails.send({
      from: 'noreply@seofox.co.in',  // Using verified domain
      to: sendTo,
      subject: subject,
      text: text,
      html: `<pre style="font-family: Arial, sans-serif; line-height: 1.6; white-space: pre-wrap;">${text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</pre>`,
    })

    if (result.error) {
      console.error('❌ Resend error:', result.error)
      throw result.error
    }

    console.log('✅ Email sent successfully:', result.data?.id)
    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error) {
    console.error('❌ Email service error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}

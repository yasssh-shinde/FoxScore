import { Resend } from 'resend'

export interface EmailPayload {
  to: string
  subject: string
  text: string
  html: string
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }>
}

class ResendEmailProvider implements EmailProvider {
  private resend: Resend | null = null

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      this.resend = new Resend(apiKey)
    }
  }

  async send(payload: EmailPayload) {
    if (!this.resend) {
      return { success: false, error: 'Resend API key is not configured' }
    }

    try {
      console.log(`📤 Sending email via Resend to: ${payload.to}`)
      const result = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@seofox.co.in',
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      })

      if (result.error) {
        console.error('❌ Resend API Error:', result.error)
        return { success: false, error: result.error.message }
      }

      return { success: true, id: result.data?.id }
    } catch (e: any) {
      console.error('❌ Resend Send Error:', e)
      return { success: false, error: e.message || String(e) }
    }
  }
}

class MockEmailProvider implements EmailProvider {
  async send(payload: EmailPayload) {
    console.log('\n=======================================')
    console.log('📬 [MOCK EMAIL SENDER]')
    console.log(`   To:      ${payload.to}`)
    console.log(`   Subject: ${payload.subject}`)
    console.log('   --- Text Content ---')
    console.log(payload.text.trim())
    console.log('=======================================\n')
    return { success: true, id: `mock-${Date.now()}` }
  }
}

// Factory to resolve the active email provider based on configuration
let activeProvider: EmailProvider | null = null

export function getEmailProvider(): EmailProvider {
  if (activeProvider) return activeProvider

  if (process.env.RESEND_API_KEY) {
    console.log('📧 Initializing Resend Email Provider')
    activeProvider = new ResendEmailProvider()
  } else {
    console.log('📧 No Resend API Key found. Initializing Mock Email Provider.')
    activeProvider = new MockEmailProvider()
  }

  return activeProvider
}

import { Lead, AuditResult } from '@/types'
import { getEmailProvider } from './email/provider'

export async function sendAuditEmail(lead: Lead, audit: AuditResult): Promise<boolean> {
  console.log(`📧 Preparing email report for: ${lead.email}`)
  try {
    const improvements = audit.audit_data?.improvements || []
    const top3Issues = improvements.slice(0, 3).map((item: string) => `• ${item.replace(/^[❌⚠️]\s*/, '')}`).join('\n')
    const htmlIssues = improvements.slice(0, 3).map((item: string) => `<li>${item.replace(/^[❌⚠️]\s*/, '')}</li>`).join('')

    const plainTextContent = `
Hi ${lead.full_name},

Thank you for participating in the Digital Health Score Challenge at our event. It was a pleasure connecting with you and learning about ${lead.company_name}.

We've analyzed your online presence. Here is your report summary:

📊 Your Digital Health Score: ${audit.overall_score}/100

🔴 Top Issues Found:
${top3Issues || '• None detected! Your website structure is solid.'}

To view your full interactive audit report, please visit:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/challenge/report/${lead.id}

As a special thank-you for participating, we're offering ${lead.company_name} an exclusive 50% discount on our digital marketing services:
• Search Engine Optimization (SEO)
• Social Media Marketing
• Website Development & UI/UX Design
• Google & Meta Ads Management

To claim this exclusive offer, reply directly to this email or contact our team.

Thank You,
Yash Shinde
Marketing Head
seofox.io
    `

    const htmlContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
  <h2 style="color: #FF6B35; text-align: center; border-bottom: 2px solid #FF6B35; padding-bottom: 10px;">Digital Health Score Report</h2>
  
  <p>Hi <strong>${lead.full_name}</strong>,</p>
  
  <p>Thank you for participating in the <strong>Digital Health Score Challenge</strong> at our exhibition event. It was a pleasure connecting with you and learning about <strong>${lead.company_name}</strong>.</p>
  
  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
    <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #666; letter-spacing: 1px;">Overall Score</p>
    <p style="margin: 5px 0 0 0; font-size: 48px; font-weight: bold; color: #FF6B35;">${audit.overall_score}<span style="font-size: 20px; color: #999;">/100</span></p>
  </div>

  <h3 style="color: #e53e3e;">⚠️ Critical Areas of Improvement</h3>
  ${htmlIssues ? `<ul style="padding-left: 20px;">${htmlIssues}</ul>` : '<p>No critical issues found! Your website is performing well.</p>'}
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/challenge/report/${lead.id}" style="background-color: #FF6B35; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; box-shadow: 0 4px 6px rgba(255,107,53,0.2);">
      View Full Interactive Report
    </a>
  </div>

  <hr style="border: 0; border-top: 1px solid #eee; margin: 35px 0;" />

  <h3 style="color: #2b6cb0;">🎁 Exclusive 50% Off Marketing Services</h3>
  <p>To celebrate the event, we are offering ${lead.company_name} a <strong>50% discount</strong> on our digital growth solutions for a limited time:</p>
  <ul style="padding-left: 20px;">
    <li>Search Engine Optimization (SEO)</li>
    <li>Social Media Marketing</li>
    <li>Premium Website Design & Next.js Development</li>
    <li>Google & Meta Ads Campaigns</li>
  </ul>
  
  <p>Simply reply to this email or reach out to us at <strong>contact@seofox.io</strong> to get started.</p>

  <p style="margin-top: 40px; font-size: 14px; color: #333; font-weight: bold;">
    Thank You,<br />
    Yash Shinde<br />
    Marketing Head<br />
    seofox.io
  </p>
</div>
    `

    const payload = {
      to: lead.email,
      subject: `Your Digital Health Score Report - ${lead.company_name}`,
      text: plainTextContent,
      html: htmlContent,
    }

    const provider = getEmailProvider()
    const result = await provider.send(payload)
    
    if (result.success) {
      console.log(`✅ Email sent successfully to: ${lead.email}`)
      return true
    } else {
      console.error(`❌ Email provider failed: ${result.error}`)
      return false
    }
  } catch (error) {
    console.error('❌ Failed to construct or send email:', error)
    return false
  }
}

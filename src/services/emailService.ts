import { Lead, AuditResult } from '@/types'

export async function sendWelcomeEmail(lead: Lead, audit: AuditResult) {
  console.log('\n📧 emailService.sendWelcomeEmail() called for:', lead.email)
  try {
    // Get 3 major issues from audit
    const improvements = audit.audit_data?.improvements || []
    const top3Issues = improvements.slice(0, 3).join('\n')

    // Template with variables
    const emailContent = `
Hi ${lead.full_name},

Thank you for participating in the **Digital Health Score Challenge** at our event. It was a pleasure connecting with you and learning about **${lead.company_name}**.

We've analyzed **${lead.company_name}'s** online presence and hope the report provided valuable insights into your website, SEO, and social media performance.

**Your Digital Health Score: ${audit.overall_score}/100**

---

**🔴 Top 3 Issues Found:**

${top3Issues}

---

As a special thank-you for participating, we're offering **${lead.company_name}** an **exclusive 50% discount** on our digital marketing services for a limited time.

This offer is available on:

* Search Engine Optimization (SEO)
* Social Media Marketing
* Website Development
* Google Ads
* Meta Ads

Whether you're looking to generate more leads, improve your Google rankings, or strengthen your online brand, our team would be delighted to help **${lead.company_name}** achieve its digital growth goals.

To claim your exclusive offer, simply reply to this email or contact us using the details below.

---

**seofox.io**
Office No. 17, Vedant Complex, Vartak Nagar, Thane

📧 contact@seofox.io
📞 +91 876-753-2568
🌐 seofox.io

Best regards,

**Yash Shinde**
Marketing Head | seofox.io
    `

    // Send via API endpoint
    const payload = {
      to: lead.email,
      subject: `Your Digital Health Score Report - ${lead.company_name}`,
      text: emailContent,
      name: lead.full_name,
      company: lead.company_name,
      score: audit.overall_score,
    }

    console.log('📤 Calling /api/email/send with:', {
      to: payload.to,
      subject: payload.subject,
    })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    const responseText = await response.text()
    console.log('📥 Email API response status:', response.status)
    console.log('📥 Email API response body:', responseText)

    if (response.ok) {
      console.log('✅ Email sent successfully to', lead.email)
      return true
    } else {
      console.error('❌ Email API returned error:', response.status, responseText)
      return false
    }
  } catch (error) {
    console.error('❌ Error calling email service:', error)
    return false
  }
}

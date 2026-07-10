# Email Setup Guide - Digital Health Score Challenge

## Overview

After a lead submits the form, they automatically receive a personalized welcome email with:
- Their Digital Health Score
- 50% discount offer
- Next steps for consultation

The email service is **optional but recommended**.

---

## Free Email Service Options

### Option 1: Resend (RECOMMENDED - Most Easy for Next.js)

**Free Tier:** 100 emails/day

1. **Sign up** at [resend.com](https://resend.com)
2. **Get API Key** from Settings → API Keys
3. **Install package:**
   ```bash
   npm install resend
   ```

4. **Add to `.env.local`:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

5. **Update API route** (`src/app/api/email/send/route.ts`):

   Replace the placeholder code with:
   ```typescript
   import { Resend } from 'resend'
   
   const resend = new Resend(process.env.RESEND_API_KEY)
   
   export async function POST(req: NextRequest) {
     try {
       const { to, subject, text } = await req.json()
   
       const result = await resend.emails.send({
         from: 'SEOFox <noreply@seofox.io>',
         to: to,
         subject: subject,
         text: text,
         html: `<pre style="font-family: Arial, sans-serif; line-height: 1.6;">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`,
       })
   
       if (result.error) throw result.error
   
       return NextResponse.json({ success: true, id: result.data?.id })
     } catch (error) {
       console.error('Email error:', error)
       return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
     }
   }
   ```

6. **Restart dev server:**
   ```bash
   npm run dev
   ```

7. **Test:** Submit form and check email sent!

---

### Option 2: SendGrid (Free Tier)

**Free Tier:** 100 emails/day

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get API key
3. Install:
   ```bash
   npm install @sendgrid/mail
   ```

4. Add to `.env.local`:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxx
   ```

5. Update `src/app/api/email/send/route.ts`:
   ```typescript
   import sgMail from '@sendgrid/mail'
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
   
   export async function POST(req: NextRequest) {
     try {
       const { to, subject, text } = await req.json()
   
       await sgMail.send({
         to: to,
         from: 'noreply@seofox.io',
         subject: subject,
         text: text,
       })
   
       return NextResponse.json({ success: true })
     } catch (error) {
       console.error('Email error:', error)
       return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
     }
   }
   ```

---

### Option 3: Mailgun (Free Tier)

**Free Tier:** 5,000 emails/month

1. Sign up at [mailgun.com](https://mailgun.com)
2. Get API key and domain
3. Install:
   ```bash
   npm install mailgun.js
   ```

4. Add to `.env.local`:
   ```env
   MAILGUN_API_KEY=key-xxxx
   MAILGUN_DOMAIN=sandbox123.mailgun.org
   ```

5. Update `src/app/api/email/send/route.ts`:
   ```typescript
   import mailgun from 'mailgun.js'
   
   const mg = mailgun.client({
     username: 'api',
     key: process.env.MAILGUN_API_KEY!,
   })
   
   export async function POST(req: NextRequest) {
     try {
       const { to, subject, text } = await req.json()
   
       await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
         from: 'SEOFox <noreply@seofox.io>',
         to: to,
         subject: subject,
         text: text,
       })
   
       return NextResponse.json({ success: true })
     } catch (error) {
       console.error('Email error:', error)
       return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
     }
   }
   ```

---

## Testing Emails Locally

Before deployment, test with a temporary email:
- [Mailtrap.io](https://mailtrap.io) - Free inbox for testing
- [Ethereal Email](https://ethereal.email) - Fake SMTP for testing
- Use your personal email

---

## Production Deployment

### On Vercel:

1. Add environment variables in Vercel Dashboard:
   - Settings → Environment Variables
   - Add `RESEND_API_KEY` (or your email service key)

2. Redeploy

---

## Email Template Customization

Edit `src/services/emailService.ts` to customize:
- Email content
- Variables ({{Name}}, {{Score}}, etc.)
- Discount percentage
- Company details

---

## Monitoring Emails

**Resend Dashboard:**
- View sent emails
- Check delivery status
- Monitor open rates

**SendGrid Dashboard:**
- Email logs
- Bounce/spam reports
- Analytics

---

## Troubleshooting

**Emails not sending?**
- Check API key in `.env.local`
- Verify email format is correct
- Check API service dashboard for errors
- Look at server console for error messages

**Emails going to spam?**
- Verify sender email domain
- Add SPF/DKIM records (see provider docs)
- Use branded domain instead of free tier domain

---

## Free Limits

| Service | Free Tier | Cost After |
|---------|-----------|-----------|
| Resend | 100/day | $0.20 per email |
| SendGrid | 100/day | $9.95/month |
| Mailgun | 5,000/month | $35/month |

For exhibitions with 50-100 participants, all free tiers are sufficient!

---

**Next:** Choose your email service above and implement it! 🚀

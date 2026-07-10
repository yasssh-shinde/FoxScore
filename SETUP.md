# Quick Setup Guide

## ⚡ 5-Minute Setup

### 1. Create Supabase Project (Free)

```
1. Go to supabase.com → Sign up
2. Create new project (or use existing)
3. Copy API URL and keys from Settings → API
```

### 2. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd foxscore

# Install dependencies
npm install
```

### 3. Setup Database

```
1. Go to Supabase SQL Editor
2. Create new query
3. Paste contents of supabase/migrations/001_init.sql
4. Run query
5. Wait for success
```

### 4. Environment Variables

```bash
# Copy template
cp .env.example .env.local

# Edit with your Supabase keys
# (Get from Supabase → Settings → API)
```

Paste in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_key_here
NEXT_PUBLIC_PRIZE_AMOUNT=1000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Locally

```bash
npm run dev
```

Visit: `http://localhost:3000` ✅

---

## 📋 What You Get

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `/` | Hero + CTA button |
| Form | `/challenge` | Lead capture |
| Results | `/challenge/result/[id]` | Score reveal |
| Report | `/challenge/report/[id]` | Detailed audit |
| Admin | `/admin` | Dashboard + stats |

---

## 🚀 Deploy to Vercel (Free)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Import GitHub repository
# 4. Add environment variables
# 5. Deploy button
# Done! 🎉
```

**Your app is now live at:** `https://your-project.vercel.app`

---

## 🔗 WhatsApp Integration (Optional)

Add webhook URL to `.env.local`:

```env
WHATSAPP_WEBHOOK_URL=https://your-webhook-service.com/webhook
```

After form submission, receives:
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "company": "ABC Corp",
  "website": "https://example.com",
  "score": 82
}
```

---

## ❓ FAQ

**Q: Do I need a credit card for Supabase?**
A: No, free tier works perfectly for this.

**Q: Can I change the ₹1,000 prize amount?**
A: Yes, edit `NEXT_PUBLIC_PRIZE_AMOUNT` in `.env.local`

**Q: How do I view submitted leads?**
A: Go to `/admin` or check Supabase `leads` table

**Q: Is it mobile-friendly?**
A: Yes, fully responsive for exhibitions.

**Q: Can I customize the score calculation?**
A: Yes, edit `src/services/scoreCalculator.ts`

---

## 🐛 Common Issues

**"Cannot find module '@supabase/supabase-js'"**
```bash
npm install
```

**"NEXT_PUBLIC_SUPABASE_URL is not set"**
- Check `.env.local` exists
- Verify it has correct values
- Restart dev server: `npm run dev`

**Port 3000 already in use**
```bash
npm run dev -- -p 3001
```

**Database migrations failed**
- Check SQL syntax in Supabase editor
- Verify you're in correct project
- Try running one statement at a time

---

## 📊 Database Schema

Tables created:
- `leads` - User submissions
- `audit_results` - Score calculations
- `reports` - Generated reports
- `consultation_requests` - CRM tracking
- `webhook_logs` - Integration logs

All data is private and secure on Supabase.

---

## 🎯 Next Steps

1. ✅ Run locally and test all pages
2. ✅ Customize colors (edit `tailwind.config.js`)
3. ✅ Add your branding (logo, favicon)
4. ✅ Deploy to Vercel
5. ✅ Setup WhatsApp webhook
6. ✅ Test on mobile device

---

## 📚 Full Documentation

- **Setup Details**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Project Structure**: See `PROJECT.md`
- **API Docs**: See `API.md` (coming soon)

---

**Ready?** Run `npm run dev` and start building! 🚀

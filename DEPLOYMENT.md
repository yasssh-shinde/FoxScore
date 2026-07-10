# Deployment Guide - Digital Health Score Challenge

## 🚀 Deploy to Vercel (Recommended)

Vercel is the creator of Next.js and provides the best hosting experience.

### Prerequisites
- Vercel account (free) at [vercel.com](https://vercel.com)
- GitHub repository
- Supabase project created

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/foxscore.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Click "Import"

### Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...
NEXT_PUBLIC_PRIZE_AMOUNT=1000
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
WHATSAPP_WEBHOOK_URL=https://your-webhook.com (optional)
```

3. Click "Save"

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. Your app is live! 🎉

### Step 5: Custom Domain (Optional)

1. Go to project → Settings → Domains
2. Add custom domain
3. Update DNS records in your domain provider
4. Verify domain

---

## 🌐 Alternative: Deploy to Other Platforms

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables
5. Deploy

### Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub
3. Add environment variables
4. Deploy

### Self-Hosted (Ubuntu VPS)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/foxscore.git
cd foxscore

# Install dependencies
npm install

# Build
npm run build

# Install PM2 (process manager)
sudo npm install -g pm2

# Start application
pm2 start "npm start" --name "foxscore"

# Enable auto-restart on reboot
pm2 startup
pm2 save
```

---

## 🔒 Pre-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Supabase database migrations run
- [ ] Test form submission locally
- [ ] Test result page animations
- [ ] Verify WhatsApp webhook URL (if using)
- [ ] Check mobile responsiveness
- [ ] Run lighthouse test
- [ ] Test on multiple browsers

## 📊 Monitoring

### Vercel Analytics
- Automatic performance metrics
- Deployment history
- Error tracking

### Supabase Logs
- Database query logs
- API requests
- Error logs

### Application Monitoring
Check application logs:

```bash
# Local logs
npm run dev

# Production logs (Vercel)
vercel logs

# Check specific function
vercel logs --function=api-leads
```

## 🔧 Post-Deployment

### 1. Verify Configuration
```bash
curl https://your-domain.com/api/leads/test
```

### 2. Test Lead Creation
- Fill form
- Verify data in Supabase
- Check results page

### 3. Monitor Errors
- Check Vercel dashboard
- Monitor Supabase logs
- Check console errors in browser

### 4. Enable CORS (if needed)
In Supabase → Settings → API:
- Add your domain to CORS configuration

## 🚨 Troubleshooting

### Build Fails
```bash
# Check build logs
vercel logs --since 1h

# Clear cache
vercel env pull
npm run build
```

### Database Connection Error
1. Verify Supabase URL and keys in `.env.local`
2. Check network access in Supabase settings
3. Ensure migrations were run

### Slow Performance
- Check Core Web Vitals in Vercel Analytics
- Optimize images
- Enable compression
- Use CDN for static files

### Forms Not Submitting
- Check browser console for errors
- Verify API routes are deployed
- Check CORS configuration
- Ensure Supabase tables exist

## 📈 Scaling

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_leads_score ON audit_results(overall_score);
CREATE INDEX idx_leads_date ON leads(created_at DESC);
```

### Caching
- Enable edge caching in Vercel
- Set proper cache headers
- Use Redis for session storage (future)

### Load Balancing
- Automatic with Vercel
- Scales based on traffic

## 🔄 CI/CD Pipeline

Vercel automatically:
1. Runs on every push to main
2. Creates preview deployments for PRs
3. Runs ESLint checks
4. Builds and deploys

Custom deployment script:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "outputDirectory": ".next"
}
```

## 📝 Environment Variables Checklist

**Required:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

**Optional:**
- `WHATSAPP_WEBHOOK_URL`
- `NEXT_PUBLIC_PRIZE_AMOUNT`
- `NEXT_PUBLIC_APP_URL`

## 🔐 Security Checklist

- [ ] Environment variables not committed to git
- [ ] Database backups enabled
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] SQL injection protection
- [ ] XSS protection

## 📞 Support

If deployment fails:

1. Check Vercel logs: `vercel logs`
2. Check Supabase status page
3. Verify environment variables
4. Check GitHub repository access
5. Contact support@vercel.com

---

**Last Updated**: 2026-07-09
**Recommended Platform**: Vercel (free tier sufficient)

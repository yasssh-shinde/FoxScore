# Digital Health Score Challenge - Project Specification

## Overview

A production-ready web application for SEOFox to attract business owners at exhibitions, collect qualified leads, and automatically audit their online presence. The application generates a Digital Health Score (0-100) and encourages booking of SEO/Social Media Marketing services.

**Target Users**: Business owners at exhibitions
**Primary Goal**: Lead generation + Digital Health Assessment
**Deployment**: Vercel

---

## Tech Stack

- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn UI components
- **UI Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Data Visualization**: Recharts
- **Backend**: Next.js Server Actions + API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Admin dashboard)
- **PDF Generation**: Placeholder (jsPDF + html2canvas)
- **QR Code**: qrcode.react
- **Deployment**: Vercel
- **Analytics**: Placeholder (Google Analytics 4)

---

## Project Structure

```
foxscore/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Landing page
│   │   │   ├── challenge/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx              # Registration form
│   │   │   │   ├── result/[id]/page.tsx  # Results screen
│   │   │   │   └── report/[id]/page.tsx  # Report details
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Dashboard
│   │   │   ├── leads/page.tsx            # Leads list
│   │   │   ├── leads/[id]/page.tsx       # Lead details
│   │   │   ├── reports/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── audit/
│   │   │   │   ├── calculate-score/route.ts
│   │   │   │   ├── get-domain-age/route.ts
│   │   │   │   ├── check-https/route.ts
│   │   │   │   ├── check-page-speed/route.ts
│   │   │   │   ├── check-meta-tags/route.ts
│   │   │   │   ├── check-robots/route.ts
│   │   │   │   ├── check-sitemap/route.ts
│   │   │   │   ├── check-google-business/route.ts
│   │   │   │   ├── check-social/route.ts
│   │   │   │   └── check-ssl/route.ts
│   │   │   ├── leads/
│   │   │   │   ├── route.ts              # Create lead
│   │   │   │   └── [id]/route.ts         # Get lead
│   │   │   ├── reports/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── webhooks/
│   │   │   │   └── whatsapp/route.ts
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── session/route.ts
│   │   │   └── admin/
│   │   │       ├── dashboard/route.ts
│   │   │       ├── export/route.ts
│   │   │       └── stats/route.ts
│   │   ├── layout.tsx                    # Root layout
│   │   ├── globals.css
│   │   └── error.tsx
│   ├── components/
│   │   ├── landing/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesGrid.tsx
│   │   │   ├── PrizeCard.tsx
│   │   │   └── CTAButton.tsx
│   │   ├── challenge/
│   │   │   ├── RegistrationForm.tsx
│   │   │   ├── ScoreGuessInput.tsx
│   │   │   ├── WebsiteInput.tsx
│   │   │   ├── SocialMediaInputs.tsx
│   │   │   ├── TermsCheckbox.tsx
│   │   │   └── SubmitButton.tsx
│   │   ├── results/
│   │   │   ├── ScoreReveal.tsx
│   │   │   ├── ScoreCircle.tsx
│   │   │   ├── Improvements.tsx
│   │   │   ├── Strengths.tsx
│   │   │   ├── PrizeAnimation.tsx
│   │   │   ├── ConfettiAnimation.tsx
│   │   │   ├── MarketingRatingQuestion.tsx
│   │   │   └── ConsultationCTA.tsx
│   │   ├── report/
│   │   │   ├── ReportHeader.tsx
│   │   │   ├── ScoreSummary.tsx
│   │   │   ├── DetailedAudit.tsx
│   │   │   ├── AuditChart.tsx
│   │   │   ├── RecommendationsSection.tsx
│   │   │   ├── DownloadPDFButton.tsx
│   │   │   └── ShareQRCode.tsx
│   │   ├── admin/
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── ChartSection.tsx
│   │   │   ├── LeadsTable.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── ExportButton.tsx
│   │   │   └── LeadDetailCard.tsx
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Modal.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Checkbox.tsx
│   │       ├── Slider.tsx
│   │       ├── Badge.tsx
│   │       ├── Progress.tsx
│   │       └── Tabs.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useForm.ts
│   │   ├── useFetch.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── useToast.ts
│   ├── services/
│   │   ├── audit/
│   │   │   ├── scoreCalculator.ts        # Main scoring logic
│   │   │   ├── websiteAudit.ts           # Website checks
│   │   │   ├── seoAudit.ts               # SEO checks
│   │   │   ├── googleAudit.ts            # Google Business checks
│   │   │   ├── socialAudit.ts            # Social media checks
│   │   │   ├── engagementAudit.ts        # Engagement metrics
│   │   │   └── auditUtils.ts             # Helper functions
│   │   ├── api/
│   │   │   ├── leadService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── auditService.ts
│   │   │   └── adminService.ts
│   │   ├── external/
│   │   │   ├── whatsappService.ts
│   │   │   ├── emailService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── pdfService.ts
│   │   └── database/
│   │       ├── supabaseClient.ts
│   │       ├── leadsQueries.ts
│   │       ├── reportsQueries.ts
│   │       ├── auditQueries.ts
│   │       └── adminQueries.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── scoreWeightage.ts
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   └── urlParser.ts
│   ├── types/
│   │   ├── index.ts                      # Main exports
│   │   ├── lead.ts
│   │   ├── report.ts
│   │   ├── audit.ts
│   │   ├── score.ts
│   │   ├── api.ts
│   │   ├── form.ts
│   │   └── admin.ts
│   ├── styles/
│   │   ├── globals.css                   # Tailwind + global styles
│   │   ├── animations.css                # Animation definitions
│   │   └── variables.css                 # CSS variables
│   ├── config/
│   │   ├── site.ts                       # Site config
│   │   ├── scoreWeights.ts               # Score weightage config
│   │   └── theme.ts                      # Theme config
│   └── middleware.ts
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── og-image.png
│   └── icons/
│       └── check.svg
├── .env.example
├── .env.local                             # Local (git ignored)
├── .env.production                        # Production (git ignored)
├── eslint.config.js
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── package.json
├── README.md
├── PROJECT.md                             # This file
├── SETUP.md                               # Setup instructions
├── DATABASE.md                            # Database schema
├── API.md                                 # API documentation
└── DEPLOYMENT.md                          # Deployment guide
```

---

## Database Schema (Supabase)

### Tables

#### 1. `users` (Admin)
```sql
id: UUID (PK)
email: VARCHAR (UNIQUE)
password_hash: VARCHAR
name: VARCHAR
role: ENUM ('admin', 'superadmin')
created_at: TIMESTAMP
updated_at: TIMESTAMP
last_login: TIMESTAMP
```

#### 2. `leads`
```sql
id: UUID (PK)
reference_id: VARCHAR (UNIQUE, auto-generated)
full_name: VARCHAR
company_name: VARCHAR
mobile_number: VARCHAR
email: VARCHAR
website_url: VARCHAR
google_business_url: VARCHAR (NULL)
instagram_url: VARCHAR (NULL)
facebook_url: VARCHAR (NULL)
linkedin_url: VARCHAR (NULL)
guessed_score: INTEGER (0-100)
actual_score: INTEGER (0-100)
won_prize: BOOLEAN (default: false)
marketing_rating: INTEGER (1-5, NULL)
consultation_requested: BOOLEAN (default: false)
created_at: TIMESTAMP
updated_at: TIMESTAMP
ip_address: VARCHAR (NULL)
device_info: JSONB (NULL)
```

#### 3. `audit_results`
```sql
id: UUID (PK)
lead_id: UUID (FK → leads.id)
website_score: DECIMAL (0-100)
seo_score: DECIMAL (0-100)
google_score: DECIMAL (0-100)
social_score: DECIMAL (0-100)
overall_score: DECIMAL (0-100)
audit_data: JSONB (detailed results)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### 4. `audit_details` (Detailed findings)
```sql
id: UUID (PK)
audit_result_id: UUID (FK → audit_results.id)
category: VARCHAR ('website', 'seo', 'google', 'social', 'engagement')
metric: VARCHAR
status: ENUM ('pass', 'fail', 'warning', 'pending')
value: VARCHAR (NULL)
description: TEXT
weight: DECIMAL
score_contribution: DECIMAL
created_at: TIMESTAMP
```

#### 5. `reports`
```sql
id: UUID (PK)
lead_id: UUID (FK → leads.id)
audit_result_id: UUID (FK → audit_results.id)
pdf_url: VARCHAR (NULL)
qr_code: TEXT (NULL)
report_data: JSONB
generated_at: TIMESTAMP
downloaded_at: TIMESTAMP (NULL)
emailed_at: TIMESTAMP (NULL)
```

#### 6. `marketing_ratings`
```sql
id: UUID (PK)
lead_id: UUID (FK → leads.id)
rating: INTEGER (1-5)
created_at: TIMESTAMP
```

#### 7. `consultation_requests`
```sql
id: UUID (PK)
lead_id: UUID (FK → leads.id)
status: ENUM ('pending', 'contacted', 'booked', 'completed', 'rejected')
requested_at: TIMESTAMP
contacted_at: TIMESTAMP (NULL)
notes: TEXT (NULL)
assigned_to: UUID (FK → users.id, NULL)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### 8. `webhook_logs`
```sql
id: UUID (PK)
event_type: VARCHAR ('lead_created', 'score_calculated', etc.)
lead_id: UUID (FK → leads.id, NULL)
payload: JSONB
response_status: INTEGER (NULL)
response_body: JSONB (NULL)
error: TEXT (NULL)
created_at: TIMESTAMP
```

#### 9. `settings`
```sql
id: UUID (PK)
key: VARCHAR (UNIQUE)
value: JSONB
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

---

## Digital Health Score Calculation

### Weightage Structure

| Category | Weight | Points |
|----------|--------|--------|
| **Website (30%)** | | 30 |
| - Has Website | 5% | 5 |
| - HTTPS | 5% | 5 |
| - Mobile Friendly | 5% | 5 |
| - Page Speed | 5% | 5 |
| - Meta Title | 3% | 3 |
| - Meta Description | 2% | 2 |
| **SEO (25%)** | | 25 |
| - Domain Age | 5% | 5 |
| - Indexed Pages | 5% | 5 |
| - Broken Links | 5% | 5 |
| - Image ALT Tags | 5% | 5 |
| - Basic SEO Health | 5% | 5 |
| **Google (20%)** | | 20 |
| - Google Business Exists | 8% | 8 |
| - Reviews Count | 7% | 7 |
| - Ratings | 5% | 5 |
| **Social (15%)** | | 15 |
| - Instagram Presence | 5% | 5 |
| - Facebook Presence | 5% | 5 |
| - LinkedIn Presence | 5% | 5 |
| **Engagement (10%)** | | 10 |
| - Follower Count | 5% | 5 |
| - Post Frequency | 5% | 5 |
| | **TOTAL** | **100** |

---

## API Routes

### Lead Management
- `POST /api/leads` - Create lead + trigger audit
- `GET /api/leads` - List leads (admin)
- `GET /api/leads/[id]` - Get lead details
- `PATCH /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead (admin)

### Audit & Scoring
- `POST /api/audit/calculate-score` - Calculate Digital Health Score
- `GET /api/audit/get-domain-age` - Get domain age
- `GET /api/audit/check-https` - Check SSL
- `GET /api/audit/check-page-speed` - Check page speed
- `GET /api/audit/check-meta-tags` - Check meta tags
- `GET /api/audit/check-robots` - Check robots.txt
- `GET /api/audit/check-sitemap` - Check sitemap
- `GET /api/audit/check-google-business` - Check Google Business
- `GET /api/audit/check-social` - Check social media
- `GET /api/audit/[id]` - Get audit results

### Reports
- `GET /api/reports/[id]` - Get report
- `POST /api/reports/[id]/generate-pdf` - Generate PDF
- `GET /api/reports/[id]/qr-code` - Get QR code
- `POST /api/reports/[id]/email` - Email report

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/stats` - Detailed stats
- `GET /api/admin/leads` - All leads with filters
- `POST /api/admin/export` - Export CSV
- `GET /api/admin/analytics` - Analytics data

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/session` - Get session

### Webhooks
- `POST /api/webhooks/whatsapp` - WhatsApp trigger
- `POST /api/webhooks/email` - Email trigger

---

## Key Components

### Landing Page (`/`)
- Hero section with headline
- Features grid (4 features)
- Prize card
- Large CTA button
- Responsive design
- Dark theme with gradients

### Challenge Form (`/challenge`)
- Multi-step form or single page
- Input validation
- Progress indicator
- Score guess slider
- Website URL validation
- Social media links (optional)
- Terms acceptance
- Smooth animations

### Result Screen (`/challenge/result/[id]`)
- Animated score reveal (0 to final score)
- Circular progress indicator
- Prize logic (match/no match)
- Confetti animation (if won)
- Improvements list (top 3)
- Strengths list (top 3)
- Marketing rating question
- Consultation CTA
- Download report button

### Report Page (`/challenge/report/[id]`)
- Company name & website
- Overall score (large display)
- Score breakdown (website, SEO, Google, social)
- Detailed audit results
- Recommendations
- QR code
- Download PDF button
- Share options

### Admin Dashboard (`/admin`)
- Protected route (login required)
- KPI cards (total leads, avg score, etc.)
- Charts (score distribution, etc.)
- Recent leads table
- Filter and search
- Export functionality

### Admin Leads (`/admin/leads`)
- Leads table with sorting/filtering
- Search functionality
- Bulk actions
- Consultation status tracking
- Lead detail modal/page

### Admin Lead Details (`/admin/leads/[id]`)
- Full lead information
- Audit results
- Report
- Consultation request management
- Notes section
- Action buttons (email, WhatsApp, etc.)

---

## Features Checklist

### Core Features
- [ ] Landing page with hero section
- [ ] Registration form with lead capture
- [ ] Digital Health Score calculation
- [ ] Animated results screen
- [ ] PDF report generation
- [ ] Admin dashboard
- [ ] Lead management
- [ ] Consultation request tracking

### API & Backend
- [ ] Lead creation & storage
- [ ] Audit score calculation
- [ ] Supabase integration
- [ ] WhatsApp webhook
- [ ] Error handling & logging
- [ ] Rate limiting
- [ ] Input validation

### UI/UX
- [ ] Dark theme with SEOFox branding
- [ ] Glassmorphism effects
- [ ] Gradient backgrounds
- [ ] Smooth animations (Framer Motion)
- [ ] Loading states
- [ ] Empty states
- [ ] Error messages
- [ ] Toast notifications
- [ ] Responsive design

### Bonus Features
- [ ] Leaderboard (top scores)
- [ ] QR code generation
- [ ] Unique reference ID
- [ ] Email report capability
- [ ] Fireworks animation
- [ ] PWA support
- [ ] Dark/Light mode toggle
- [ ] Analytics tracking
- [ ] CSV export

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Admin Auth
ADMIN_EMAIL=admin@seofox.com
ADMIN_PASSWORD_HASH=xxx

# Webhooks
WHATSAPP_WEBHOOK_URL=https://xxx
WHATSAPP_API_KEY=xxx
EMAIL_SERVICE_URL=https://xxx

# External APIs (Placeholders)
GOOGLE_API_KEY=xxx
SOCIAL_API_KEY=xxx

# App Config
NEXT_PUBLIC_APP_NAME=Digital Health Score Challenge
NEXT_PUBLIC_APP_URL=https://challenge.seofox.com
NEXT_PUBLIC_PRIZE_AMOUNT=1000

# Analytics
NEXT_PUBLIC_GA_ID=xxx

# Vercel (Auto-configured)
VERCEL_URL=xxx
```

---

## Authentication & Security

- Admin dashboard protected with Supabase Auth
- Email + password login
- Session management
- CORS configuration
- Input validation & sanitization
- XSS protection
- CSRF tokens (if needed)
- Rate limiting on APIs
- Environment variable protection

---

## Deployment

### Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy main branch
4. Auto-deploy on push
5. Preview deployments for PRs

### Supabase
1. Create PostgreSQL database
2. Run migrations (SQL files)
3. Set up auth
4. Configure RLS (Row Level Security)
5. Generate API keys

---

## Performance Targets

- Lighthouse Score: 90+
- Core Web Vitals: Good
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.5s

---

## Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast (4.5:1 minimum)
- Alt text on images
- ARIA labels
- Focus indicators

---

## Monitoring & Analytics

- Vercel Analytics
- Google Analytics 4
- Error tracking (Sentry - optional)
- Database query logs
- Webhook delivery logs
- Email delivery logs

---

## Next Steps

1. Set up Next.js project with TypeScript
2. Install dependencies
3. Configure Tailwind CSS & Shadcn UI
4. Create database schema on Supabase
5. Implement authentication
6. Build components (landing, form, results, admin)
7. Implement audit service
8. Test and optimize
9. Deploy to Vercel

---

## Development Roadmap

### Phase 1: Core (Week 1-2)
- Project setup
- Database schema
- Landing page
- Registration form
- Basic audit service

### Phase 2: Integration (Week 2-3)
- Score calculation
- Results screen
- Report generation
- Admin dashboard
- WhatsApp webhook

### Phase 3: Polish (Week 3)
- Animations & UI
- Error handling
- Testing
- Performance optimization

### Phase 4: Deployment (Week 4)
- Vercel setup
- Environment configuration
- Security audit
- Go live

---

**Last Updated**: 2026-07-09
**Status**: Planning Phase
**Next Review**: After Phase 1 completion

# 🗄️ Database Migrations Guide

Run these migrations in order to set up all the new features.

---

## 📋 Migrations to Apply

### **Migration 1: Team Management Tables**
**File:** `supabase/migrations/002_add_team_management.sql`

Creates:
- `team_members` table
- `lead_assignments` table
- `follow_up_reminders` table

**Status:** ⏳ Needs to be run

---

### **Migration 2: Add checked_by Field**
**File:** `supabase/migrations/003_add_checked_by_field.sql`

Adds:
- `checked_by` column to leads table
- Tracks which team member checked the score

**Status:** ⏳ Needs to be run

---

### **Migration 3: Seed Team Members**
**File:** `supabase/migrations/004_seed_team_members.sql`

Adds these 5 team members automatically:
- ✅ Yash (Admin) - yash@seofox.io
- ✅ Dnya (Manager) - dnya@seofox.io
- ✅ Achyut (Manager) - achyut@seofox.io
- ✅ Vaibhav (Manager) - vaibhav@seofox.io
- ✅ Gargi (Manager) - gargi@seofox.io

**Status:** ⏳ Needs to be run

---

## 🚀 How to Apply Migrations

### **Step 1: Open Supabase Dashboard**
Go to: https://app.supabase.com

### **Step 2: Go to SQL Editor**
1. Select your project
2. Click "SQL Editor" in sidebar
3. Click "New Query"

### **Step 3: Run Migrations in Order**

#### **First: Migration 002**
```sql
-- Copy contents of: supabase/migrations/002_add_team_management.sql
-- Paste here and click "Run"
```

#### **Then: Migration 003**
```sql
-- Copy contents of: supabase/migrations/003_add_checked_by_field.sql
-- Paste here and click "Run"
```

#### **Finally: Migration 004**
```sql
-- Copy contents of: supabase/migrations/004_seed_team_members.sql
-- Paste here and click "Run"
```

---

## ✅ Verification

After running migrations, you should have:

✅ 5 team members in the database  
✅ Lead assignments working  
✅ Follow-up reminders working  
✅ Challenge page showing team member dropdown  

---

## 🧪 Test It

1. Start app: `npm run dev`
2. Go to `/challenge`
3. Should see dropdown with 5 team members
4. Go to `/admin` → any section
5. Should see team members listed

---

## 📊 Database Schema After Migrations

```
leads (updated)
├── id, reference_id
├── full_name, company_name, email, mobile_number
├── website_url, google_business_url, instagram_url, facebook_url, linkedin_url
├── guessed_score, actual_score, won_prize
├── checked_by → FK(team_members.id) [NEW]
└── created_at, updated_at

team_members [NEW]
├── id, name, email
├── role (admin|manager|member)
├── status (active|inactive)
└── created_at, updated_at

lead_assignments [NEW]
├── id, lead_id → FK(leads.id), assigned_to → FK(team_members.id)
├── status (assigned|contacted|followed_up|closed)
├── contacted_at, notes
└── created_at, updated_at

follow_up_reminders [NEW]
├── id, lead_id → FK(leads.id), assigned_to → FK(team_members.id)
├── reminder_date, reminder_type (email|sms|in_app)
├── status (pending|sent|completed|skipped)
├── title, description
├── sent_at, completed_at
└── created_at, updated_at
```

---

## ⚠️ Important Notes

- Run migrations in order (002 → 003 → 004)
- If you get "already exists" errors, that table was already created
- The seed migration uses `ON CONFLICT (email) DO NOTHING`, so it won't duplicate team members if run multiple times
- Team members will have these emails:
  - yash@seofox.io
  - dnya@seofox.io
  - achyut@seofox.io
  - vaibhav@seofox.io
  - gargi@seofox.io

---

## 🆘 Troubleshooting

### "Relation does not exist"
**Solution:** Run migration 002 first

### "Column already exists"
**Solution:** That's OK, migrations are idempotent

### Team members not showing in dropdown
**Solution:** Make sure migration 004 was run to seed team members

### "Duplicate key value violates unique constraint"
**Solution:** Team member with that email already exists, that's OK

---

**Status:** Ready to apply! 🚀

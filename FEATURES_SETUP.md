# New Features Setup Guide

This guide explains the 4 new features that have been added to FoxScore and how to set them up.

## ✨ Features Added

### 1. **Lead Dashboard** (`/admin/leads`)
Comprehensive dashboard for viewing and managing all captured leads.

**Features:**
- View all leads in a searchable, paginated table
- Filter by name, company, or email
- See lead scores and assignment status
- Quick assign/follow-up actions

**Database Tables Used:**
- `leads` - Core lead data
- `lead_assignments` - Track which team member is assigned
- `audit_results` - Contains calculated scores

**API Endpoint:** `GET /api/leads`

---

### 2. **Team Management** (`/admin/team`)
Add and manage team members who will handle leads.

**Features:**
- Add new team members with name, email, and role
- View all active team members
- Assign roles: Member, Manager, Admin
- Track when team members were added

**Database Tables Used:**
- `team_members` - Store team member info

**API Endpoints:**
- `GET /api/team-members` - Fetch all team members
- `POST /api/team-members` - Add new team member

---

### 3. **Lead Follow-up Reminders** (`/admin/reminders`)
Schedule and manage follow-up reminders for leads.

**Features:**
- Create reminders for specific leads and team members
- Set reminder date/time
- Filter reminders by status: Pending, Sent, Completed
- Visual alerts for overdue reminders
- Mark reminders as sent/completed

**Database Tables Used:**
- `follow_up_reminders` - Store reminder data
- `lead_assignments` - Link to assigned team members

**API Endpoint:** `/api/follow-up-reminders`

---

### 4. **Export Leads to CSV** (`/api/leads/export`)
Download all leads and their data as a CSV file for Excel, Google Sheets, etc.

**Features:**
- Export all lead data including scores
- Includes assignment and contact history
- One-click download
- Automatic timestamp in filename

**CSV Columns Included:**
- Reference ID
- Name
- Company
- Email
- Mobile
- Website
- Guessed Score
- Actual Score
- Won Prize (Yes/No)
- Assigned To
- Status
- Contacted At
- Created At

**API Endpoint:** `GET /api/leads/export`

---

## 🗄️ Database Migrations Required

Run the following migration to create necessary tables:

**File:** `supabase/migrations/002_add_team_management.sql`

This creates:
1. `team_members` table
2. `lead_assignments` table
3. `follow_up_reminders` table

**How to apply migration:**
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `supabase/migrations/002_add_team_management.sql`
4. Run the query

---

## 📁 New Files Created

### Pages/Components:
- `src/app/admin/leads/page.tsx` - Lead Dashboard
- `src/app/admin/team/page.tsx` - Team Management
- `src/app/admin/reminders/page.tsx` - Follow-up Reminders
- `src/app/admin/page.tsx` - Updated with navigation

### API Routes:
- `src/app/api/leads/route.ts` - Enhanced with GET (was POST only)
- `src/app/api/team-members/route.ts` - New
- `src/app/api/lead-assignments/route.ts` - New
- `src/app/api/follow-up-reminders/route.ts` - New
- `src/app/api/leads/export/route.ts` - New

### Types:
- `src/types/index.ts` - Added TeamMember, LeadAssignment, FollowUpReminder types

### Database:
- `supabase/migrations/002_add_team_management.sql` - New migration

---

## 🚀 Getting Started

### Step 1: Apply Database Migration
1. Open Supabase Dashboard
2. Go to SQL Editor → New Query
3. Copy and paste `supabase/migrations/002_add_team_management.sql`
4. Click Run

### Step 2: Access the Admin Panel
1. Start your app: `npm run dev`
2. Go to `http://localhost:3000/admin`
3. You'll see navigation buttons for:
   - Lead Dashboard
   - Team Management
   - Follow-up Reminders
   - Export Leads

### Step 3: Add Team Members
1. Go to `/admin/team`
2. Click "Add Team Member"
3. Enter name, email, and role
4. Click "Add Member"

### Step 4: Manage Leads
1. Go to `/admin/leads`
2. Search for leads by name, company, or email
3. Click "Assign" to assign a lead to a team member
4. Click "Remind" to create a follow-up reminder

### Step 5: Export Data
1. Go to `/admin/leads`
2. Click "📥 Export CSV" button
3. CSV file will download automatically

---

## 🔗 API Usage Examples

### Fetch Leads with Filters
```bash
GET /api/leads?search=john&page=1&limit=20&sortBy=created_at&sortOrder=desc
```

### Create a Follow-up Reminder
```bash
POST /api/follow-up-reminders
Content-Type: application/json

{
  "lead_id": "123e4567-e89b-12d3-a456-426614174000",
  "assigned_to": "team-member-id",
  "reminder_date": "2026-07-15T14:00:00",
  "title": "Follow-up call",
  "description": "Discuss pricing options"
}
```

### Export Leads as CSV
```bash
GET /api/leads/export
# Returns: CSV file download
```

---

## 📊 Database Schema

### team_members
```sql
- id (UUID)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- role (VARCHAR: admin|manager|member)
- status (VARCHAR: active|inactive)
- created_at, updated_at (TIMESTAMP)
```

### lead_assignments
```sql
- id (UUID)
- lead_id (UUID) → references leads
- assigned_to (UUID) → references team_members
- assigned_by (UUID) → references team_members
- status (VARCHAR: assigned|contacted|followed_up|closed)
- contacted_at (TIMESTAMP, nullable)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

### follow_up_reminders
```sql
- id (UUID)
- lead_id (UUID) → references leads
- assigned_to (UUID) → references team_members
- reminder_date (TIMESTAMP)
- reminder_type (VARCHAR: email|sms|in_app)
- status (VARCHAR: pending|sent|completed|skipped)
- title (VARCHAR)
- description (TEXT)
- sent_at, completed_at (TIMESTAMP, nullable)
- created_at, updated_at (TIMESTAMP)
```

---

## 🔐 Security Notes

All tables have:
- Row Level Security (RLS) enabled
- Currently allows public access (update in production)
- Indexes on foreign keys for performance
- Audit timestamps (created_at, updated_at)

For production, update RLS policies in Supabase:
```sql
-- Restrict to authenticated users only
CREATE POLICY "authenticated users only" ON team_members
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 🐛 Troubleshooting

### "Relation does not exist" Error
**Solution:** Run the migration `002_add_team_management.sql`

### CSV Export Downloads Empty File
**Solution:** Make sure leads exist in database and API is working

### Can't See Team Members Dropdown
**Solution:** Go to `/admin/team` and add at least one team member first

### Reminders Not Showing
**Solution:** Make sure reminders are assigned to active team members

---

## 🎯 Next Steps

- Set up email notifications for reminders
- Add SMS reminder capability
- Create automated lead assignment rules
- Build analytics dashboard with charts
- Add team member performance metrics
- Integrate CRM with webhook

---

**Happy managing! 🚀**

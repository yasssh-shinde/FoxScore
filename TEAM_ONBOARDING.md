# 🚀 Team Onboarding Guide

Welcome to the FoxScore Lead Management System! Here's everything you need to know to get started.

---

## 👥 Your Marketing Team

✅ **Yash** (Admin) - yash@seofox.io  
✅ **Dnya** (Manager) - dnya@seofox.io  
✅ **Achyut** (Manager) - achyut@seofox.io  
✅ **Vaibhav** (Manager) - vaibhav@seofox.io  
✅ **Gargi** (Manager) - gargi@seofox.io  

---

## 📋 Quick Start (5 Steps)

### **Step 1: Add Team Members (First Time Only)**
1. Go to `http://localhost:3000/admin`
2. Click the **🚀 Setup** card (green border)
3. Click **✅ Add All Team Members**
4. Wait for confirmation ✅

### **Step 2: Go to Lead Dashboard**
1. Click the **📋 Lead Dashboard** card
2. You'll see all leads from the Digital Health Score Challenge

### **Step 3: Assign Leads to Team Members**
1. Find a lead in the table
2. Click the **Assign** button
3. Select a team member from dropdown
4. Click **Assign**

### **Step 4: Create Follow-up Reminders**
1. Click the **Remind** button on any lead
2. Select a team member
3. Set date/time for follow-up
4. Add optional title/notes
5. Click **Create**

### **Step 5: Check Reminders**
1. Click **⏰ Follow-up Reminders** card
2. See all pending reminders
3. Mark as "Sent" or "Done" when completed

---

## 🎯 How It Works

```
New Lead Submits Form
        ↓
Score Calculated & Stored
        ↓
Lead Appears in Dashboard
        ↓
Assign to Team Member
        ↓
Create Follow-up Reminder
        ↓
Team Member Follows Up
        ↓
Mark Reminder as Done
```

---

## 📊 Dashboard Features

### **Lead Dashboard** (`/admin/leads`)
- **Search** - Find leads by name, company, or email
- **Assign** - Give leads to team members
- **Remind** - Schedule follow-ups
- **Export** - Download all leads as CSV

### **Team Management** (`/admin/team`)
- View all team members
- Add new members
- Set roles (Admin, Manager, Member)

### **Follow-up Reminders** (`/admin/reminders`)
- See all pending reminders
- Filter by status: Pending, Sent, Completed
- Mark as done when followed up
- ⚠️ Red highlight = Overdue reminder

---

## 💡 Tips & Tricks

### **🔍 Smart Search**
- Type in search box to find leads instantly
- Search by: Name, Company, Email
- Results filter as you type

### **⏰ Reminder Strategy**
- Create reminders for 24-48 hours after assignment
- Set different reminders for different follow-ups:
  - First follow-up: Next day
  - Second follow-up: 3 days later
  - Final follow-up: 1 week later

### **📥 Export Data**
- Click "📥 Export CSV" anytime to download leads
- Great for Excel, Google Sheets, CRM imports
- File includes: Names, emails, scores, assignments

### **🔔 Status Tracking**
- **Assigned** - Just assigned, not contacted
- **Contacted** - Team member has reached out
- **Followed up** - Multiple follow-ups done
- **Closed** - Deal won or lost

---

## 🛠️ Admin Panel Navigation

From `/admin`, you have 5 main sections:

| Card | Purpose | URL |
|------|---------|-----|
| 🚀 Setup | Add all team members | `/admin/setup` |
| 📋 Leads | Manage & assign leads | `/admin/leads` |
| 👥 Team | View/add team members | `/admin/team` |
| ⏰ Reminders | Track follow-ups | `/admin/reminders` |
| 💾 Export | Download CSV | `/api/leads/export` |

---

## 📧 Email Integration (Future)

Currently, reminders are created in the system. To add automated emails:

1. Configure email service (Resend is already set up)
2. Email templates will be sent at reminder time
3. Each team member gets notified

---

## 🔐 Access Control

- **Admin (Yash)** - Full access to all features
- **Managers (Dnya, Achyut, Vaibhav, Gargi)** - Can view and update leads
- **Members** - Can view leads assigned to them

---

## 📱 Mobile-Friendly

All pages work on mobile:
- Responsive tables
- Easy-to-tap buttons
- Mobile-optimized forms

---

## 🆘 Troubleshooting

### **"Assign" button not working**
- Make sure at least one team member exists
- Go to `/admin/setup` and add team members

### **Can't see my reminders**
- Go to `/admin/reminders`
- Make sure reminder date has passed
- Check if status is "Pending"

### **CSV export shows old data**
- Data updates in real-time
- CSV includes current data at download time

### **Reminder is overdue**
- Red background means due date has passed
- Click "Mark as Sent" or "Mark Done"

---

## 🎯 Daily Workflow Suggestion

**Morning:**
1. Go to `/admin/reminders`
2. Check for overdue reminders
3. Follow up on any due leads
4. Mark as "Sent"

**Mid-Day:**
1. Go to `/admin/leads`
2. Search for unassigned leads
3. Assign to team members
4. Create follow-up reminders

**Evening:**
1. Check reminder status
2. Update lead statuses
3. Export data if needed
4. Plan next day's follow-ups

---

## 📊 Performance Metrics to Track

- **Total Leads Captured** - Seen on main dashboard
- **Assignment Rate** - % of leads assigned
- **Follow-up Rate** - % of reminders completed
- **Response Time** - Days to first contact
- **Conversion Rate** - From lead to consultation

---

## 🚀 Ready to Go!

Everything is set up. Just follow these steps:

1. ✅ Go to `/admin`
2. ✅ Click 🚀 Setup
3. ✅ Add all team members
4. ✅ Start assigning leads!

---

**Questions?** Check `FEATURES_SETUP.md` for technical details.

**Happy selling! 🎉**

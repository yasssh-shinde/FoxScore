export type Lead = {
  id: string
  reference_id: string
  full_name: string
  company_name: string
  mobile_number: string
  email: string
  website_url: string
  google_business_url?: string
  instagram_url?: string
  facebook_url?: string
  linkedin_url?: string
  guessed_score: number
  actual_score?: number
  won_prize: boolean
  marketing_rating?: number
  consultation_requested: boolean
  created_at: string
}

export type AuditResult = {
  id: string
  lead_id: string
  website_score: number
  seo_score: number
  google_score: number
  social_score: number
  overall_score: number
  audit_data: AuditData
  created_at: string
}

export type AuditData = {
  website: AuditItem[]
  seo: AuditItem[]
  google: AuditItem[]
  social: AuditItem[]
  improvements: string[]
  strengths: string[]
  html?: string
}

export type AuditItem = {
  metric: string
  status: 'pass' | 'fail' | 'warning'
  value?: string
  description: string
  weight: number
}

export type RegistrationFormData = {
  full_name: string
  company_name: string
  mobile_number: string
  email: string
  website_url: string
  google_business_url?: string
  instagram_url?: string
  facebook_url?: string
  linkedin_url?: string
  guessed_score: number
  terms_accepted: boolean
}

export type ScoreResult = {
  overall: number
  website: number
  seo: number
  google: number
  social: number
  won: boolean
}

export type TeamMember = {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'member'
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export type LeadAssignment = {
  id: string
  lead_id: string
  assigned_to: string
  assigned_by?: string
  status: 'assigned' | 'contacted' | 'followed_up' | 'closed'
  contacted_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type FollowUpReminder = {
  id: string
  lead_id: string
  assigned_to: string
  reminder_date: string
  reminder_type: 'email' | 'sms' | 'in_app'
  status: 'pending' | 'sent' | 'completed' | 'skipped'
  title?: string
  description?: string
  sent_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

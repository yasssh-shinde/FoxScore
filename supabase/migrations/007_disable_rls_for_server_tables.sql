-- Migration 007: Disable RLS on server-only tables
-- These tables are only accessed by the backend with service_role key
-- RLS is not needed and causes performance issues

-- Disable RLS on all server-only tables
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE prize_claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_reminders DISABLE ROW LEVEL SECURITY;

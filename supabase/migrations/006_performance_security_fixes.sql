-- Migration 006: Performance and Security Fixes
-- This script locks down RLS, creates stats view, and sets up atomic dequeue.

-- 1. Revoke public open RLS policies (Restrict all queries to server-side bypass using service_role)
DROP POLICY IF EXISTS "Enable read access for all users" ON leads;
DROP POLICY IF EXISTS "Enable insert for all users" ON leads;

DROP POLICY IF EXISTS "Enable read access for all users" ON audit_results;
DROP POLICY IF EXISTS "Enable insert for all users" ON audit_results;

DROP POLICY IF EXISTS "Enable read access for all users" ON reports;
DROP POLICY IF EXISTS "Enable insert for all users" ON reports;

DROP POLICY IF EXISTS "Enable read access for all users" ON consultation_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON consultation_requests;

DROP POLICY IF EXISTS "Enable read access for all users" ON webhook_logs;
DROP POLICY IF EXISTS "Enable insert for all users" ON webhook_logs;

DROP POLICY IF EXISTS "Enable read access for all users" ON settings;

DROP POLICY IF EXISTS "Enable read access for all users" ON background_jobs;
DROP POLICY IF EXISTS "Enable insert for all users" ON background_jobs;
DROP POLICY IF EXISTS "Enable update for all users" ON background_jobs;

DROP POLICY IF EXISTS "Enable read access for all users" ON prize_claims;
DROP POLICY IF EXISTS "Enable insert for all users" ON prize_claims;
DROP POLICY IF EXISTS "Enable update for all users" ON prize_claims;

DROP POLICY IF EXISTS "Enable read access for all users" ON team_members;
DROP POLICY IF EXISTS "Enable insert for all users" ON team_members;
DROP POLICY IF EXISTS "Enable update for all users" ON team_members;

DROP POLICY IF EXISTS "Enable read access for all users" ON lead_assignments;
DROP POLICY IF EXISTS "Enable insert for all users" ON lead_assignments;
DROP POLICY IF EXISTS "Enable update for all users" ON lead_assignments;

DROP POLICY IF EXISTS "Enable read access for all users" ON follow_up_reminders;
DROP POLICY IF EXISTS "Enable insert for all users" ON follow_up_reminders;
DROP POLICY IF EXISTS "Enable update for all users" ON follow_up_reminders;

-- 2. Create statistics view for high performance database-side aggregations
CREATE OR REPLACE VIEW leads_statistics AS
SELECT
  COUNT(id)::INT as total_leads,
  COALESCE(ROUND(AVG(actual_score)), 0)::INT as average_score,
  COALESCE(MAX(actual_score), 0)::INT as highest_score,
  COALESCE(MIN(actual_score), 0)::INT as lowest_score,
  COUNT(id) FILTER (WHERE won_prize = true)::INT as prize_winners
FROM leads;

-- 3. Create dequeue Postgres function for atomic transactional lock handling (FOR UPDATE SKIP LOCKED)
CREATE OR REPLACE FUNCTION dequeue_next_jobs(batch_size INT)
RETURNS TABLE (
  id UUID,
  job_type VARCHAR(100),
  payload JSONB,
  attempts INT,
  max_attempts INT,
  run_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  UPDATE background_jobs
  SET status = 'running',
      attempts = background_jobs.attempts + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE background_jobs.id IN (
    SELECT bj.id
    FROM background_jobs bj
    WHERE (bj.status = 'pending' OR bj.status = 'failed')
      AND bj.run_at <= CURRENT_TIMESTAMP
    ORDER BY bj.run_at ASC
    LIMIT batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING background_jobs.id, background_jobs.job_type, background_jobs.payload, background_jobs.attempts, background_jobs.max_attempts, background_jobs.run_at;
END;
$$ LANGUAGE plpgsql;

-- Refactor V2 Database migrations

-- Create background jobs table
CREATE TABLE IF NOT EXISTS background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue VARCHAR(100) DEFAULT 'default',
  job_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed, failed_permanently
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_log TEXT,
  run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create prize claims table to handle detailed reward processing and abuse prevention
CREATE TABLE IF NOT EXISTS prize_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  guessed_score INTEGER NOT NULL CHECK (guessed_score >= 0 AND guessed_score <= 100),
  actual_score INTEGER NOT NULL CHECK (actual_score >= 0 AND actual_score <= 100),
  difference INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_background_jobs_status_run_at ON background_jobs(status, run_at);
CREATE INDEX IF NOT EXISTS idx_background_jobs_job_type ON background_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_prize_claims_lead_id ON prize_claims(lead_id);
CREATE INDEX IF NOT EXISTS idx_prize_claims_status ON prize_claims(status);
CREATE INDEX IF NOT EXISTS idx_prize_claims_created_at ON prize_claims(created_at);

-- Enable RLS
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON background_jobs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON background_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON background_jobs FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON prize_claims FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON prize_claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON prize_claims FOR UPDATE USING (true);

-- Trigger for background_jobs and prize_claims updated_at
CREATE TRIGGER update_background_jobs_updated_at
BEFORE UPDATE ON background_jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_prize_claims_updated_at
BEFORE UPDATE ON prize_claims
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

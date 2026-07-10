-- Create tables for Digital Health Score Challenge

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website_url VARCHAR(500) NOT NULL,
  google_business_url VARCHAR(500),
  instagram_url VARCHAR(500),
  facebook_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  guessed_score INTEGER CHECK (guessed_score >= 0 AND guessed_score <= 100),
  actual_score INTEGER CHECK (actual_score >= 0 AND actual_score <= 100),
  won_prize BOOLEAN DEFAULT FALSE,
  marketing_rating INTEGER CHECK (marketing_rating >= 1 AND marketing_rating <= 5),
  consultation_requested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  device_info JSONB
);

-- Audit results table
CREATE TABLE IF NOT EXISTS audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  website_score DECIMAL(5,1) CHECK (website_score >= 0 AND website_score <= 100),
  seo_score DECIMAL(5,1) CHECK (seo_score >= 0 AND seo_score <= 100),
  google_score DECIMAL(5,1) CHECK (google_score >= 0 AND google_score <= 100),
  social_score DECIMAL(5,1) CHECK (social_score >= 0 AND social_score <= 100),
  overall_score DECIMAL(5,1) CHECK (overall_score >= 0 AND overall_score <= 100),
  audit_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  audit_result_id UUID NOT NULL REFERENCES audit_results(id) ON DELETE CASCADE,
  pdf_url VARCHAR(500),
  qr_code TEXT,
  report_data JSONB,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  downloaded_at TIMESTAMP,
  emailed_at TIMESTAMP
);

-- Consultation requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  contacted_at TIMESTAMP,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  payload JSONB,
  response_status INTEGER,
  response_body JSONB,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_reference_id ON leads(reference_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_audit_results_lead_id ON audit_results(lead_id);
CREATE INDEX idx_reports_lead_id ON reports(lead_id);
CREATE INDEX idx_consultation_requests_lead_id ON consultation_requests(lead_id);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow public access for now, tighten in production)
CREATE POLICY "Enable read access for all users" ON leads
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON audit_results
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON audit_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON consultation_requests
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON consultation_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON webhook_logs
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON webhook_logs
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_audit_results_updated_at
BEFORE UPDATE ON audit_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_consultation_requests_updated_at
BEFORE UPDATE ON consultation_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

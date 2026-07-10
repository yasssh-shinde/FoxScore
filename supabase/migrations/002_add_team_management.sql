-- Team Management Tables

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- admin, manager, member
  status VARCHAR(50) DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead assignments table (assign leads to team members)
CREATE TABLE IF NOT EXISTS lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'assigned', -- assigned, contacted, followed_up, closed
  contacted_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lead_id, assigned_to)
);

-- Follow-up reminders table
CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  reminder_date TIMESTAMP NOT NULL,
  reminder_type VARCHAR(50) DEFAULT 'email', -- email, sms, in_app
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, completed, skipped
  title VARCHAR(255),
  description TEXT,
  sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_lead_assignments_lead_id ON lead_assignments(lead_id);
CREATE INDEX idx_lead_assignments_assigned_to ON lead_assignments(assigned_to);
CREATE INDEX idx_lead_assignments_status ON lead_assignments(status);
CREATE INDEX idx_follow_up_reminders_lead_id ON follow_up_reminders(lead_id);
CREATE INDEX idx_follow_up_reminders_assigned_to ON follow_up_reminders(assigned_to);
CREATE INDEX idx_follow_up_reminders_reminder_date ON follow_up_reminders(reminder_date);
CREATE INDEX idx_follow_up_reminders_status ON follow_up_reminders(status);
CREATE INDEX idx_team_members_email ON team_members(email);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for all users" ON team_members
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON team_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON team_members
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON lead_assignments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON lead_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON lead_assignments
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON follow_up_reminders
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON follow_up_reminders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON follow_up_reminders
  FOR UPDATE USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON team_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lead_assignments_updated_at
BEFORE UPDATE ON lead_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_follow_up_reminders_updated_at
BEFORE UPDATE ON follow_up_reminders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Add checked_by field to leads table to track which team member checked the score

ALTER TABLE leads
ADD COLUMN checked_by UUID REFERENCES team_members(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_leads_checked_by ON leads(checked_by);

-- Seed initial team members for FoxScore

INSERT INTO team_members (name, email, role, status)
VALUES
  ('Yash', 'yash@seofox.io', 'admin', 'active'),
  ('Dnya', 'dnya@seofox.io', 'manager', 'active'),
  ('Achyut', 'achyut@seofox.io', 'manager', 'active'),
  ('Vaibhav', 'vaibhav@seofox.io', 'manager', 'active'),
  ('Gargi', 'gargi@seofox.io', 'manager', 'active')
ON CONFLICT (email) DO NOTHING;

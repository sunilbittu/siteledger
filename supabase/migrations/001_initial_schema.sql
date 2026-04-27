-- SiteLedger: Initial Schema
-- Run this in Supabase SQL Editor to set up all tables, RLS, triggers, and seed data.

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  mtd NUMERIC DEFAULT 0
);

CREATE TABLE plots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id)
);

CREATE TABLE worker_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  default_wage NUMERIC NOT NULL
);

CREATE TABLE contractors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily_fee', 'labor_contract', 'both'))
);

CREATE TABLE jcb_operators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  default_hourly_rate NUMERIC NOT NULL
);

CREATE TABLE work_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'supervisor',
  must_change_password BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE project_assignments (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, project_id)
);

CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id),
  plot_id TEXT NOT NULL REFERENCES plots(id),
  category TEXT NOT NULL CHECK (category IN ('nmr', 'jcb', 'contractor_fee', 'labor_contract', 'general')),
  total_amount NUMERIC NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer')),
  photo_url TEXT,
  notes TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  details JSONB NOT NULL DEFAULT '{}'
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_entries_project_date ON entries(project_id, entry_date DESC);
CREATE INDEX idx_plots_project ON plots(project_id);
CREATE INDEX idx_project_assignments_user ON project_assignments(user_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE jcb_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_types ENABLE ROW LEVEL SECURITY;

-- Profiles: read own only
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Projects: read only if assigned
CREATE POLICY "Users can read assigned projects"
  ON projects FOR SELECT
  USING (id IN (
    SELECT project_id FROM project_assignments WHERE user_id = auth.uid()
  ));

-- Plots: read only if in assigned project
CREATE POLICY "Users can read plots of assigned projects"
  ON plots FOR SELECT
  USING (project_id IN (
    SELECT project_id FROM project_assignments WHERE user_id = auth.uid()
  ));

-- Project assignments: read own only
CREATE POLICY "Users can read own assignments"
  ON project_assignments FOR SELECT
  USING (user_id = auth.uid());

-- Reference tables: all authenticated users can read
CREATE POLICY "Authenticated users can read worker_types"
  ON worker_types FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read contractors"
  ON contractors FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read jcb_operators"
  ON jcb_operators FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read work_types"
  ON work_types FOR SELECT
  USING (auth.role() = 'authenticated');

-- Entries: read for assigned projects
CREATE POLICY "Users can read entries of assigned projects"
  ON entries FOR SELECT
  USING (project_id IN (
    SELECT project_id FROM project_assignments WHERE user_id = auth.uid()
  ));

-- Entries: insert for assigned projects
CREATE POLICY "Users can insert entries for assigned projects"
  ON entries FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_assignments WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Entries: delete own unlocked only
CREATE POLICY "Users can delete own unlocked entries"
  ON entries FOR DELETE
  USING (
    created_by = auth.uid()
    AND locked_at > now()
  );

-- Entries: update own unlocked only
CREATE POLICY "Users can update own unlocked entries"
  ON entries FOR UPDATE
  USING (
    created_by = auth.uid()
    AND locked_at > now()
  );

-- ============================================================
-- AUTO-PROFILE TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role, must_change_password)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'supervisor'),
    COALESCE((NEW.raw_user_meta_data->>'must_change_password')::boolean, true)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ENABLE REALTIME ON ENTRIES
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE entries;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Projects
INSERT INTO projects (id, name, location, mtd) VALUES
  ('p-whitefield', 'Whitefield Site', 'Whitefield, Bengaluru', 412800),
  ('p-sarjapur', 'Sarjapur Villas', 'Sarjapur Rd, Bengaluru', 286400);

-- Plots
INSERT INTO plots (id, name, project_id) VALUES
  ('plot-22', 'Plot 22', 'p-whitefield'),
  ('plot-23', 'Plot 23', 'p-whitefield'),
  ('plot-24', 'Plot 24', 'p-whitefield'),
  ('plot-site', 'Site-wide', 'p-whitefield'),
  ('plot-a1', 'Villa A1', 'p-sarjapur'),
  ('plot-a2', 'Villa A2', 'p-sarjapur'),
  ('plot-site2', 'Site-wide', 'p-sarjapur');

-- Worker types
INSERT INTO worker_types (id, name, default_wage) VALUES
  ('wt-mason', 'Mason', 950),
  ('wt-helper', 'Helper', 600),
  ('wt-carpenter', 'Carpenter', 1100),
  ('wt-electrician', 'Electrician', 1200),
  ('wt-bar-bender', 'Bar Bender', 1000);

-- Contractors
INSERT INTO contractors (id, name, type) VALUES
  ('c-ramesh', 'Ramesh Plastering Co.', 'both'),
  ('c-suresh', 'Suresh Tiles', 'labor_contract'),
  ('c-mahesh', 'Mahesh Painting', 'labor_contract'),
  ('c-iqbal', 'Iqbal Daily Crew', 'daily_fee'),
  ('c-stargold', 'StarGold Electricals', 'both');

-- JCB Operators
INSERT INTO jcb_operators (id, name, default_hourly_rate) VALUES
  ('op-prakash', 'Prakash B.', 1200),
  ('op-anand', 'Anand R.', 1150),
  ('op-naveen', 'Naveen S.', 1300);

-- Work types
INSERT INTO work_types (name) VALUES
  ('Plastering'), ('Brickwork'), ('Tiling'), ('Painting'),
  ('Electrical'), ('Plumbing'), ('Other');

-- ============================================================
-- TEST USER SETUP
-- ============================================================
-- After running this migration, create a test user via Supabase dashboard:
--
-- 1. Go to Authentication > Users > Add User
-- 2. Email: rajesh@gmail.com, Password: Site2026
-- 3. Then run these SQL statements (replace USER_UUID with the actual user UUID):
--
--   UPDATE profiles
--   SET name = 'Rajesh Kumar', must_change_password = false
--   WHERE id = 'USER_UUID';
--
--   INSERT INTO project_assignments (user_id, project_id) VALUES
--     ('USER_UUID', 'p-whitefield'),
--     ('USER_UUID', 'p-sarjapur');

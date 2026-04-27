-- Admin RLS bypass: allow admin users to read all data across projects

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Projects: drop existing policy and recreate with admin bypass
DROP POLICY IF EXISTS "Users can read assigned projects" ON projects;
CREATE POLICY "Users can read assigned projects or admin"
  ON projects FOR SELECT
  USING (
    id IN (SELECT project_id FROM project_assignments WHERE user_id = auth.uid())
    OR is_admin()
  );

-- Plots: drop existing policy and recreate with admin bypass
DROP POLICY IF EXISTS "Users can read plots of assigned projects" ON plots;
CREATE POLICY "Users can read plots of assigned projects or admin"
  ON plots FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM project_assignments WHERE user_id = auth.uid())
    OR is_admin()
  );

-- Entries: drop existing SELECT policy and recreate with admin bypass
DROP POLICY IF EXISTS "Users can read entries of assigned projects" ON entries;
CREATE POLICY "Users can read entries of assigned projects or admin"
  ON entries FOR SELECT
  USING (
    project_id IN (SELECT project_id FROM project_assignments WHERE user_id = auth.uid())
    OR is_admin()
  );

-- Project assignments: drop existing policy and recreate with admin bypass
DROP POLICY IF EXISTS "Users can read own assignments" ON project_assignments;
CREATE POLICY "Users can read own assignments or admin"
  ON project_assignments FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_admin()
  );

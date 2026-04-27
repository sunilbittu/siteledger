-- Seed: Morning Farms project + admin user setup

-- ============================================================
-- PROJECT & PLOTS
-- ============================================================

INSERT INTO projects (id, name, location, mtd) VALUES
  ('p-morning-farms', 'Morning Farms', 'Aloor Village', 0);

INSERT INTO plots (id, name, project_id) VALUES
  ('plot-mf-site', 'Site-wide', 'p-morning-farms');

-- ============================================================
-- USER SETUP
-- ============================================================
-- After running this migration, create users via Supabase dashboard:
--
-- 1. ADMIN USER (wilson4smiles@gmail.com)
--    Go to Authentication > Users > Add User
--    Email: wilson4smiles@gmail.com, Password: Site2026
--    Then run (replace ADMIN_UUID with actual UUID):
--
--    UPDATE profiles
--    SET name = 'Wilson', role = 'admin', must_change_password = false
--    WHERE id = 'ADMIN_UUID';
--
-- 2. SUPERVISOR (morningfarms199@gmail.com)
--    Go to Authentication > Users > Add User
--    Email: morningfarms199@gmail.com, Password: Site2026
--    Then run (replace SUPERVISOR_UUID with actual UUID):
--
--    UPDATE profiles
--    SET name = 'Pavan', role = 'supervisor', must_change_password = true
--    WHERE id = 'SUPERVISOR_UUID';
--
--    INSERT INTO project_assignments (user_id, project_id) VALUES
--      ('SUPERVISOR_UUID', 'p-morning-farms');

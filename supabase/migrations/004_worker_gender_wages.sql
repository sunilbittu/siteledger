-- Add gender-specific wages to worker_types
-- default_wage remains as male wage, add female wage column

ALTER TABLE worker_types ADD COLUMN IF NOT EXISTS default_wage_female NUMERIC;

-- Set female wages (typically lower in construction industry)
UPDATE worker_types SET default_wage_female = default_wage - 200 WHERE default_wage_female IS NULL;

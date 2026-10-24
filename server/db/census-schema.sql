-- ============================================================================
-- UDPAD Rural Census 10,000 Benchmark Dataset Table
-- Supabase / PostgreSQL Schema Definition
-- ============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard > SQL Editor
-- 2. Paste this SQL snippet and click "Run"
-- 3. Run the import script: npm run import:census
-- ============================================================================

CREATE TABLE IF NOT EXISTS census_demo (
  person_id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  tehsil_block TEXT NOT NULL,
  village_name TEXT NOT NULL,
  village_code TEXT NOT NULL,
  pincode TEXT NOT NULL,
  area_type TEXT DEFAULT 'Rural',
  person_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  relation_to_head TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  religion TEXT,
  social_category TEXT,
  mother_tongue TEXT,
  literate TEXT,
  education_level TEXT,
  occupation TEXT,
  worker_type TEXT,
  disability TEXT DEFAULT 'None',
  household_size INTEGER DEFAULT 1,
  house_type TEXT,
  number_of_rooms INTEGER DEFAULT 1,
  drinking_water_source TEXT,
  electricity TEXT,
  toilet_facility TEXT,
  cooking_fuel TEXT,
  land_holding TEXT,
  phone_access TEXT,
  bank_account TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH-SPEED QUERYING & FILTERING
CREATE INDEX IF NOT EXISTS idx_census_demo_household_id ON census_demo(household_id);
CREATE INDEX IF NOT EXISTS idx_census_demo_district ON census_demo(district);
CREATE INDEX IF NOT EXISTS idx_census_demo_village_code ON census_demo(village_code);
CREATE INDEX IF NOT EXISTS idx_census_demo_social_category ON census_demo(social_category);
CREATE INDEX IF NOT EXISTS idx_census_demo_gender ON census_demo(gender);
CREATE INDEX IF NOT EXISTS idx_census_demo_person_name ON census_demo(person_name);

-- ROW LEVEL SECURITY (RLS) FOR SUPABASE
ALTER TABLE census_demo ENABLE ROW LEVEL SECURITY;

-- Permissive read policy for public API discovery
DROP POLICY IF EXISTS "Public Census Demo Read Access" ON census_demo;
CREATE POLICY "Public Census Demo Read Access" ON census_demo FOR SELECT USING (true);

-- Permissive service policy for automated imports
DROP POLICY IF EXISTS "Service Census Demo Full Access" ON census_demo;
CREATE POLICY "Service Census Demo Full Access" ON census_demo FOR ALL USING (true) WITH CHECK (true);

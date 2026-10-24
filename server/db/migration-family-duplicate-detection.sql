-- ============================================================================
-- UDPAD Enhancement Migration: Citizen Family Details & Real-Time Household Deduplication
-- Safe, Idempotent, and Backward-Compatible
-- ============================================================================

-- 1. CITIZENS TABLE: Add family details, caste, and full residential address
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS caste TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS caste_other TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS full_address TEXT;

CREATE INDEX IF NOT EXISTS idx_citizens_father_name ON citizens(father_name);
CREATE INDEX IF NOT EXISTS idx_citizens_mother_name ON citizens(mother_name);
CREATE INDEX IF NOT EXISTS idx_citizens_caste ON citizens(caste);

-- 2. SCHEMES TABLE: Add eligibility scope (household vs individual)
ALTER TABLE schemes ADD COLUMN IF NOT EXISTS eligibility_scope TEXT DEFAULT 'individual';

-- Configure verified household-based schemes (Housing, NFSA ration, Sanitation/Ujjwala, Family Benefits)
UPDATE schemes SET eligibility_scope = 'household' WHERE id IN (
  'SCH-01', -- PMGKAY / NFSA free ration (Household unit)
  'SCH-03', -- VB-G RAM G (Household job card)
  'SCH-07', -- Ayushman Bharat PM-JAY (Household golden card)
  'SCH-12', -- PMAY-Urban 2.0 (Housing / Dwelling)
  'SCH-13', -- PMAY-Gramin (Housing / Dwelling)
  'SCH-14', -- PM Ujjwala Yojana (One LPG connection per household)
  'SCH-15', -- PM Surya Ghar (Rooftop solar per dwelling unit)
  'SCH-19'  -- National Family Benefit Scheme (One grant per household)
);

-- Ensure all other existing schemes are marked individual
UPDATE schemes SET eligibility_scope = 'individual' WHERE id NOT IN (
  'SCH-01', 'SCH-03', 'SCH-07', 'SCH-12', 'SCH-13', 'SCH-14', 'SCH-15', 'SCH-19'
);

-- 3. VERIFICATION ALERTS TABLE: Ensure resolution & audit trail columns exist
ALTER TABLE verification_alerts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unresolved';
ALTER TABLE verification_alerts ADD COLUMN IF NOT EXISTS resolution_note TEXT;
ALTER TABLE verification_alerts ADD COLUMN IF NOT EXISTS resolved_by TEXT;
ALTER TABLE verification_alerts ADD COLUMN IF NOT EXISTS match_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE verification_alerts ADD COLUMN IF NOT EXISTS audit_trail JSONB DEFAULT '[]'::jsonb;

-- 4. DEDUPLICATION AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS deduplication_audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  alert_id TEXT REFERENCES verification_alerts(id) ON DELETE CASCADE,
  application_id TEXT,
  citizen_id TEXT NOT NULL,
  officer_id TEXT NOT NULL,
  officer_name TEXT,
  action TEXT NOT NULL, -- 'REVIEW_MATCH' | 'CONFIRM_SAME_HOUSEHOLD' | 'MARK_DIFFERENT_HOUSEHOLD' | 'REQUEST_ADDITIONAL_VERIFICATION' | 'APPROVED' | 'REJECTED'
  decision_reason TEXT NOT NULL,
  match_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_alert_id ON deduplication_audit_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_citizen_id ON deduplication_audit_logs(citizen_id);

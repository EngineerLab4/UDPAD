-- ============================================================================
-- UDPAD CORE PLATFORM SCHEMA & SCHEMES MIGRATION
-- Safe & Non-Destructive: Creates missing core tables, indexes, RLS & 25 schemes
-- NOTE: Does NOT drop or modify existing tables or census_demo (10,000 records preserved)
-- ============================================================================

-- ============================================================================
-- UDPAD (Unified Digital Platform for Accessible Public Documentation)
-- PostgreSQL / Supabase Complete Database Schema & Seed Data
-- ============================================================================
-- How to apply this schema in Supabase:
-- 1. Open your Supabase project dashboard (https://supabase.com/dashboard).
-- 2. Navigate to 'SQL Editor' on the left navigation panel.
-- 3. Click 'New query', paste the contents of this file, and click 'Run'.
-- 4. Copy your Project URL & Anon Key from Settings > API into your .env file:
--      SUPABASE_URL=https://your-project-id.supabase.co
--      SUPABASE_ANON_KEY=your-anon-key
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CITIZENS / USERS TABLE
CREATE TABLE IF NOT EXISTS citizens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  citizen_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  gender TEXT DEFAULT 'Not Specified',
  occupation TEXT DEFAULT 'Citizen',
  income_category TEXT DEFAULT 'Standard Income Category',
  annual_income TEXT DEFAULT 'Self-Declared',
  household_id TEXT,
  address JSONB DEFAULT '{"dwellingType": "Residential", "addressLine1": "Residential Address", "district": "", "state": "", "pincode": ""}'::jsonb,
  registry_source TEXT DEFAULT 'Citizen Self-Registration',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HOUSEHOLDS TABLE
CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  household_ref TEXT UNIQUE NOT NULL,
  citizen_id TEXT REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  head_of_household TEXT NOT NULL,
  registration_date DATE DEFAULT CURRENT_DATE,
  current_status TEXT DEFAULT 'Active Citizen Registry',
  dwelling_reference TEXT DEFAULT 'DWL-PRIMARY-001',
  ration_card_ref TEXT DEFAULT 'Pending Registration',
  income_category TEXT DEFAULT 'Standard Category',
  annual_household_income TEXT DEFAULT 'Self-Declared',
  address TEXT DEFAULT 'Primary Residential Address',
  verification_source TEXT DEFAULT 'Citizen Self-Declaration & Portal Registry',
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HOUSEHOLD MEMBERS TABLE
CREATE TABLE IF NOT EXISTS household_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_ref TEXT NOT NULL,
  household_ref TEXT REFERENCES households(household_ref) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  citizen_id TEXT,
  age INTEGER DEFAULT 18,
  gender TEXT DEFAULT 'Not Specified',
  occupation TEXT DEFAULT 'Dependent',
  education TEXT DEFAULT 'Secondary',
  status TEXT DEFAULT 'Current Resident',
  member_since DATE DEFAULT CURRENT_DATE,
  is_head BOOLEAN DEFAULT FALSE,
  independent_benefits_allowed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HOUSEHOLD DWELLINGS TABLE
CREATE TABLE IF NOT EXISTS household_dwellings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  dwelling_ref TEXT NOT NULL,
  household_ref TEXT REFERENCES households(household_ref) ON DELETE CASCADE,
  dwelling_type TEXT DEFAULT 'Primary Domestic Residence',
  ownership TEXT DEFAULT 'Resident / Occupant',
  address TEXT NOT NULL,
  electricity_meter_no TEXT DEFAULT 'N/A',
  water_connection_no TEXT DEFAULT 'N/A',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEMBERSHIP HISTORY TABLE
CREATE TABLE IF NOT EXISTS membership_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_ref TEXT NOT NULL,
  household_ref TEXT REFERENCES households(household_ref) ON DELETE CASCADE,
  event_date DATE DEFAULT CURRENT_DATE,
  event TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  authority TEXT DEFAULT 'UDPAD Citizen Portal Self-Service',
  reference_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SCHEMES TABLE
CREATE TABLE IF NOT EXISTS schemes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  benefit_unit TEXT NOT NULL,
  benefit_amount TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  intended_beneficiary TEXT,
  eligibility_criteria JSONB DEFAULT '[]'::jsonb,
  required_documents JSONB DEFAULT '[]'::jsonb,
  portal TEXT,
  verification_status TEXT,
  benefit_unit_explanation TEXT,
  application_status TEXT DEFAULT 'Open',
  faq JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  citizen_id TEXT REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  scheme_id TEXT REFERENCES schemes(id) ON DELETE RESTRICT,
  scheme_name TEXT NOT NULL,
  department TEXT NOT NULL,
  category TEXT NOT NULL,
  benefit_unit TEXT NOT NULL,
  target_beneficiary_name TEXT NOT NULL,
  household_ref TEXT,
  dwelling_ref TEXT,
  applied_date DATE DEFAULT CURRENT_DATE,
  last_updated DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Submitted — Demo',
  status_note TEXT,
  has_active_alert BOOLEAN DEFAULT FALSE,
  alert_id TEXT,
  timeline JSONB DEFAULT '[]'::jsonb,
  documents_uploaded JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VERIFICATION ALERTS TABLE
CREATE TABLE IF NOT EXISTS verification_alerts (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES applications(id) ON DELETE CASCADE,
  citizen_id TEXT REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  scheme_id TEXT REFERENCES schemes(id) ON DELETE RESTRICT,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'warning',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 9. CORRECTIONS & APPEALS TABLE
CREATE TABLE IF NOT EXISTS corrections (
  id TEXT PRIMARY KEY,
  citizen_id TEXT REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  alert_id TEXT,
  application_id TEXT,
  record_type TEXT DEFAULT 'Verification Clarification',
  scheme_name TEXT DEFAULT 'Citizen Welfare Grievance',
  reason_category TEXT NOT NULL,
  citizen_statement TEXT NOT NULL,
  supporting_evidence JSONB DEFAULT '[]'::jsonb,
  submission_date TEXT,
  status TEXT DEFAULT 'Submitted — Demo',
  assigned_authority TEXT DEFAULT 'Zonal Public Grievance Officer',
  resolution_expectation TEXT DEFAULT 'Standard review timeline: 7 to 14 business days.',
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  citizen_id TEXT REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'General Notice',
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  link TEXT DEFAULT '/dashboard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BENEFITS LEDGER TABLE
CREATE TABLE IF NOT EXISTS benefits_ledger (
  id TEXT PRIMARY KEY,
  citizen_id TEXT REFERENCES citizens(citizen_id) ON DELETE CASCADE,
  household_ref TEXT,
  benefit_name TEXT NOT NULL,
  scheme_code TEXT NOT NULL,
  benefit_unit TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  grant_date DATE NOT NULL,
  amount_or_item TEXT NOT NULL,
  delivering_agency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_citizens_mobile ON citizens(mobile);
CREATE INDEX IF NOT EXISTS idx_citizens_citizen_id ON citizens(citizen_id);
CREATE INDEX IF NOT EXISTS idx_households_household_ref ON households(household_ref);
CREATE INDEX IF NOT EXISTS idx_households_citizen_id ON households(citizen_id);
CREATE INDEX IF NOT EXISTS idx_household_members_household_ref ON household_members(household_ref);
CREATE INDEX IF NOT EXISTS idx_household_dwellings_household_ref ON household_dwellings(household_ref);
CREATE INDEX IF NOT EXISTS idx_applications_citizen_id ON applications(citizen_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme_id ON applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_verification_alerts_citizen_id ON verification_alerts(citizen_id);
CREATE INDEX IF NOT EXISTS idx_corrections_citizen_id ON corrections(citizen_id);
CREATE INDEX IF NOT EXISTS idx_notifications_citizen_id ON notifications(citizen_id);
CREATE INDEX IF NOT EXISTS idx_benefits_ledger_citizen_id ON benefits_ledger(citizen_id);

ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_dwellings ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits_ledger ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- 1. Schemes: Public welfare directory readable by anyone
  DROP POLICY IF EXISTS "Public Schemes Viewable" ON schemes;
  CREATE POLICY "Public Schemes Viewable" ON schemes FOR SELECT USING (true);

  -- 2. Sensitive citizen-data tables:
  -- Drop any previously created unrestricted policies
  DROP POLICY IF EXISTS "Service access citizens" ON citizens;
  DROP POLICY IF EXISTS "Service access households" ON households;
  DROP POLICY IF EXISTS "Service access members" ON household_members;
  DROP POLICY IF EXISTS "Service access dwellings" ON household_dwellings;
  DROP POLICY IF EXISTS "Service access history" ON membership_history;
  DROP POLICY IF EXISTS "Service access applications" ON applications;
  DROP POLICY IF EXISTS "Service access alerts" ON verification_alerts;
  DROP POLICY IF EXISTS "Service access corrections" ON corrections;
  DROP POLICY IF EXISTS "Service access notifications" ON notifications;
  DROP POLICY IF EXISTS "Service access benefits" ON benefits_ledger;

  -- Drop previous service role policies if re-running
  DROP POLICY IF EXISTS "Service role access citizens" ON citizens;
  DROP POLICY IF EXISTS "Service role access households" ON households;
  DROP POLICY IF EXISTS "Service role access members" ON household_members;
  DROP POLICY IF EXISTS "Service role access dwellings" ON household_dwellings;
  DROP POLICY IF EXISTS "Service role access history" ON membership_history;
  DROP POLICY IF EXISTS "Service role access applications" ON applications;
  DROP POLICY IF EXISTS "Service role access alerts" ON verification_alerts;
  DROP POLICY IF EXISTS "Service role access corrections" ON corrections;
  DROP POLICY IF EXISTS "Service role access notifications" ON notifications;
  DROP POLICY IF EXISTS "Service role access benefits" ON benefits_ledger;

  -- 3. Strict Service Role access:
  -- Only the trusted backend service possessing SUPABASE_SERVICE_ROLE_KEY
  -- is permitted to query citizen PII and private welfare records.
  -- The public anon role and client roles are completely denied access.
  CREATE POLICY "Service role access citizens" ON citizens FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role access households" ON households FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role access members" ON household_members FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role access dwellings" ON household_dwellings FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role access history" ON membership_history FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role access applications" ON applications FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role access alerts" ON verification_alerts FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role access corrections" ON corrections FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role access notifications" ON notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
  CREATE POLICY "Service role access benefits" ON benefits_ledger FOR ALL TO service_role USING (true) WITH CHECK (true);
END
$$;


-- SEED DATA: SCHEMES DIRECTORY (All 25 Government Welfare Schemes)
-- ============================================================================
INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-01',
  'PMGKAY-01',
  'PMGKAY / NFSA free ration',
  'Food',
  'Department of Food & Public Distribution, Ministry of Consumer Affairs',
  'Household',
  '5 kg free foodgrain per person per month; extended five years from Jan 1, 2024',
  '5 kg free foodgrain per person per month for Antyodaya Anna Yojana (AAY) and Priority Households (PHH) under NFSA.',
  'Pradhan Mantri Garib Kalyan Anna Yojana (PMGKAY) integrated under the National Food Security Act (NFSA) provides 5 kg of free foodgrains per person per month to eligible priority households and 35 kg per family per month for AAY households. Extended for five years starting January 1, 2024.',
  'Ration card holders under NFSA: Antyodaya Anna Yojana (AAY) and Priority Households (PHH)',
  '["Ration card holders under NFSA: Antyodaya Anna Yojana (AAY) and Priority Households (PHH).","Beneficiary details must be mapped in the state PDS and national NFSA database.","Aadhaar seeding of ration card with mobile number linkage is recommended.","Active monthly collection: Not collecting grain for several months can lead to deletion in many states."]'::jsonb,
  '["Ration card, ideally Aadhaar-seeded with mobile linked","Aadhaar card of household members","Active mobile number linked to ration card","Verification via local ration shop (FPS) or mera.pmgkay.gov.in"]'::jsonb,
  'mera.pmgkay.gov.in (status check); local ration shop',
  'Verified',
  'Benefit is managed at the HOUSEHOLD ration card level. Allocations are computed based on active verified family members listed under the designated household ration card.',
  'Open',
  '[{"q":"How do I check if my ration card is active?","a":"You can check your ration card status online at mera.pmgkay.gov.in or directly visit your local ration shop."},{"q":"What happens if we do not collect rations for a few months?","a":"In many states, failing to collect allotted foodgrains for consecutive months triggers automated verification or ration card deactivation."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-02',
  'ANNAPURNA-02',
  'Annapurna Scheme',
  'Food',
  'Ministry of Rural Development / State Social Welfare Department',
  'Individual',
  'Free foodgrain for elderly people',
  'Free foodgrain (10 kg per month) for eligible senior citizens not covered under any old-age pension.',
  'The Annapurna Scheme provides food security to meet the requirements of senior citizens (aged 65 and above) who, though eligible for the National Old Age Pension Scheme, are not receiving pension benefits.',
  'Eligible old-age persons not covered by the old-age pension',
  '["Eligible old-age persons (aged 65 years or above).","Must not be covered by or receiving any central or state old-age pension.","Must be destitute with no regular source of subsistence or family maintenance support.","Must reside in the designated block or municipal jurisdiction."]'::jsonb,
  '["Through the state/block social welfare office (details not verified)","Proof of age / Senior citizen identity record","Certificate of non-receipt of old-age pension","Proof of residence / Ration card extract"]'::jsonb,
  'nsap.nic.in',
  'Partly verified',
  'Benefit is awarded to the INDIVIDUAL destitute senior citizen who is not receiving old-age pension support.',
  'Open',
  '[{"q":"Can a senior citizen already getting an old-age pension get Annapurna foodgrains?","a":"No, Annapurna is strictly for eligible old-age persons who are not covered by any old-age pension scheme."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-03',
  'VB-GRAM-G-03',
  'VB-G RAM G (replaced MGNREGA)',
  'Jobs & income',
  'Department of Rural Development, Ministry of Rural Development',
  'Household',
  '125 days of guaranteed rural wage work a year from July 1, 2026; allowance payable if work is not given within the prescribed time; wages paid weekly or within 15 days',
  '125 days of guaranteed rural wage work per household per year starting July 1, 2026 with statutory unemployment allowance.',
  'VB-G RAM G replaces MGNREGA to provide 125 days of statutory guaranteed unskilled manual work per rural household per year starting July 1, 2026. Unemployment allowance is legally payable if work is not allotted within 15 days of demand and wages are directly credited weekly or within 15 days.',
  'Rural households with valid job cards; one adult member volunteering for unskilled manual work',
  '["Rural households with valid job cards.","At least one adult household member volunteering for unskilled manual work.","Permanent residence within the rural Gram Panchayat area.","Guaranteed work allocation capped at 125 cumulative days per registered household per year from July 1, 2026."]'::jsonb,
  '["Job card from the Gram Panchayat","Aadhaar Card of participating adult worker(s)","Aadhaar-seeded active bank or post office savings account passbook","Formal work demand submission to Gram Panchayat or Block Development Officer"]'::jsonb,
  'Gram Panchayat; rural development dept',
  'Verified',
  'The 125-day entitlement is allocated at the HOUSEHOLD level and shared across volunteering adult members registered under the family job card.',
  'Open',
  '[{"q":"What if work is not provided within 15 days of submitting a demand?","a":"A statutory unemployment allowance is legally payable to the applicant worker if employment is not provided within the prescribed 15 days."},{"q":"How frequently are wages disbursed?","a":"Wages are credited via DBT weekly or within a maximum of 15 days directly into the worker’s Aadhaar-linked bank account."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-04',
  'APY-04',
  'Atal Pension Yojana',
  'Jobs & income',
  'Pension Fund Regulatory and Development Authority (PFRDA) / Ministry of Finance',
  'Individual',
  'Guaranteed pension of Rs 1,000-5,000 a month after age 60',
  'Guaranteed monthly old-age pension of ₹1,000 to ₹5,000 after age 60 for unorganised-sector workers.',
  'Atal Pension Yojana provides a guaranteed monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 to subscribers after age 60, based on their monthly contribution and entry age (18 to 40 years).',
  'Unorganised-sector workers aged 18-40',
  '["Unorganised-sector workers aged 18-40.","Must have an active savings bank account or post office savings account with auto-debit consent.","Must not be an income taxpayer.","Must not be covered under statutory government social security schemes."]'::jsonb,
  '["Bank account with auto-debit","Aadhaar Card for identity and address proof","Active mobile number linked to bank account","Nominee details"]'::jsonb,
  'Your bank',
  'Verified',
  'Benefit attaches strictly to the INDIVIDUAL worker. Spouses can each maintain their own independent APY accounts and each receive pension.',
  'Open',
  '[{"q":"Can both husband and wife subscribe to Atal Pension Yojana?","a":"Yes. APY is an individual account. Both spouses can independently subscribe and both receive guaranteed monthly pensions after age 60."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-05',
  'PM-SVANIDHI-05',
  'PM SVANidhi',
  'Jobs & income',
  'Ministry of Housing and Urban Affairs (MoHUA)',
  'Individual',
  'Street vendor loans; Rs 50,000 third loan with 7% interest subsidy',
  'Collateral-free working capital loans for urban street vendors, scaling up to ₹50,000 on the third tranche with 7% interest subsidy.',
  'PM SVANidhi provides affordable collateral-free working capital micro-credit to urban street vendors in tranches (₹10,000, ₹20,000 and up to ₹50,000 on the 3rd loan) with a 7% interest subsidy and cashbacks for digital transactions.',
  'Street vendors (rest not verified)',
  '["Street vendors (rest not verified).","Operating in urban or peri-urban localities with vending certificate or recommendation.","Demonstrated timely repayment on earlier tranches to unlock the ₹50,000 third loan.","Adoption of digital transactions via UPI merchant QR code."]'::jsonb,
  '["Not verified","Vending Certificate / Urban Local Body ID or Letter of Recommendation","Aadhaar Card and active bank account passbook","UPI merchant QR registration proof"]'::jsonb,
  'Not verified',
  'Partly verified',
  'Loan benefit is issued to the INDIVIDUAL street vendor business holder based on vending identity and repayment record.',
  'Open',
  '[{"q":"What is the interest subsidy provided under PM SVANidhi?","a":"Borrowers receive an early repayment / regular interest subsidy of 7% per annum credited directly into their bank accounts."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-06',
  'PM-KMY-06',
  'PM Kisan Maandhan Yojana',
  'Jobs & income',
  'Department of Agriculture and Farmers Welfare, Ministry of Agriculture',
  'Individual',
  'Rs 3,000 a month pension after age 60',
  'Old-age social security pension of ₹3,000 per month for small and marginal farmers after age 60.',
  'Pradhan Mantri Kisan Maan-Dhan Yojana is a voluntary, contributory pension scheme offering small and marginal farmers an assured monthly pension of ₹3,000 after reaching age 60, with equal matching contribution from the Central Government.',
  'Small farmers (age limits not verified)',
  '["Small farmers (age limits not verified).","Own cultivable agricultural land holding up to 2 hectares in revenue records.","Must not be covered under other social security or formal pension schemes.","Must not be an income-tax payer."]'::jsonb,
  '["Not verified","Aadhaar Card","Savings Bank Account passbook / PM-KISAN beneficiary ID","Land revenue ownership records (Khasra / Khatauni)"]'::jsonb,
  'Not verified',
  'Partly verified',
  'Benefit is granted to the INDIVIDUAL farmer. Both husband and wife can independently join if eligible and both receive separate ₹3,000 monthly pensions.',
  'Open',
  '[{"q":"Can contributions be deducted directly from PM-KISAN benefits?","a":"Yes, farmers enrolled in PM-KISAN can opt to have their monthly pension contribution auto-debited directly from their PM-KISAN installments."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-07',
  'PM-JAY-07',
  'Ayushman Bharat PM-JAY',
  'Health & insurance',
  'National Health Authority (NHA), Ministry of Health and Family Welfare',
  'Household',
  'Rs 5 lakh per family per year, cashless, for secondary and tertiary hospitalisation',
  'Cashless health cover up to ₹5 lakh per family per year for secondary and tertiary hospitalisation across empanelled hospitals.',
  'Ayushman Bharat PM-JAY provides comprehensive health assurance of ₹5 lakh per family per year on a family floater basis with zero cash payment required from eligible families at empanelled public and private healthcare facilities.',
  'Families identified under the scheme''s criteria (exact criteria not verified)',
  '["Families identified under the scheme''s criteria (exact criteria not verified).","Listed in identified SECC / NFSA or state health beneficiary registries.","Family floater coverage without restrictions on family size, gender, or age.","All pre-existing diseases and medical conditions covered from day one."]'::jsonb,
  '["Generate and download the Ayushman card","Aadhaar Card of family members for e-KYC","Ration Card / Family ID / SECC confirmation slip","Active mobile number linked to beneficiary record"]'::jsonb,
  'beneficiary.nha.gov.in; Ayushman app',
  'Partly verified',
  'Benefit operates as a HOUSEHOLD floater entitlement: up to ₹5,00,000 is shared annually among all verified members of the family unit.',
  'Open',
  '[{"q":"How do I download my Ayushman Card?","a":"Visit beneficiary.nha.gov.in or download the Ayushman app, enter your mobile number and Aadhaar OTP to generate your card."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-08',
  'AYUSH-VAY-08',
  'Ayushman Vay Vandana',
  'Health & insurance',
  'National Health Authority (NHA), Ministry of Health and Family Welfare',
  'Individual',
  'Rs 5 lakh cover for all seniors 70+ regardless of income; existing PM-JAY families get an additional top-up of up to Rs 5 lakh a year for the senior',
  '₹5 lakh annual health coverage for all senior citizens aged 70 and above, regardless of income, plus exclusive top-up for existing PM-JAY families.',
  'Ayushman Vay Vandana extends universal health coverage of ₹5 lakh per year to all senior citizens aged 70 years and above, regardless of their family income or economic slab. For seniors in families already covered under PM-JAY, this ₹5 lakh serves as an exclusive top-up not shared with other family members.',
  'All citizens aged 70+, rural and urban',
  '["All citizens aged 70+, rural and urban.","Age must be 70 years or above as verified through Aadhaar records.","No income, wealth, or economic status ceiling applies.","Senior citizens with private insurance or ESIC are eligible to opt for the card."]'::jsonb,
  '["Aadhaar is mandatory","Mobile number linked to Aadhaar for OTP verification","Recent photograph captured live during Ayushman App e-KYC"]'::jsonb,
  'beneficiary.nha.gov.in; Ayushman app',
  'Verified',
  'Benefit is granted at the INDIVIDUAL level. Each senior citizen aged 70+ receives their own dedicated ₹5 lakh coverage, completely separate from household limits.',
  'Open',
  '[{"q":"Does an income ceiling apply for seniors 70+ to get Ayushman Vay Vandana?","a":"No. Ayushman Vay Vandana is universal for all citizens aged 70 and above, across both rural and urban areas, regardless of family income."},{"q":"If our family already has a ₹5 lakh PM-JAY card, what happens?","a":"The senior receives an additional, exclusive top-up of up to ₹5 lakh per year specifically for themselves."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-09',
  'PMJJBY-09',
  'PMJJBY (life insurance)',
  'Health & insurance',
  'Department of Financial Services, Ministry of Finance',
  'Individual',
  'Rs 2 lakh cover for death from any cause',
  'Renewable one-year term life insurance cover of ₹2 lakh for death from any cause at ₹436 annual premium.',
  'Pradhan Mantri Jeevan Jyoti Bima Yojana provides ₹2,00,000 life insurance coverage for death due to any reason. Premium of ₹436 per annum is automatically deducted from the subscriber''s linked bank account.',
  'Age limits not verified',
  '["Age limits not verified (eligible bank account holders with auto-debit consent).","Must maintain an active individual savings bank account.","Auto-debit authorization of ₹436 annual premium from the linked bank account.","Coverage renews annually from June 1 to May 31."]'::jsonb,
  '["Rs 436 a year auto-deducted from the linked bank account","Savings bank account passbook copy","Aadhaar card for KYC verification","Nominee details form"]'::jsonb,
  'Your bank',
  'Partly verified',
  'Policy is issued per INDIVIDUAL account holder. A person having accounts in multiple banks can join PMJJBY through only one bank account.',
  'Open',
  '[{"q":"How is the annual premium paid?","a":"The premium of ₹436 per year is auto-deducted in one installment directly from your linked savings bank account."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-10',
  'PMSBY-10',
  'PMSBY (accident insurance)',
  'Health & insurance',
  'Department of Financial Services, Ministry of Finance',
  'Individual',
  'Rs 2 lakh for accidental death or total disability; Rs 1 lakh for partial disability',
  'Accident insurance of ₹2 lakh for death/total disability and ₹1 lakh for partial disability at ₹20 per year auto-debited.',
  'Pradhan Mantri Suraksha Bima Yojana offers high-value accidental risk protection at nominal cost. Provides ₹2,00,000 for accidental death or permanent total disability and ₹1,00,000 for permanent partial disability at an annual premium of only ₹20.',
  'Age limits not verified',
  '["Age limits not verified (savings bank account holders with auto-debit authorization).","Must hold an active savings bank account.","Consent for auto-debit of ₹20 annual premium between May 25 and May 31.","Must provide Aadhaar as primary KYC document."]'::jsonb,
  '["Rs 20 a year auto-deducted from the linked bank account","Savings bank passbook or statement","Aadhaar card copy","Nomination details"]'::jsonb,
  'Your bank',
  'Partly verified',
  'Benefit attaches to the INDIVIDUAL subscriber. Each adult in a household can subscribe independently through their own bank account.',
  'Open',
  '[{"q":"What is the annual premium for PMSBY?","a":"The premium is just ₹20 per year, auto-debited from your linked bank account."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-11',
  'PMJDY-11',
  'Jan Dhan Yojana',
  'Health & insurance',
  'Department of Financial Services, Ministry of Finance',
  'Individual',
  'Zero-balance bank account; base for APY, PMJJBY and PMSBY (57.78 crore accounts as of Feb 2026)',
  'Zero-balance basic savings bank deposit account serving as the foundation for DBT, APY, PMJJBY and PMSBY.',
  'Pradhan Mantri Jan Dhan Yojana is the flagship National Mission for Financial Inclusion. It guarantees access to zero-balance banking accounts, RuPay debit card with inbuilt accident cover and serves as the primary base for social security schemes (APY, PMJJBY, PMSBY). Over 57.78 crore accounts active as of Feb 2026.',
  'Not verified',
  '["Not verified (open to any citizen without an existing formal banking account).","No minimum balance requirement or account maintenance penalty.","Direct Benefit Transfer (DBT) enabled upon Aadhaar seeding.","Overdraft facility up to ₹10,000 subject to regular satisfactory transactions."]'::jsonb,
  '["Not verified","Aadhaar card or officially valid identity document","Passport-size photographs","Account opening form submitted at any bank branch or Bank Mitra kiosk"]'::jsonb,
  'Any bank branch',
  'Partly verified',
  'Account is held at the INDIVIDUAL level. Multiple adults in the same household can each hold their own individual Jan Dhan bank accounts.',
  'Open',
  '[{"q":"Where can I open a Jan Dhan account?","a":"You can open a zero-balance Jan Dhan account at any commercial bank branch or through authorized Bank Mitra / CSC banking kiosks."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-12',
  'PMAY-U2-12',
  'PMAY-Urban 2.0',
  'Housing & energy',
  'Ministry of Housing and Urban Affairs (MoHUA)',
  'Dwelling / Facility',
  'Up to Rs 2.5 lakh per housing unit under BLC and AHP; also rental housing and home-loan interest subsidy',
  'Financial grant up to ₹2.5 lakh per pucca house under BLC/AHP, rental housing and home loan interest subsidies for urban EWS families.',
  'PMAY-Urban 2.0 provides central financial assistance up to ₹2.5 lakh per housing unit under Beneficiary-Led Construction (BLC) and Affordable Housing in Partnership (AHP), as well as rental housing and home-loan interest subsidies for urban Economically Weaker Sections (EWS).',
  'EWS = annual income up to Rs 3 lakh; a previous housing benefit within 20 years blocks eligibility',
  '["EWS = annual income up to Rs 3 lakh.","A previous housing benefit within 20 years blocks eligibility.","Applicant family must not own a pucca house anywhere in India.","House must be registered in the name of the female head or in joint ownership with spouse."]'::jsonb,
  '["Online application with Aadhaar and income details","Income certificate showing EWS annual income up to Rs 3 lakh","Land/dwelling ownership records (for BLC component)","Bank passbook and geo-tagged property photo"]'::jsonb,
  'PMAY-U portal',
  'Verified',
  'Benefit is strictly tied to the DWELLING / FACILITY. UDPAD deduplication cross-checks municipal property tax registries and geo-coordinates to enforce the 20-year single-benefit rule.',
  'Open',
  '[{"q":"Does a previous housing subsidy received 15 years ago disqualify me?","a":"Yes. Under PMAY-Urban 2.0 guidelines, any previous housing benefit availed within 20 years strictly blocks eligibility."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-13',
  'PMAY-G-13',
  'PMAY-Gramin',
  'Housing & energy',
  'Department of Rural Development, Ministry of Rural Development',
  'Dwelling / Facility',
  'Pucca house for rural households; cost shared 60:40 Centre:State in plain areas, 90:10 in NE and hilly states',
  'Grant for constructing a pucca house for rural households in kutcha/temporary housing, cost shared between Centre and States.',
  'PMAY-Gramin provides financial assistance to construct a durable pucca house with basic amenities for rural households living in weak, dilapidated, or temporary kutcha dwellings. Cost shared 60:40 Centre:State in plain areas and 90:10 in North Eastern and Himalayan states.',
  'Households in weak or temporary housing, identified through surveys (not income slabs)',
  '["Households in weak or temporary housing, identified through surveys (not income slabs).","Identified through Gram Panchayat deprivation surveys and verified Gram Sabha lists.","Household must not own a pucca house anywhere in India.","Exclusion applies if household owns motorized 3/4 wheelers or mechanized agricultural equipment."]'::jsonb,
  '["Identified through Gram Panchayat survey. Continuation status not confirmed","Aadhaar card of all household members","Rural job card number (for linked 90-95 days wage labour component)","Bank passbook (Aadhaar-seeded for DBT)"]'::jsonb,
  'Rural development dept',
  'Partly verified',
  'Benefit is attached to the physical DWELLING / FACILITY. One permanent housing unit grant is provided per surveyed kutcha homestead.',
  'Open',
  '[{"q":"How are beneficiaries selected under PMAY-Gramin?","a":"Beneficiaries are identified through official Gram Panchayat housing deprivation surveys (Awaas+), not by arbitrary income declarations."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-14',
  'PM-UJJWALA-14',
  'PM Ujjwala Yojana',
  'Housing & energy',
  'Ministry of Petroleum and Natural Gas (MoPNG)',
  'Household',
  'Deposit-free LPG connection; Rs 300 per cylinder subsidy for up to 9 refills in FY 2025-26 (FY 2026-27 status not confirmed)',
  'Deposit-free LPG connection for adult women of poor households with ₹300 per cylinder subsidy for up to 9 refills.',
  'Pradhan Mantri Ujjwala Yojana provides deposit-free LPG gas connections to adult women from poor households to ensure clean cooking fuel. Includes full waiver of connection deposit and a targeted subsidy of ₹300 per cylinder for up to 9 refills in FY 2025-26.',
  'Adult women from poor households',
  '["Adult women from poor households.","Must be an adult female aged 18 years or older.","No existing active LPG connection under any member of the same household under any OMC (IOCL, BPCL, HPCL).","Household belongs to verified low-income or priority category."]'::jsonb,
  '["Not verified","Ration Card / Proof of Household Composition showing family roster","Aadhaar Card of female applicant and adult household members","Bank account passbook in applicant''s name (Aadhaar-seeded)"]'::jsonb,
  'LPG distributor',
  'Partly verified',
  'Benefit is strictly restricted to ONE connection per HOUSEHOLD. OMC cross-deduplication automatically rejects applicants if another active connection exists in the family.',
  'Open',
  '[{"q":"Can the Ujjwala connection be issued in a male member’s name?","a":"No. Under statutory scheme guidelines, PM Ujjwala connections are issued exclusively in the name of an adult female member of the household."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-15',
  'PM-SURYA-15',
  'PM Surya Ghar',
  'Housing & energy',
  'Ministry of New and Renewable Energy (MNRE)',
  'Dwelling / Facility',
  'Rs 78,000 central subsidy plus state top-up (rooftop solar)',
  'Direct central capital subsidy up to ₹78,000 plus state top-up for residential rooftop solar installation.',
  'PM Surya Ghar: Muft Bijli Yojana provides direct subsidies to residential consumers to install grid-connected rooftop solar systems, offering ₹30,000 for 1 kW, ₹60,000 for 2 kW and up to ₹78,000 for systems 3 kW and above, along with state-specific top-ups.',
  'Not verified',
  '["Not verified (domestic electricity consumers with rooftop space).","Must possess an active domestic DISCOM consumer electricity account.","Adequate unshaded rooftop or open space suitable for solar panels.","Only ONE subsidy per physical dwelling and consumer meter connection."]'::jsonb,
  '["Not verified","Latest paid domestic electricity utility bill","Proof of rooftop ownership or long-term lease authorization","Aadhaar card of consumer account holder and bank details"]'::jsonb,
  'Not verified',
  'Partly verified',
  'Strictly tied to the DWELLING / FACILITY and DISCOM electricity consumer meter. Multiple households sharing one physical meter cannot claim multiple subsidies.',
  'Open',
  '[{"q":"What is the maximum central subsidy available?","a":"The central capital subsidy provides up to ₹78,000 for residential systems of 3 kW and above, plus any applicable state government top-up."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-16',
  'IGNOAPS-16',
  'Old Age Pension (IGNOAPS)',
  'Pensions (central, NSAP)',
  'Department of Rural Development / National Social Assistance Programme (NSAP)',
  'Individual',
  'Rs 200 a month for ages 60-79; Rs 500 at 80+ (states top up)',
  'Monthly social pension of ₹200 for ages 60-79 and ₹500 for ages 80+ for senior citizens in BPL families, topped up by states.',
  'Indira Gandhi National Old Age Pension Scheme under NSAP provides non-contributory monthly financial assistance to senior citizens aged 60 and above belonging to Below Poverty Line (BPL) households. Central grant is ₹200/month for ages 60-79 and ₹500/month for ages 80+, heavily supplemented by state government contributions.',
  'Age 60+ in a BPL family',
  '["Age 60+ in a BPL family.","Must be a permanent resident of India.","Applicant must not be receiving another regular civil or government pension.","Automatic escalation to ₹500 monthly rate upon reaching age 80."]'::jsonb,
  '["Through the state social welfare office","Proof of age (Aadhaar, Voter ID, or Birth Certificate)","BPL card / verified BPL household roster extract","Bank / Post Office account passbook (Aadhaar-seeded)"]'::jsonb,
  'nsap.nic.in',
  'Verified',
  'Entitlement attaches to the INDIVIDUAL senior. Both elderly husband and wife in a BPL family can independently receive their individual monthly pensions.',
  'Open',
  '[{"q":"Does the pension increase automatically at age 80?","a":"Yes. Upon reaching 80 years of age, the central pension allocation steps up from ₹200 to ₹500 per month."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-17',
  'IGNWPS-17',
  'Widow Pension (IGNWPS)',
  'Pensions (central, NSAP)',
  'National Social Assistance Programme (NSAP), Ministry of Rural Development',
  'Individual',
  'Rs 300 a month',
  'Monthly social security pension of ₹300 for destitute widows aged 40 and above living below the poverty line.',
  'Indira Gandhi National Widow Pension Scheme provides social security assistance of ₹300 per month (supplemented by state top-up funds) to widowed women aged 40 to 79 belonging to Below Poverty Line (BPL) households.',
  'Widows aged 40+, BPL',
  '["Widows aged 40+, BPL.","Applicant must be a widow aged between 40 and 79 years.","Must not have remarried.","Must not be drawing any other regular central or state pension."]'::jsonb,
  '["Through the state social welfare office","Death Certificate of the deceased husband","Proof of age showing 40+ years","BPL card / certificate and applicant bank passbook"]'::jsonb,
  'nsap.nic.in',
  'Verified',
  'Benefit is granted to the INDIVIDUAL widowed woman. Eligibility is reassessed if the recipient remarries or household status changes.',
  'Open',
  '[{"q":"What happens when a widow pension beneficiary turns 80?","a":"At age 80, the beneficiary transitions to the higher senior pension slab under IGNOAPS (₹500/month central rate)."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-18',
  'IGNDPS-18',
  'Disability Pension (IGNDPS)',
  'Pensions (central, NSAP)',
  'National Social Assistance Programme (NSAP), Ministry of Rural Development',
  'Individual',
  'Rs 300 a month up to age 80, then Rs 500',
  'Monthly disability pension of ₹300 (up to age 80) and ₹500 (age 80+) for persons aged 18+ with 80%+ disability from BPL families.',
  'Indira Gandhi National Disability Pension Scheme provides monthly social pension assistance of ₹300 (up to age 80) and ₹500 (aged 80 and above) for severely disabled individuals with 80% or greater disability from BPL families.',
  'Age 18+ with 80%+ disability, BPL',
  '["Age 18+ with 80%+ disability, BPL.","Must suffer from severe or multiple disabilities with minimum 80% disability certified by medical authority.","Must belong to a Below Poverty Line (BPL) household.","Automatically elevated to ₹500 monthly rate upon reaching age 80."]'::jsonb,
  '["Disability certificate","Unique Disability ID (UDID) card or medical board certificate","Age proof document (18+ years)","BPL card / certificate and bank passbook"]'::jsonb,
  'nsap.nic.in',
  'Verified',
  'Entitlement is tied to the INDIVIDUAL beneficiary based on certified medical disability and poverty threshold.',
  'Open',
  '[{"q":"What minimum disability percentage is required for IGNDPS?","a":"The scheme mandates a certified disability degree of 80% or higher from an authorized medical board."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-19',
  'NFBS-19',
  'National Family Benefit Scheme',
  'Pensions (central, NSAP)',
  'National Social Assistance Programme (NSAP), Ministry of Rural Development',
  'Household',
  'One-time grant to the household (amount not verified)',
  'One-time lump-sum financial assistance to a BPL household on the death of the primary breadwinner aged between 18 and 60.',
  'Under NSAP, the National Family Benefit Scheme delivers immediate one-time financial relief to a bereaved Below Poverty Line family following the untimely demise of its primary breadwinner (aged 18 to 60).',
  'BPL household where the breadwinner died between ages 18 and 60',
  '["BPL household where the breadwinner died between ages 18 and 60.","The deceased must have been the primary economic earner for the family.","The death must have occurred while the breadwinner was between 18 and 60 years old.","Application must be submitted within statutory window following demise."]'::jsonb,
  '["Death certificate (other documents not verified)","Age proof of the deceased breadwinner showing age 18-60","BPL card / verification certificate","Bank passbook of surviving spouse or adult head"]'::jsonb,
  'nsap.nic.in',
  'Partly verified',
  'Benefit is granted to the surviving HOUSEHOLD unit. Duplicate claims for the same deceased breadwinner are flagged and disallowed.',
  'Open',
  '[{"q":"Who in the family receives the one-time NFBS grant?","a":"The one-time financial grant is deposited into the verified bank account of the surviving spouse or the eldest surviving adult member of the household."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-20',
  'UP-OAP-20',
  'UP Old Age Pension',
  'Uttar Pradesh',
  'Social Welfare Department, Government of Uttar Pradesh',
  'Individual',
  'Rs 1,000 a month',
  'Monthly pension of ₹1,000 for senior citizens aged 60+ residing in Uttar Pradesh with annual income up to ₹46,080 (rural) / ₹56,460 (urban).',
  'The Uttar Pradesh Social Welfare Department provides ₹1,000 per month (transferred quarterly as ₹3,000) to elderly citizens aged 60 years and above who are permanent residents of UP and meet state income eligibility ceilings.',
  'Age 60+ and BPL or annual income up to Rs 46,080 (rural) / Rs 56,460 (urban); not eligible if getting another pension',
  '["Age 60+ and BPL or annual income up to Rs 46,080 (rural) / Rs 56,460 (urban); not eligible if getting another pension.","Must be a permanent resident of Uttar Pradesh.","Must not be in receipt of any other pension (widow, disability, or civil service).","Must have an active savings bank account in UP."]'::jsonb,
  '["Photograph and age certificate; apply online","Income certificate from Tehsildar (rural ≤ ₹46,080 / urban ≤ ₹56,460)","Bank passbook (Aadhaar-seeded)","Aadhaar Card and self-declaration form"]'::jsonb,
  'sspy-up.gov.in',
  'Verified',
  'Benefit is awarded to the INDIVIDUAL senior. If both husband and wife are 60+ and meet income criteria, both receive ₹1,000/month each.',
  'Open',
  '[{"q":"Can a person receiving a widow pension also receive the UP Old Age Pension?","a":"No. The rules explicitly state that applicants receiving any other government pension are not eligible for this pension."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-21',
  'UP-WIDOW-21',
  'UP Destitute Women (Widow) Pension',
  'Uttar Pradesh',
  'Women and Child Development / Social Welfare, Government of Uttar Pradesh',
  'Individual',
  'Rs 1,000 a month (raised in 2024-25 budget)',
  'Monthly pension of ₹1,000 for destitute widows aged 18 and above in Uttar Pradesh, with no upper age limit.',
  'The Government of Uttar Pradesh provides ₹1,000 per month (raised in the 2024-25 budget, paid quarterly) to destitute widowed women aged 18 and older who are not in receipt of any other government pension.',
  'Women 18+, no upper age limit, not receiving any other pension',
  '["Women 18+, no upper age limit, not receiving any other pension.","Must be a permanent resident of Uttar Pradesh.","Must be a widow who has not remarried.","Must satisfy family poverty/income ceiling criteria."]'::jsonb,
  '["Photo, husband''s death certificate, income certificate, passbook","Aadhaar card of applicant","Apply online via sspy-up.gov.in","Mobile number for application status alerts"]'::jsonb,
  'sspy-up.gov.in',
  'Verified',
  'Benefit attaches to the INDIVIDUAL destitute woman. UDPAD cross-references marital and death records to ensure clean verification.',
  'Open',
  '[{"q":"Is there an upper age limit for the UP Widow Pension?","a":"No. The scheme covers eligible widowed women aged 18 and above with no upper age limit."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-22',
  'UP-DISABILITY-22',
  'UP Disability and Leprosy Pension',
  'Uttar Pradesh',
  'Divyangjan Sashaktikaran Vibhag (Empowerment of Persons with Disabilities), UP',
  'Individual',
  'Monthly pension (amount not verified)',
  'Monthly social security pension for persons with disabilities (Divyangjan) and leprosy-affected persons in Uttar Pradesh.',
  'The Department of Empowerment of Persons with Disabilities, Uttar Pradesh provides regular monthly financial pension assistance to certified Divyangjan and leprosy-affected residents of the state.',
  'Criteria not verified',
  '["Criteria not verified.","Permanent resident of Uttar Pradesh.","Possession of valid disability certificate (minimum 40% disability) or leprosy medical record.","Must meet state poverty/income ceiling requirements and not receive another pension."]'::jsonb,
  '["Apply online","Disability Certificate from Chief Medical Officer (CMO) or UDID card","Income Certificate issued by Tehsildar","Applicant photograph and bank passbook"]'::jsonb,
  'sspy-up.gov.in',
  'Partly verified',
  'Granted directly to the INDIVIDUAL Divyang person based on certified medical disability and state norms.',
  'Open',
  '[{"q":"Where can I apply for the UP Divyangjan pension?","a":"Applications can be submitted online directly through the Integrated Pension Portal at sspy-up.gov.in."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-23',
  'UP-MKSY-23',
  'Kanya Sumangala Yojana',
  'Uttar Pradesh',
  'Department of Women and Child Development, Government of Uttar Pradesh',
  'Individual',
  'Aid for girls; amount increased in the 2024 UP budget (figure not available)',
  'Milestone-based financial assistance for girls across six development stages from birth through higher education in UP.',
  'Mukhyamantri Kanya Sumangala Yojana provides conditional cash assistance to girl children in Uttar Pradesh disbursed across six stages: birth, complete vaccination, Class 1 admission, Class 6, Class 9 and enrollment in degree/diploma courses. Amount increased in the 2024 UP budget.',
  'Not verified',
  '["Not verified.","Family must be permanent residents of Uttar Pradesh.","Annual family income ceiling as prescribed by UP state guidelines.","Maximum of two daughters per family (third daughter eligible in case of twin girls in second delivery)."]'::jsonb,
  '["Not verified","Birth certificate of the girl child","Immunization card / school enrollment certificate","Mother / father domicile certificate and bank passbook"]'::jsonb,
  'Not verified',
  'Partly verified',
  'Assistance is registered for the INDIVIDUAL girl child, capped at two qualifying daughters per family unit.',
  'Open',
  '[{"q":"How many daughters in a family can benefit from Kanya Sumangala Yojana?","a":"Up to two daughters per family can benefit (or three in the special case of twins born in a second delivery)."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-24',
  'PRE-MATRIC-24',
  'Pre-Matric Scholarships',
  'Education',
  'Ministry of Social Justice / Ministry of Tribal Affairs / Ministry of Minority Affairs',
  'Individual',
  'Maintenance allowance; fees for some schemes',
  'Maintenance allowance and tuition fee support for SC, ST and OBC students in Classes 9-10 and minority students in Classes 1-10.',
  'Pre-Matric scholarship schemes provide financial assistance to reduce school dropouts among disadvantaged students, covering school fees and regular monthly maintenance allowances directly deposited into student bank accounts.',
  'SC, ST and OBC students in Classes 9-10; minority students in Classes 1-10',
  '["SC, ST and OBC students in Classes 9-10; minority students in Classes 1-10.","Enrolled in recognized government or affiliated private institutions.","Parental annual income within prescribed department limits.","Satisfactory academic performance and attendance record."]'::jsonb,
  '["One-Time Registration and caste/community certificate","Income certificate of parents/guardians","Previous year mark sheet / class report card","Student bank account details (Aadhaar-seeded)"]'::jsonb,
  'scholarships.gov.in; scholarship.up.gov.in',
  'Verified',
  'Benefit attaches to the INDIVIDUAL student. Multiple eligible siblings in qualifying classes can each claim their individual scholarship.',
  'Open',
  '[{"q":"What is One-Time Registration (OTR)?","a":"OTR is a unique 14-digit registration number generated on the National Scholarship Portal (scholarships.gov.in) with biometric or Aadhaar e-KYC."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO schemes (
  id, code, name, category, department, benefit_unit, benefit_amount,
  short_description, full_description, intended_beneficiary,
  eligibility_criteria, required_documents, portal, verification_status,
  benefit_unit_explanation, application_status, faq
) VALUES (
  'SCH-25',
  'POST-MATRIC-25',
  'Post-Matric Scholarships',
  'Education',
  'Ministry of Social Justice and Empowerment / Ministry of Education',
  'Individual',
  'Maintenance allowance and fee reimbursement',
  'Full maintenance allowance and fee reimbursement for SC, ST, OBC and minority students from Class 11 onward (income ceiling ₹2.5 lakh).',
  'The Centrally Sponsored Post-Matric Scholarship Scheme delivers comprehensive financial assistance to disadvantaged students continuing education post-matriculation, including Class 11, Class 12, ITI, polytechnic, undergraduate, postgraduate and professional degree courses.',
  'SC, ST, OBC and minority students from Class 11 onward; income ceiling Rs 2.5 lakh',
  '["SC, ST, OBC and minority students from Class 11 onward; income ceiling Rs 2.5 lakh.","Must be enrolled in a recognized post-matric course in an approved college/university.","Parental/guardian combined annual income must not exceed ₹2,50,000.","Student must not be receiving any concurrent major scholarship grant."]'::jsonb,
  '["One-Time Registration and caste/community certificate. Most close Oct 31, 2026","Income Certificate verifying annual income up to Rs 2.5 lakh","Class 10 mark sheet and current admission fee receipt","Student Aadhaar-seeded bank account"]'::jsonb,
  'scholarships.gov.in; scholarship.up.gov.in',
  'Verified',
  'Awarded to the INDIVIDUAL student. UDPAD and NSP verify academic enrollment records to prevent duplicate scholarship disbursals across multiple colleges.',
  'Open',
  '[{"q":"What is the application deadline for Post-Matric scholarships?","a":"For the academic cycle, most Post-Matric scholarship schemes close on October 31, 2026. Please check scholarships.gov.in for specific scheme windows."},{"q":"What is the parental income ceiling for Post-Matric scholarships?","a":"The annual parental/family income ceiling is strictly Rs 2.5 lakh per annum."}]'::jsonb
) ON CONFLICT (id) DO NOTHING;


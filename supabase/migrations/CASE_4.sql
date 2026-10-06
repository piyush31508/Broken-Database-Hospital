-- =============================================================================
-- Case 004: Lab Results Out of Order
-- Broken Database Hospital — Pathology results feed
-- =============================================================================
--
-- Bug setup:
--   The pathology results feed is supposed to show the 50 most recent
--   finalized lab results first.
--
--   The broken query sorts collected_at ASC, which puts the oldest results
--   first. It also does not explicitly handle NULL collected_at values,
--   allowing results with missing collection timestamps to appear in the
--   wrong position depending on PostgreSQL's default NULL ordering.
--
-- Broken query:
--   SELECT patient_id, test_name, result_value, collected_at
--   FROM lab_results
--   WHERE status = 'final'
--   ORDER BY collected_at ASC
--   LIMIT 50;
--
-- Intended fix (do not spoil for players in the UI):
--   ORDER BY collected_at DESC NULLS LAST
--
-- The table intentionally does NOT use a foreign key for patient_id.
-- This keeps Case 004 isolated and allows the case to work independently
-- from the patient/admissions data used in Case 001.
-- =============================================================================


CREATE SCHEMA IF NOT EXISTS hospital;


-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hospital.lab_results (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id      BIGINT NOT NULL,
  test_name       TEXT NOT NULL,
  result_value    TEXT NOT NULL,
  collected_at    TIMESTAMPTZ,
  status          TEXT NOT NULL CHECK (
    status IN ('pending', 'final', 'cancelled', 'corrected')
  ),
  resulted_at     TIMESTAMPTZ,
  lab_department  TEXT NOT NULL DEFAULT 'Pathology',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_lab_results_status_collected_at
  ON hospital.lab_results (status, collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id
  ON hospital.lab_results (patient_id);

CREATE INDEX IF NOT EXISTS idx_lab_results_collected_at
  ON hospital.lab_results (collected_at);


-- ---------------------------------------------------------------------------
-- Convenience view in public
-- ---------------------------------------------------------------------------
-- Allows the game/player query to use:
--
--   FROM lab_results
--
-- instead of:
--
--   FROM hospital.lab_results
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.lab_results AS
  SELECT * FROM hospital.lab_results;


-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA hospital
  TO anon, authenticated, service_role;

GRANT SELECT ON hospital.lab_results
  TO anon, authenticated, service_role;

GRANT SELECT ON public.lab_results
  TO anon, authenticated, service_role;


-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
--
-- The dataset deliberately contains:
--
--   1. Recent finalized results
--   2. Older finalized results
--   3. NULL collected_at finalized results
--   4. Non-final results that should be excluded
--   5. More than 50 total finalized rows
--
-- This makes the broken ASC ordering visibly incorrect and gives the
-- player enough evidence to diagnose both ordering and NULL handling.
-- ---------------------------------------------------------------------------

TRUNCATE hospital.lab_results RESTART IDENTITY CASCADE;


-- ---------------------------------------------------------------------------
-- Recent finalized results
-- ---------------------------------------------------------------------------

INSERT INTO hospital.lab_results
  (patient_id, test_name, result_value, collected_at, status, resulted_at, notes)
VALUES

  (1001, 'Troponin I',              '0.08 ng/mL',      NOW() - INTERVAL '8 minutes',   'final', NOW() - INTERVAL '3 minutes',  'Recent cardiac panel'),
  (1002, 'CBC - Hemoglobin',        '13.8 g/dL',       NOW() - INTERVAL '15 minutes',  'final', NOW() - INTERVAL '7 minutes',  'Routine CBC'),
  (1003, 'Lactate',                 '2.1 mmol/L',      NOW() - INTERVAL '24 minutes',  'final', NOW() - INTERVAL '12 minutes', 'Sepsis screening'),
  (1004, 'Potassium',               '4.2 mmol/L',      NOW() - INTERVAL '31 minutes',  'final', NOW() - INTERVAL '18 minutes', 'BMP'),
  (1005, 'Creatinine',              '1.1 mg/dL',       NOW() - INTERVAL '42 minutes',  'final', NOW() - INTERVAL '25 minutes', 'Renal function'),
  (1006, 'Glucose',                 '108 mg/dL',        NOW() - INTERVAL '55 minutes',  'final', NOW() - INTERVAL '35 minutes', 'Metabolic panel'),
  (1007, 'WBC',                     '11.2 K/uL',       NOW() - INTERVAL '1 hour 10 minutes', 'final', NOW() - INTERVAL '48 minutes', 'CBC'),
  (1008, 'Platelets',               '242 K/uL',        NOW() - INTERVAL '1 hour 25 minutes', 'final', NOW() - INTERVAL '1 hour', 'CBC'),
  (1009, 'CRP',                     '7.4 mg/L',        NOW() - INTERVAL '1 hour 40 minutes', 'final', NOW() - INTERVAL '1 hour 15 minutes', 'Inflammation marker'),
  (1010, 'AST',                     '31 U/L',          NOW() - INTERVAL '2 hours',      'final', NOW() - INTERVAL '1 hour 30 minutes', 'Liver panel'),
  (1011, 'ALT',                     '28 U/L',          NOW() - INTERVAL '2 hours 15 minutes', 'final', NOW() - INTERVAL '1 hour 45 minutes', 'Liver panel'),
  (1012, 'Sodium',                  '139 mmol/L',      NOW() - INTERVAL '2 hours 30 minutes', 'final', NOW() - INTERVAL '2 hours', 'BMP'),
  (1013, 'TSH',                     '2.18 mIU/L',      NOW() - INTERVAL '3 hours',      'final', NOW() - INTERVAL '2 hours 20 minutes', 'Thyroid panel'),
  (1014, 'Ferritin',                '184 ng/mL',       NOW() - INTERVAL '3 hours 30 minutes', 'final', NOW() - INTERVAL '3 hours', 'Iron studies'),
  (1015, 'D-Dimer',                 '0.41 mg/L FEU',   NOW() - INTERVAL '4 hours',      'final', NOW() - INTERVAL '3 hours 20 minutes', 'Coagulation'),
  (1016, 'INR',                     '1.1',             NOW() - INTERVAL '4 hours 30 minutes', 'final', NOW() - INTERVAL '4 hours', 'Coagulation'),
  (1017, 'Magnesium',               '2.0 mg/dL',       NOW() - INTERVAL '5 hours',      'final', NOW() - INTERVAL '4 hours 20 minutes', 'Electrolytes'),
  (1018, 'Calcium',                 '9.3 mg/dL',       NOW() - INTERVAL '5 hours 30 minutes', 'final', NOW() - INTERVAL '5 hours', 'Electrolytes'),
  (1019, 'Albumin',                 '4.1 g/dL',        NOW() - INTERVAL '6 hours',      'final', NOW() - INTERVAL '5 hours 20 minutes', 'Liver panel'),
  (1020, 'Bilirubin Total',         '0.8 mg/dL',       NOW() - INTERVAL '6 hours 30 minutes', 'final', NOW() - INTERVAL '6 hours', 'Liver panel');


-- ---------------------------------------------------------------------------
-- Older finalized results
-- ---------------------------------------------------------------------------

INSERT INTO hospital.lab_results
  (patient_id, test_name, result_value, collected_at, status, resulted_at, notes)
VALUES

  (1021, 'Hemoglobin A1c',           '6.4%',           NOW() - INTERVAL '1 day',        'final', NOW() - INTERVAL '23 hours', 'Diabetes monitoring'),
  (1022, 'Vitamin B12',              '412 pg/mL',      NOW() - INTERVAL '1 day 3 hours', 'final', NOW() - INTERVAL '1 day 2 hours', 'Nutritional panel'),
  (1023, 'Folate',                   '11.8 ng/mL',     NOW() - INTERVAL '1 day 6 hours', 'final', NOW() - INTERVAL '1 day 5 hours', 'Nutritional panel'),
  (1024, 'LDL Cholesterol',          '118 mg/dL',      NOW() - INTERVAL '1 day 9 hours', 'final', NOW() - INTERVAL '1 day 8 hours', 'Lipid panel'),
  (1025, 'HDL Cholesterol',          '52 mg/dL',       NOW() - INTERVAL '1 day 12 hours', 'final', NOW() - INTERVAL '1 day 11 hours', 'Lipid panel'),
  (1026, 'Triglycerides',            '141 mg/dL',      NOW() - INTERVAL '1 day 15 hours', 'final', NOW() - INTERVAL '1 day 14 hours', 'Lipid panel'),
  (1027, 'Urine Protein',            'Negative',       NOW() - INTERVAL '2 days',       'final', NOW() - INTERVAL '47 hours', 'Urinalysis'),
  (1028, 'Urine Glucose',            'Negative',       NOW() - INTERVAL '2 days 4 hours', 'final', NOW() - INTERVAL '2 days 3 hours', 'Urinalysis'),
  (1029, 'Urine Ketones',            'Negative',       NOW() - INTERVAL '2 days 8 hours', 'final', NOW() - INTERVAL '2 days 7 hours', 'Urinalysis'),
  (1030, 'C-Reactive Protein',       '3.1 mg/L',       NOW() - INTERVAL '2 days 12 hours', 'final', NOW() - INTERVAL '2 days 11 hours', 'Inflammation marker'),
  (1031, 'ESR',                      '14 mm/hr',       NOW() - INTERVAL '3 days',       'final', NOW() - INTERVAL '70 hours', 'Inflammation marker'),
  (1032, 'Free T4',                  '1.2 ng/dL',      NOW() - INTERVAL '3 days 4 hours', 'final', NOW() - INTERVAL '3 days 3 hours', 'Thyroid panel'),
  (1033, 'Cortisol AM',              '14.6 ug/dL',     NOW() - INTERVAL '3 days 8 hours', 'final', NOW() - INTERVAL '3 days 7 hours', 'Endocrine'),
  (1034, 'Lipase',                   '42 U/L',         NOW() - INTERVAL '4 days',       'final', NOW() - INTERVAL '94 hours', 'Pancreatic panel'),
  (1035, 'Amylase',                  '71 U/L',         NOW() - INTERVAL '4 days 5 hours', 'final', NOW() - INTERVAL '4 days 4 hours', 'Pancreatic panel'),
  (1036, 'CK',                       '126 U/L',        NOW() - INTERVAL '4 days 10 hours', 'final', NOW() - INTERVAL '4 days 9 hours', 'Muscle enzyme'),
  (1037, 'BNP',                      '88 pg/mL',       NOW() - INTERVAL '5 days',       'final', NOW() - INTERVAL '118 hours', 'Cardiac marker'),
  (1038, 'Procalcitonin',            '0.07 ng/mL',     NOW() - INTERVAL '5 days 6 hours', 'final', NOW() - INTERVAL '5 days 5 hours', 'Infection marker'),
  (1039, 'Ammonia',                  '32 umol/L',      NOW() - INTERVAL '6 days',       'final', NOW() - INTERVAL '142 hours', 'Liver function'),
  (1040, 'Phosphate',                '3.7 mg/dL',      NOW() - INTERVAL '7 days',       'final', NOW() - INTERVAL '166 hours', 'Electrolytes');


-- ---------------------------------------------------------------------------
-- Finalized results with NULL collected_at
-- ---------------------------------------------------------------------------
--
-- These rows intentionally have no collection timestamp.
--
-- They are still finalized and therefore qualify for the feed.
-- The player needs to ensure that missing timestamps do not appear ahead
-- of real, timestamped recent results.
-- ---------------------------------------------------------------------------

INSERT INTO hospital.lab_results
  (patient_id, test_name, result_value, collected_at, status, resulted_at, notes)
VALUES

  (1041, 'Blood Culture',          'No growth',       NULL, 'final', NOW() - INTERVAL '10 minutes',
       'BUG DATA: collected_at missing'),

  (1042, 'Peripheral Smear',       'Normal',          NULL, 'final', NOW() - INTERVAL '25 minutes',
       'BUG DATA: collected_at missing'),

  (1043, 'Reticulocyte Count',     '1.8%',            NULL, 'final', NOW() - INTERVAL '40 minutes',
       'BUG DATA: collected_at missing'),

  (1044, 'PTT',                    '31 sec',          NULL, 'final', NOW() - INTERVAL '55 minutes',
       'BUG DATA: collected_at missing'),

  (1045, 'Fibrinogen',              '318 mg/dL',       NULL, 'final', NOW() - INTERVAL '1 hour',
       'BUG DATA: collected_at missing');


-- ---------------------------------------------------------------------------
-- Non-final results
-- ---------------------------------------------------------------------------
--
-- These should NOT appear in the final-results feed regardless of their
-- collection time.
-- ---------------------------------------------------------------------------

INSERT INTO hospital.lab_results
  (patient_id, test_name, result_value, collected_at, status, resulted_at, notes)
VALUES

  (1051, 'Troponin T',              'Pending',        NOW() - INTERVAL '2 minutes',  'pending', NULL,
       'Should be excluded: pending'),

  (1052, 'Blood Culture',           'In progress',    NOW() - INTERVAL '5 minutes',  'pending', NULL,
       'Should be excluded: pending'),

  (1053, 'CBC',                     'Cancelled',      NOW() - INTERVAL '30 minutes', 'cancelled', NULL,
       'Should be excluded: cancelled'),

  (1054, 'Glucose',                 '98 mg/dL',       NOW() - INTERVAL '1 hour',     'corrected',
       NOW() - INTERVAL '45 minutes', 'Should be excluded: corrected');


-- ---------------------------------------------------------------------------
-- Sanity checks
-- ---------------------------------------------------------------------------

-- 1. Show the broken ordering.
--
-- This puts the oldest timestamped finalized results first.
-- NULL placement will also be incorrect for the intended feed.
--
-- SELECT patient_id, test_name, result_value, collected_at
-- FROM lab_results
-- WHERE status = 'final'
-- ORDER BY collected_at ASC
-- LIMIT 50;


-- 2. Show the intended ordering.
--
-- The newest collected results should appear first and missing timestamps
-- should be pushed to the bottom.
--
-- SELECT patient_id, test_name, result_value, collected_at
-- FROM lab_results
-- WHERE status = 'final'
-- ORDER BY collected_at DESC NULLS LAST
-- LIMIT 50;


-- 3. Count finalized results.
--
-- Expected:
--   55 finalized rows
--
-- 20 recent
-- 20 older
-- 5 NULL timestamp rows
--
-- SELECT COUNT(*)
-- FROM lab_results
-- WHERE status = 'final';


-- 4. Inspect NULL timestamps.
--
-- Expected: 5 rows.
--
-- SELECT patient_id, test_name, result_value, collected_at
-- FROM lab_results
-- WHERE status = 'final'
--   AND collected_at IS NULL;


-- 5. Confirm non-final rows are excluded.
--
-- Expected: 4 rows.
--
-- SELECT patient_id, test_name, status, collected_at
-- FROM lab_results
-- WHERE status <> 'final';


INSERT INTO hospital.lab_results
  (patient_id, test_name, result_value, collected_at, status, resulted_at, notes)
VALUES
  (1046, 'Chloride', '103 mmol/L',
   NOW() - INTERVAL '7 days 4 hours',
   'final',
   NOW() - INTERVAL '7 days 3 hours',
   'Older finalized result'),

  (1047, 'Urea Nitrogen', '16 mg/dL',
   NOW() - INTERVAL '7 days 8 hours',
   'final',
   NOW() - INTERVAL '7 days 7 hours',
   'Older finalized result'),

  (1048, 'Total Protein', '7.1 g/dL',
   NOW() - INTERVAL '8 days',
   'final',
   NOW() - INTERVAL '7 days 23 hours',
   'Older finalized result'),

  (1049, 'Alkaline Phosphatase', '82 U/L',
   NOW() - INTERVAL '8 days 6 hours',
   'final',
   NOW() - INTERVAL '8 days 5 hours',
   'Older finalized result'),

  (1050, 'Direct Bilirubin', '0.2 mg/dL',
   NOW() - INTERVAL '9 days',
   'final',
   NOW() - INTERVAL '8 days 23 hours',
   'Older finalized result');

   
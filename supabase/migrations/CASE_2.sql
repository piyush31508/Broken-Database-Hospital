-- =============================================================================
-- Case 002: Duplicate Prescriptions
-- Broken Database Hospital — Pharmacy
-- =============================================================================
--
-- Bug setup:
--   A pharmacy refill query is supposed to identify patients who received
--   duplicate fills of the same medication during the last 7 days.
--
--   The broken query groups only by patient_id:
--
--     SELECT patient_id, medication, dosage, COUNT(*) as fills
--     FROM prescriptions
--     WHERE filled_at >= CURRENT_DATE - 7
--     GROUP BY patient_id
--     HAVING COUNT(*) > 1;
--
--   Problems:
--     1. medication and dosage are selected but are not included in GROUP BY.
--     2. Grouping only by patient_id combines different medications together.
--     3. The query does not identify duplicate fills of the SAME medication.
--
-- Intended outcome:
--   Identify patients who have received the same medication more than once
--   during the last 7 days.
--
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hospital.medications (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  medication_name TEXT NOT NULL UNIQUE,
  category        TEXT NOT NULL,
  dosage_form     TEXT NOT NULL,
  controlled      BOOLEAN NOT NULL DEFAULT FALSE,
  stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS hospital.prescriptions (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rx_id           TEXT NOT NULL,
  patient_id      BIGINT NOT NULL,
  medication_id   BIGINT NOT NULL,
  dosage          TEXT NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  filled_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pharmacy        TEXT NOT NULL DEFAULT 'Main Pharmacy',
  status          TEXT NOT NULL DEFAULT 'filled'
                  CHECK (status IN ('pending', 'filled', 'cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id
  ON hospital.prescriptions (patient_id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_medication_id
  ON hospital.prescriptions (medication_id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_filled_at
  ON hospital.prescriptions (filled_at DESC);

CREATE INDEX IF NOT EXISTS idx_prescriptions_rx_id
  ON hospital.prescriptions (rx_id);


-- ---------------------------------------------------------------------------
-- Convenience views in public
-- Allows the game queries to use bare table names:
--
--   FROM prescriptions
--   JOIN medications
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.medications AS
  SELECT * FROM hospital.medications;

CREATE OR REPLACE VIEW public.prescriptions AS
  SELECT * FROM hospital.prescriptions;


GRANT SELECT ON hospital.medications,
               hospital.prescriptions
TO anon, authenticated, service_role;

GRANT SELECT ON public.medications,
               public.prescriptions
TO anon, authenticated, service_role;


-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

TRUNCATE hospital.prescriptions RESTART IDENTITY CASCADE;
TRUNCATE hospital.medications RESTART IDENTITY CASCADE;


-- ---------------------------------------------------------------------------
-- Medications
-- ---------------------------------------------------------------------------

INSERT INTO hospital.medications
  (medication_name, category, dosage_form, controlled, stock_quantity)
VALUES
  ('Amoxicillin',       'Antibiotic',       'Capsule',  FALSE, 240),
  ('Metformin',         'Antidiabetic',     'Tablet',   FALSE, 180),
  ('Lisinopril',        'Cardiovascular',   'Tablet',   FALSE, 150),
  ('Atorvastatin',      'Statin',           'Tablet',   FALSE, 210),
  ('Omeprazole',        'Gastrointestinal', 'Capsule',  FALSE, 190),
  ('Azithromycin',      'Antibiotic',       'Tablet',   FALSE, 120),
  ('Alprazolam',        'Anxiolytic',       'Tablet',   TRUE,   60),
  ('Tramadol',          'Analgesic',        'Tablet',   TRUE,   75),
  ('Amlodipine',        'Cardiovascular',   'Tablet',   FALSE, 160),
  ('Cetirizine',        'Antihistamine',    'Tablet',   FALSE, 200);


-- ---------------------------------------------------------------------------
-- Prescription fills
-- ---------------------------------------------------------------------------
--
-- Patient IDs correspond to hospital.patients.id from Case 001.
--
-- The dataset intentionally contains:
--
--   Patient 1:
--     Amoxicillin filled twice -> DUPLICATE
--
--   Patient 3:
--     Metformin filled twice -> DUPLICATE
--     Lisinopril filled once  -> legitimate different medication
--
--   Patient 5:
--     Tramadol filled twice -> DUPLICATE + controlled substance alert
--
--   Patient 7:
--     Atorvastatin + Omeprazole -> two different medications
--     NOT a duplicate
--
--   Patient 9:
--     Azithromycin filled once -> normal
--
--   Patient 10:
--     Alprazolam filled twice -> DUPLICATE + controlled substance alert
--
--   Patient 12:
--     Amlodipine filled twice -> DUPLICATE
--
-- There are also older fills outside the 7-day window that should NOT
-- be included in the duplicate detection query.
-- ---------------------------------------------------------------------------


-- Patient 1 — duplicate Amoxicillin fills
INSERT INTO hospital.prescriptions
  (rx_id, patient_id, medication_id, dosage, quantity, filled_at, pharmacy, status)
VALUES
  (
    'RX-1001',
    1,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Amoxicillin'),
    '500mg twice daily',
    14,
    NOW() - INTERVAL '6 days',
    'Main Pharmacy',
    'filled'
  ),
  (
    'RX-1001',
    1,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Amoxicillin'),
    '500mg twice daily',
    14,
    NOW() - INTERVAL '2 days',
    'Main Pharmacy',
    'filled'
  );


-- Patient 3 — duplicate Metformin fills
INSERT INTO hospital.prescriptions
  (rx_id, patient_id, medication_id, dosage, quantity, filled_at, pharmacy, status)
VALUES
  (
    'RX-1002',
    3,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Metformin'),
    '500mg once daily',
    30,
    NOW() - INTERVAL '5 days',
    'Main Pharmacy',
    'filled'
  ),
  (
    'RX-1002',
    3,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Metformin'),
    '500mg once daily',
    30,
    NOW() - INTERVAL '1 day',
    'Main Pharmacy',
    'filled'
  );


-- Patient 3 — legitimate different medication
INSERT INTO hospital.prescriptions
  (rx_id, patient_id, medication_id, dosage, quantity, filled_at, pharmacy, status)
VALUES
  (
    'RX-1003',
    3,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Lisinopril'),
    '10mg once daily',
    30,
    NOW() - INTERVAL '3 days',
    'Main Pharmacy',
    'filled'
  );


-- Patient 5 — duplicate Tramadol fills
-- Controlled substance intentionally included.
INSERT INTO hospital.prescriptions
  (rx_id, patient_id, medication_id, dosage, quantity, filled_at, pharmacy, status)
VALUES
  (
    'RX-1004',
    5,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Tramadol'),
    '50mg every 6 hours',
    20,
    NOW() - INTERVAL '4 days',
    'Main Pharmacy',
    'filled'
  ),
  (
    'RX-1004',
    5,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Tramadol'),
    '50mg every 6 hours',
    20,
    NOW() - INTERVAL '12 hours',
    'Main Pharmacy',
    'filled'
  );


-- Patient 7 — two different medications
-- This should NOT be considered a duplicate.
INSERT INTO hospital.prescriptions
  (rx_id, patient_id, medication_id, dosage, quantity, filled_at, pharmacy, status)
VALUES
  (
    'RX-1005',
    7,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Atorvastatin'),
    '20mg once daily',
    30,
    NOW() - INTERVAL '4 days',
    'Main Pharmacy',
    'filled'
  ),
  (
    'RX-1006',
    7,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Omeprazole'),
    '20mg once daily',
    30,
    NOW() - INTERVAL '2 days',
    'Main Pharmacy',
    'filled'
  );


-- Patient 9 — normal single fill
INSERT INTO hospital.prescriptions
  (rx_id, patient_id, medication_id, dosage, quantity, filled_at, pharmacy, status)
VALUES
  (
    'RX-1007',
    9,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Azithromycin'),
    '250mg once daily',
    5,
    NOW() - INTERVAL '2 days',
    'Main Pharmacy',
    'filled'
  );


-- Patient 10 — duplicate Alprazolam fills
-- Controlled substance intentionally included.
INSERT INTO hospital.prescriptions
  (rx_id, patient_id, medication_id, dosage, quantity, filled_at, pharmacy, status)
VALUES
  (
    'RX-1008',
    10,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Alprazolam'),
    '0.5mg once daily',
    15,
    NOW() - INTERVAL '6 days',
    'Main Pharmacy',
    'filled'
  ),
  (
    'RX-1008',
    10,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Alprazolam'),
    '0.5mg once daily',
    15,
    NOW() - INTERVAL '1 day',
    'Main Pharmacy',
    'filled'
  );


-- Patient 12 — duplicate Amlodipine fills
INSERT INTO hospital.prescriptions
  (rx_id, patient_id, medication_id, dosage, quantity, filled_at, pharmacy, status)
VALUES
  (
    'RX-1009',
    12,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Amlodipine'),
    '5mg once daily',
    30,
    NOW() - INTERVAL '5 days',
    'Main Pharmacy',
    'filled'
  ),
  (
    'RX-1009',
    12,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Amlodipine'),
    '5mg once daily',
    30,
    NOW() - INTERVAL '8 hours',
    'Main Pharmacy',
    'filled'
  );


-- ---------------------------------------------------------------------------
-- Historical prescription
-- ---------------------------------------------------------------------------
--
-- This looks like a duplicate at first glance, but the second fill is more
-- than 7 days old and therefore should not be returned by the case query.
-- ---------------------------------------------------------------------------

INSERT INTO hospital.prescriptions
  (rx_id, patient_id, medication_id, dosage, quantity, filled_at, pharmacy, status)
VALUES
  (
    'RX-1010',
    1,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Omeprazole'),
    '20mg once daily',
    30,
    NOW() - INTERVAL '15 days',
    'Main Pharmacy',
    'filled'
  ),
  (
    'RX-1010',
    1,
    (SELECT id FROM hospital.medications WHERE medication_name = 'Omeprazole'),
    '20mg once daily',
    30,
    NOW() - INTERVAL '10 days',
    'Main Pharmacy',
    'filled'
  );


-- =============================================================================
-- Sanity checks
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Broken query from Case 002
-- This should produce a PostgreSQL GROUP BY error because medication and
-- dosage are neither grouped nor aggregated.
-- ---------------------------------------------------------------------------

-- SELECT patient_id, medication, dosage, COUNT(*) AS fills
-- FROM prescriptions
-- WHERE filled_at >= CURRENT_DATE - 7
-- GROUP BY patient_id
-- HAVING COUNT(*) > 1;


-- ---------------------------------------------------------------------------
-- Useful inspection query
-- ---------------------------------------------------------------------------

-- SELECT
--   p.id,
--   p.full_name,
--   pr.rx_id,
--   m.medication_name,
--   pr.dosage,
--   pr.quantity,
--   pr.filled_at,
--   m.controlled
-- FROM prescriptions pr
-- JOIN medications m
--   ON m.id = pr.medication_id
-- JOIN patients p
--   ON p.id = pr.patient_id
-- WHERE pr.filled_at >= CURRENT_DATE - 7
-- ORDER BY p.id, pr.filled_at DESC;


-- ---------------------------------------------------------------------------
-- Intended duplicate detection
-- ---------------------------------------------------------------------------
--
-- This identifies the actual duplicate combination:
--
--   patient + medication
--
-- and counts how many fills occurred during the last 7 days.
--
-- ---------------------------------------------------------------------------

-- SELECT
--   patient_id,
--   medication_id,
--   COUNT(*) AS fills
-- FROM prescriptions
-- WHERE filled_at >= CURRENT_DATE - 7
-- GROUP BY patient_id, medication_id
-- HAVING COUNT(*) > 1;


-- ---------------------------------------------------------------------------
-- Expected duplicate groups:
--
-- Patient 1  -> Amoxicillin
-- Patient 3  -> Metformin
-- Patient 5  -> Tramadol
-- Patient 10 -> Alprazolam
-- Patient 12 -> Amlodipine
--
-- Patient 7 should NOT appear because Atorvastatin and Omeprazole are
-- different medications.
-- =============================================================================
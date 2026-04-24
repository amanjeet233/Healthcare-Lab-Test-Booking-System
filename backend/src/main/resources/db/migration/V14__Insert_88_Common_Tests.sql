-- =================================================================
-- V14__Insert_88_Common_Tests.sql
-- =================================================================
-- Insert the top 88 most commonly booked individual tests
-- Replaces V11 which had 500+ tests
-- These are organized by 8 categories with medical relevance

-- Delete old test data to start fresh with just these 88
DELETE FROM tests;

-- Reset auto-increment counter
ALTER SEQUENCE tests_id_seq RESTART WITH 1;

-- ===== BLOOD TESTS (35 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('Complete Blood Count (CBC)', 'cbc', 'Blood', 'Full body health check, fever, weakness', 'Complete Blood Count', 299, 389, 'Blood', 0, '24hr', true),
('Hemoglobin (Hb)', 'hemoglobin-hb', 'Blood', 'Anemia check, weakness, dizziness', 'Hemoglobin', 99, 129, 'Blood', 0, '2hr', true),
('Blood Sugar (Fasting)', 'blood-sugar-fasting', 'Blood', 'Diabetes screening', 'Fasting Blood Sugar', 149, 194, 'Blood', 1, '24hr', true),
('Blood Sugar (Random)', 'blood-sugar-random', 'Blood', 'Quick sugar check', 'Random Blood Sugar', 149, 194, 'Blood', 0, '2hr', true),
('HbA1c', 'hba1c', 'Blood', 'Diabetes control check', 'Glycated Hemoglobin', 179, 233, 'Blood', 0, '24hr', true),
('Lipid Profile', 'lipid-profile', 'Blood', 'Cholesterol, heart health', 'Complete Lipid Profile', 399, 519, 'Blood', 1, '24hr', true),
('Total Cholesterol', 'total-cholesterol', 'Blood', 'Quick cholesterol check', 'Serum Cholesterol', 149, 194, 'Blood', 1, '24hr', true),
('Triglycerides', 'triglycerides', 'Blood', 'Heart risk assessment', 'Serum Triglycerides', 149, 194, 'Blood', 1, '24hr', true),
('HDL Cholesterol', 'hdl-cholesterol', 'Blood', 'Good cholesterol check', 'HDL Cholesterol', 149, 194, 'Blood', 1, '24hr', true),
('LDL Cholesterol', 'ldl-cholesterol', 'Blood', 'Bad cholesterol check', 'LDL Cholesterol', 149, 194, 'Blood', 1, '24hr', true),
('Thyroid Profile (T3,T4,TSH)', 'thyroid-profile', 'Blood', 'Weight gain/loss, fatigue', 'Complete Thyroid Profile', 449, 584, 'Blood', 0, '24hr', true),
('TSH (Only)', 'tsh', 'Blood', 'Quick thyroid check', 'Thyroid Stimulating Hormone', 199, 259, 'Blood', 0, '24hr', true),
('Liver Function Test (LFT)', 'lft', 'Blood', 'Liver health, alcohol effects', 'Liver Function Test', 349, 454, 'Blood', 0, '24hr', true),
('SGPT (ALT)', 'sgpt-alt', 'Blood', 'Liver damage check', 'Alanine Aminotransferase', 99, 129, 'Blood', 0, '2hr', true),
('SGOT (AST)', 'sgot-ast', 'Blood', 'Liver/heart damage', 'Aspartate Aminotransferase', 99, 129, 'Blood', 0, '2hr', true),
('Kidney Function Test (RFT)', 'rft', 'Blood', 'Kidney health', 'Renal Function Test', 299, 389, 'Blood', 0, '24hr', true),
('Serum Creatinine', 'serum-creatinine', 'Blood', 'Kidney function', 'Creatinine Level', 99, 129, 'Blood', 0, '2hr', true),
('Blood Urea Nitrogen (BUN)', 'bun', 'Blood', 'Kidney function', 'Urea Nitrogen', 99, 129, 'Blood', 0, '2hr', true),
('Uric Acid', 'uric-acid', 'Blood', 'Gout, joint pain', 'Serum Uric Acid', 129, 168, 'Blood', 0, '2hr', true),
('Vitamin D (25-OH)', 'vitamin-d', 'Blood', 'Bone health, fatigue', 'Vitamin D (25-Hydroxy)', 279, 363, 'Blood', 0, '48hr', true),
('Vitamin B12', 'vitamin-b12', 'Blood', 'Weakness, numbness', 'Cobalamin Level', 249, 324, 'Blood', 0, '24hr', true),
('Iron Studies', 'iron-studies', 'Blood', 'Anemia, low energy', 'Iron Profile', 299, 389, 'Blood', 1, '24hr', true),
('Serum Ferritin', 'serum-ferritin', 'Blood', 'Iron storage check', 'Ferritin Level', 299, 389, 'Blood', 0, '24hr', true),
('CRP (C-Reactive Protein)', 'crp', 'Blood', 'Infection, inflammation', 'C-Reactive Protein', 149, 194, 'Blood', 0, '24hr', true),
('ESR', 'esr', 'Blood', 'Inflammation, TB, arthritis', 'Erythrocyte Sedimentation Rate', 149, 194, 'Blood', 0, '2hr', true),
('Platelet Count', 'platelet-count', 'Blood', 'Dengue, bleeding risk', 'Thrombocyte Count', 99, 129, 'Blood', 0, '1hr', true),
('PSA (Prostate)', 'psa', 'Blood', 'Prostate cancer screening (Men >50)', 'Prostate-Specific Antigen', 399, 519, 'Blood', 0, '24hr', true),
('Electrolytes (Na,K,Cl)', 'electrolytes', 'Blood', 'Dehydration, weakness', 'Serum Electrolytes', 199, 259, 'Blood', 0, '1hr', true),
('Serum Calcium', 'serum-calcium', 'Blood', 'Bone health, tetany', 'Total Calcium', 129, 168, 'Blood', 0, '2hr', true),
('Serum Magnesium', 'serum-magnesium', 'Blood', 'Muscle cramps', 'Magnesium Level', 179, 233, 'Blood', 0, '2hr', true),
('Serum Phosphorus', 'serum-phosphorus', 'Blood', 'Bone health', 'Inorganic Phosphorus', 129, 168, 'Blood', 0, '2hr', true),
('Amylase', 'amylase', 'Blood', 'Pancreatitis', 'Serum Amylase', 179, 233, 'Blood', 0, '1hr', true),
('Lipase', 'lipase', 'Blood', 'Pancreatitis', 'Serum Lipase', 179, 233, 'Blood', 0, '1hr', true),
('LDH (Lactate Dehydrogenase)', 'ldh', 'Blood', 'Cell damage, heart attack', 'LD Enzyme', 149, 194, 'Blood', 0, '2hr', true),
('GGT (Gamma GT)', 'ggt', 'Blood', 'Liver, alcohol use', 'Gamma-Glutamyl Transferase', 149, 194, 'Blood', 0, '2hr', true);

-- ===== URINE TESTS (5 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('Urine Routine (Complete)', 'urine-routine', 'Urine', 'UTI, kidney infection', 'Complete Urine Analysis', 149, 194, 'Urine', 0, '24hr', true),
('Urine Pregnancy Test', 'urine-pregnancy', 'Urine', 'Pregnancy confirmation', 'hCG in Urine', 99, 129, 'Urine', 0, '30min', true),
('Urine Microalbumin', 'urine-microalbumin', 'Urine', 'Diabetes kidney damage', 'Microalbumin', 199, 259, 'Urine', 0, '24hr', true),
('Urine Culture & Sensitivity', 'urine-culture', 'Urine', 'Recurrent UTI', 'Culture & Sensitivity', 399, 519, 'Urine', 0, '72hr', true),
('Urine Albumin/Creatinine Ratio', 'urine-acr', 'Urine', 'Kidney disease', 'ACR Ratio', 249, 324, 'Urine', 0, '24hr', true);

-- ===== RADIOLOGY TESTS (10 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('X-Ray Chest PA View', 'xray-chest', 'Radiology', 'Cough, TB, pneumonia', 'Chest X-Ray', 171, 222, 'Imaging', 0, '24-72hr', true),
('Ultrasound Whole Abdomen', 'ultrasound-abdomen', 'Radiology', 'Abdominal pain, stones', 'Abdominal Ultrasound', 665, 865, 'Imaging', 0, '24-72hr', true),
('Ultrasound KUB', 'ultrasound-kub', 'Radiology', 'Kidney stones', 'KUB Ultrasound', 455, 591, 'Imaging', 0, '24-72hr', true),
('Ultrasound Pelvis (Female)', 'ultrasound-pelvis', 'Radiology', 'Period problems, pregnancy', 'Pelvic Ultrasound', 455, 591, 'Imaging', 0, '24-72hr', true),
('Ultrasound Pregnancy (Obstetric)', 'ultrasound-obstetric', 'Radiology', 'Pregnancy check', 'Obstetric Ultrasound', 499, 649, 'Imaging', 0, '24-72hr', true),
('ECG (Electrocardiogram)', 'ecg', 'Radiology', 'Chest pain, palpitations', 'Electrocardiogram', 299, 389, 'Imaging', 0, '30min', true),
('2D Echo', '2d-echo', 'Radiology', 'Heart function check', '2D Echocardiography', 899, 1169, 'Imaging', 0, '24hr', true),
('CT Scan Head (Plain)', 'ct-head', 'Radiology', 'Headache, injury, stroke', 'CT Head', 1800, 2340, 'Imaging', 0, '24-72hr', true),
('MRI Brain (Plain)', 'mri-brain', 'Radiology', 'Migraine, neurological issues', 'MRI Brain', 3500, 4550, 'Imaging', 0, '24-48hr', true),
('Mammography', 'mammography', 'Radiology', 'Breast cancer screening (Women >40)', 'Breast Mammography', 1499, 1949, 'Imaging', 0, '24hr', true);

-- ===== INFECTIOUS DISEASE TESTS (12 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('Malaria Antigen Test', 'malaria-antigen', 'Infectious', 'Fever, chills', 'Malaria Test', 199, 259, 'Blood', 0, '1hr', true),
('Dengue NS1 Antigen', 'dengue-ns1', 'Infectious', 'High fever, body pain', 'Dengue NS1', 349, 454, 'Blood', 0, '2hr', true),
('Dengue IgM Antibody', 'dengue-igm', 'Infectious', 'Dengue confirmation', 'Dengue IgM', 299, 389, 'Blood', 0, '24hr', true),
('Typhoid (Widal Test)', 'widal-test', 'Infectious', 'Prolonged fever', 'Widal Test', 199, 259, 'Blood', 0, '24hr', true),
('Typhoid IgM/IgG Rapid', 'typhoid-rapid', 'Infectious', 'Quick typhoid test', 'Typhoid Rapid', 299, 389, 'Blood', 0, '2hr', true),
('COVID-19 RT-PCR', 'covid-rtpcr', 'Infectious', 'COVID symptoms', 'COVID-19 RT-PCR', 499, 649, 'Nasal Swab', 0, '24hr', true),
('COVID-19 Antigen (Rapid)', 'covid-antigen', 'Infectious', 'Quick COVID test', 'COVID Antigen', 199, 259, 'Nasal Swab', 0, '1hr', true),
('HIV ELISA (4th Gen)', 'hiv-elisa', 'Infectious', 'HIV screening', 'HIV ELISA', 449, 584, 'Blood', 0, '24hr', true),
('HIV Rapid Test', 'hiv-rapid', 'Infectious', 'Quick HIV test', 'HIV Rapid', 399, 519, 'Blood', 0, '2hr', true),
('HBsAg (Hepatitis B)', 'hbsag', 'Infectious', 'Hepatitis B screening', 'HBsAg', 279, 363, 'Blood', 0, '1hr', true),
('Anti-HCV (Hepatitis C)', 'anti-hcv', 'Infectious', 'Hepatitis C screening', 'Anti-HCV', 349, 454, 'Blood', 0, '1hr', true),
('VDRL/RPR (Syphilis)', 'vdrl-rpr', 'Infectious', 'Syphilis screening', 'Syphilis Test', 199, 259, 'Blood', 0, '2hr', true);

-- ===== HORMONE TESTS (8 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('TSH (Thyroid Stimulating Hormone)', 'tsh-hormone', 'Hormone', 'Thyroid check', 'TSH', 199, 259, 'Blood', 0, '24hr', true),
('Prolactin', 'prolactin', 'Hormone', 'Milk secretion, irregular periods', 'Prolactin Level', 349, 454, 'Blood', 0, '24hr', true),
('LH (Luteinizing Hormone)', 'lh', 'Hormone', 'Fertility, PCOS', 'Luteinizing Hormone', 299, 389, 'Blood', 0, '24hr', true),
('FSH (Follicle Stimulating Hormone)', 'fsh', 'Hormone', 'Fertility, menopause', 'Follicle Stimulating Hormone', 299, 389, 'Blood', 0, '24hr', true),
('Testosterone Total (Male)', 'testosterone-male', 'Hormone', 'Low libido, fatigue', 'Testosterone (Male)', 399, 519, 'Blood', 0, '24hr', true),
('Testosterone Total (Female)', 'testosterone-female', 'Hormone', 'PCOS, irregular periods', 'Testosterone (Female)', 399, 519, 'Blood', 0, '24hr', true),
('AMH (Anti-Mullerian Hormone)', 'amh', 'Hormone', 'Ovarian reserve, fertility', 'AMH', 899, 1169, 'Blood', 0, '48hr', true),
('Cortisol (Morning)', 'cortisol', 'Hormone', 'Stress, weight gain', 'Morning Cortisol', 299, 389, 'Blood', 0, '24hr', true);

-- ===== PREGNANCY & FERTILITY TESTS (5 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('Beta-hCG (Pregnancy)', 'beta-hcg', 'Pregnancy', 'Pregnancy confirmation', 'Pregnancy hCG', 349, 454, 'Blood', 0, '4hr', true),
('Double Marker Test', 'double-marker', 'Pregnancy', 'Down syndrome screening', 'Double Marker', 1499, 1949, 'Blood', 0, '72hr', true),
('Triple Marker Test', 'triple-marker', 'Pregnancy', 'Birth defect screening', 'Triple Marker', 1799, 2339, 'Blood', 0, '72hr', true),
('Quadruple Marker Test', 'quadruple-marker', 'Pregnancy', 'Advanced birth defect screening', 'Quadruple Marker', 1999, 2599, 'Blood', 0, '72hr', true),
('Semen Analysis', 'semen-analysis', 'Pregnancy', 'Male fertility check', 'Semen Analysis', 499, 649, 'Semen', 0, '24hr', true);

-- ===== CHILD SPECIFIC TESTS (5 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('CBC (Child)', 'cbc-child', 'Pediatric', 'Fever, growth issues', 'CBC Child', 299, 389, 'Blood', 0, '24hr', true),
('Vitamin D (Child)', 'vitamin-d-child', 'Pediatric', 'Weak bones, delayed growth', 'Vitamin D Child', 279, 363, 'Blood', 0, '48hr', true),
('Iron Studies (Child)', 'iron-studies-child', 'Pediatric', 'Paleness, low appetite', 'Iron Studies Child', 299, 389, 'Blood', 1, '24hr', true),
('Urine Routine (Child)', 'urine-routine-child', 'Pediatric', 'UTI, fever', 'Urine Routine Child', 149, 194, 'Urine', 0, '24hr', true),
('Stool Routine (Child)', 'stool-routine-child', 'Pediatric', 'Diarrhea, worms', 'Stool Routine Child', 149, 194, 'Stool', 0, '24hr', true);

-- ===== SENIOR CITIZEN TESTS (8 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('CBC (Senior)', 'cbc-senior', 'Senior', 'General health', 'CBC Senior', 299, 389, 'Blood', 0, '24hr', true),
('Lipid Profile (Senior)', 'lipid-profile-senior', 'Senior', 'Heart health', 'Lipid Profile Senior', 399, 519, 'Blood', 1, '24hr', true),
('HbA1c (Senior)', 'hba1c-senior', 'Senior', 'Diabetes control', 'HbA1c Senior', 179, 233, 'Blood', 0, '24hr', true),
('PSA (Senior Men)', 'psa-senior', 'Senior', 'Prostate screening', 'PSA Senior', 399, 519, 'Blood', 0, '24hr', true),
('Vitamin D + B12 (Senior)', 'vitamin-d-b12-senior', 'Senior', 'Bone health, memory', 'Vitamin D+B12 Senior', 449, 584, 'Blood', 0, '48hr', true),
('ECG (Senior)', 'ecg-senior', 'Senior', 'Heart check', 'ECG Senior', 299, 389, 'Imaging', 0, '30min', true),
('2D Echo (Senior)', '2d-echo-senior', 'Senior', 'Heart function', '2D Echo Senior', 899, 1169, 'Imaging', 0, '24hr', true),
('Bone Density (DEXA)', 'bone-dexa', 'Senior', 'Osteoporosis', 'DEXA Scan', 1299, 1689, 'Imaging', 0, '24hr', true);

-- Verify total count
SELECT COUNT(*) as total_tests FROM tests;

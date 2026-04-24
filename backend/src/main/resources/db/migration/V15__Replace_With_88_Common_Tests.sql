-- =================================================================
-- V15__Replace_With_88_Common_Tests.sql
-- =================================================================
-- Delete all existing tests and insert the top 88 most commonly booked

DELETE FROM tests;

-- Reset auto-increment counter (may vary by database)
-- For MySQL:
ALTER TABLE tests AUTO_INCREMENT = 1;

-- ===== BLOOD TESTS (35 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('Complete Blood Count (CBC)', 'cbc', 'Hematology', 'Full body health check, fever, weakness', 'Complete Blood Count', 299, 389, 'Blood', 0, '24hr', true),
('Hemoglobin (Hb)', 'hemoglobin-hb', 'Hematology', 'Anemia check, weakness, dizziness', 'Hemoglobin', 99, 129, 'Blood', 0, '2hr', true),
('Blood Sugar (Fasting)', 'blood-sugar-fasting', 'Endocrinology', 'Diabetes screening', 'Fasting Blood Sugar', 149, 194, 'Blood', 1, '24hr', true),
('Blood Sugar (Random)', 'blood-sugar-random', 'Endocrinology', 'Quick sugar check', 'Random Blood Sugar', 149, 194, 'Blood', 0, '2hr', true),
('HbA1c', 'hba1c', 'Endocrinology', 'Diabetes control check', 'Glycated Hemoglobin', 179, 233, 'Blood', 0, '24hr', true),
('Lipid Profile', 'lipid-profile', 'Cardiology', 'Cholesterol, heart health', 'Complete Lipid Profile', 399, 519, 'Blood', 1, '24hr', true),
('Total Cholesterol', 'total-cholesterol', 'Cardiology', 'Quick cholesterol check', 'Serum Cholesterol', 149, 194, 'Blood', 1, '24hr', true),
('Triglycerides', 'triglycerides', 'Cardiology', 'Heart risk assessment', 'Serum Triglycerides', 149, 194, 'Blood', 1, '24hr', true),
('HDL Cholesterol', 'hdl-cholesterol', 'Cardiology', 'Good cholesterol check', 'HDL Cholesterol', 149, 194, 'Blood', 1, '24hr', true),
('LDL Cholesterol', 'ldl-cholesterol', 'Cardiology', 'Bad cholesterol check', 'LDL Cholesterol', 149, 194, 'Blood', 1, '24hr', true),
('Thyroid Profile (T3,T4,TSH)', 'thyroid-profile', 'Endocrinology', 'Weight gain/loss, fatigue', 'Complete Thyroid Profile', 449, 584, 'Blood', 0, '24hr', true),
('TSH (Only)', 'tsh', 'Endocrinology', 'Quick thyroid check', 'Thyroid Stimulating Hormone', 199, 259, 'Blood', 0, '24hr', true),
('Liver Function Test (LFT)', 'lft', 'Hepatology', 'Liver health, alcohol effects', 'Liver Function Test', 349, 454, 'Blood', 0, '24hr', true),
('SGPT (ALT)', 'sgpt-alt', 'Hepatology', 'Liver damage check', 'Alanine Aminotransferase', 99, 129, 'Blood', 0, '2hr', true),
('SGOT (AST)', 'sgot-ast', 'Hepatology', 'Liver/heart damage', 'Aspartate Aminotransferase', 99, 129, 'Blood', 0, '2hr', true),
('Kidney Function Test (RFT)', 'rft', 'Nephrology', 'Kidney health', 'Renal Function Test', 299, 389, 'Blood', 0, '24hr', true),
('Serum Creatinine', 'serum-creatinine', 'Nephrology', 'Kidney function', 'Creatinine Level', 99, 129, 'Blood', 0, '2hr', true),
('Blood Urea Nitrogen (BUN)', 'bun', 'Nephrology', 'Kidney function', 'Urea Nitrogen', 99, 129, 'Blood', 0, '2hr', true),
('Uric Acid', 'uric-acid', 'Rheumatology', 'Gout, joint pain', 'Serum Uric Acid', 129, 168, 'Blood', 0, '2hr', true),
('Vitamin D (25-OH)', 'vitamin-d', 'Nutrition', 'Bone health, fatigue', 'Vitamin D (25-Hydroxy)', 279, 363, 'Blood', 0, '48hr', true),
('Vitamin B12', 'vitamin-b12', 'Nutrition', 'Weakness, numbness', 'Cobalamin Level', 249, 324, 'Blood', 0, '24hr', true),
('Iron Studies', 'iron-studies', 'Hematology', 'Anemia, low energy', 'Iron Profile', 299, 389, 'Blood', 1, '24hr', true),
('Serum Ferritin', 'serum-ferritin', 'Hematology', 'Iron storage check', 'Ferritin Level', 299, 389, 'Blood', 0, '24hr', true),
('CRP (C-Reactive Protein)', 'crp', 'Immunology', 'Infection, inflammation', 'C-Reactive Protein', 149, 194, 'Blood', 0, '24hr', true),
('ESR', 'esr', 'Hematology', 'Inflammation, TB, arthritis', 'Erythrocyte Sedimentation Rate', 149, 194, 'Blood', 0, '2hr', true),
('Platelet Count', 'platelet-count', 'Hematology', 'Dengue, bleeding risk', 'Thrombocyte Count', 99, 129, 'Blood', 0, '1hr', true),
('PSA (Prostate)', 'psa', 'Oncology', 'Prostate cancer screening (Men >50)', 'Prostate-Specific Antigen', 399, 519, 'Blood', 0, '24hr', true),
('Electrolytes (Na,K,Cl)', 'electrolytes', 'Biochemistry', 'Dehydration, weakness', 'Serum Electrolytes', 199, 259, 'Blood', 0, '1hr', true),
('Serum Calcium', 'serum-calcium', 'Biochemistry', 'Bone health, tetany', 'Total Calcium', 129, 168, 'Blood', 0, '2hr', true),
('Serum Magnesium', 'serum-magnesium', 'Biochemistry', 'Muscle cramps', 'Magnesium Level', 179, 233, 'Blood', 0, '2hr', true),
('Serum Phosphorus', 'serum-phosphorus', 'Biochemistry', 'Bone health', 'Inorganic Phosphorus', 129, 168, 'Blood', 0, '2hr', true),
('Amylase', 'amylase', 'Gastroenterology', 'Pancreatitis', 'Serum Amylase', 179, 233, 'Blood', 0, '1hr', true),
('Lipase', 'lipase', 'Gastroenterology', 'Pancreatitis', 'Serum Lipase', 179, 233, 'Blood', 0, '1hr', true),
('LDH (Lactate Dehydrogenase)', 'ldh', 'Biochemistry', 'Cell damage, heart attack', 'LD Enzyme', 149, 194, 'Blood', 0, '2hr', true),
('GGT (Gamma GT)', 'ggt', 'Hepatology', 'Liver, alcohol use', 'Gamma-Glutamyl Transferase', 149, 194, 'Blood', 0, '2hr', true);

-- ===== URINE TESTS (5 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('Urine Routine (Complete)', 'urine-routine', 'Urology', 'UTI, kidney infection', 'Complete Urine Analysis', 149, 194, 'Urine', 0, '24hr', true),
('Urine Pregnancy Test', 'urine-pregnancy', 'Obstetrics', 'Pregnancy confirmation', 'hCG in Urine', 99, 129, 'Urine', 0, '30min', true),
('Urine Microalbumin', 'urine-microalbumin', 'Nephrology', 'Diabetes kidney damage', 'Microalbumin', 199, 259, 'Urine', 0, '24hr', true),
('Urine Culture & Sensitivity', 'urine-culture', 'Microbiology', 'Recurrent UTI', 'Culture & Sensitivity', 399, 519, 'Urine', 0, '72hr', true),
('Urine Albumin/Creatinine Ratio', 'urine-acr', 'Nephrology', 'Kidney disease', 'ACR Ratio', 249, 324, 'Urine', 0, '24hr', true);

-- ===== RADIOLOGY TESTS (10 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('X-Ray Chest PA View', 'xray-chest', 'Radiology', 'Cough, TB, pneumonia', 'Chest X-Ray', 171, 222, 'Imaging', 0, '24-72hr', true),
('Ultrasound Whole Abdomen', 'ultrasound-abdomen', 'Radiology', 'Abdominal pain, stones', 'Abdominal Ultrasound', 665, 865, 'Imaging', 0, '24-72hr', true),
('Ultrasound KUB', 'ultrasound-kub', 'Radiology', 'Kidney stones', 'KUB Ultrasound', 455, 591, 'Imaging', 0, '24-72hr', true),
('Ultrasound Pelvis (Female)', 'ultrasound-pelvis', 'Radiology', 'Period problems, pregnancy', 'Pelvic Ultrasound', 455, 591, 'Imaging', 0, '24-72hr', true),
('Ultrasound Pregnancy (Obstetric)', 'ultrasound-obstetric', 'Radiology', 'Pregnancy check', 'Obstetric Ultrasound', 499, 649, 'Imaging', 0, '24-72hr', true),
('ECG (Electrocardiogram)', 'ecg', 'Cardiology', 'Chest pain, palpitations', 'Electrocardiogram', 299, 389, 'Imaging', 0, '30min', true),
('2D Echo', '2d-echo', 'Cardiology', 'Heart function check', '2D Echocardiography', 899, 1169, 'Imaging', 0, '24hr', true),
('CT Scan Head (Plain)', 'ct-head', 'Radiology', 'Headache, injury, stroke', 'CT Head', 1800, 2340, 'Imaging', 0, '24-72hr', true),
('MRI Brain (Plain)', 'mri-brain', 'Radiology', 'Migraine, neurological issues', 'MRI Brain', 3500, 4550, 'Imaging', 0, '24-48hr', true),
('Mammography', 'mammography', 'Radiology', 'Breast cancer screening (Women >40)', 'Breast Mammography', 1499, 1949, 'Imaging', 0, '24hr', true);

-- ===== INFECTIOUS DISEASE TESTS (12 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('Malaria Antigen Test', 'malaria-antigen', 'Microbiology', 'Fever, chills', 'Malaria Test', 199, 259, 'Blood', 0, '1hr', true),
('Dengue NS1 Antigen', 'dengue-ns1', 'Virology', 'High fever, body pain', 'Dengue NS1', 349, 454, 'Blood', 0, '2hr', true),
('Dengue IgM Antibody', 'dengue-igm', 'Virology', 'Dengue confirmation', 'Dengue IgM', 299, 389, 'Blood', 0, '24hr', true),
('Typhoid (Widal Test)', 'widal-test', 'Microbiology', 'Prolonged fever', 'Widal Test', 199, 259, 'Blood', 0, '24hr', true),
('Typhoid IgM/IgG Rapid', 'typhoid-rapid', 'Microbiology', 'Quick typhoid test', 'Typhoid Rapid', 299, 389, 'Blood', 0, '2hr', true),
('COVID-19 RT-PCR', 'covid-rtpcr', 'Virology', 'COVID symptoms', 'COVID-19 RT-PCR', 499, 649, 'Nasal Swab', 0, '24hr', true),
('COVID-19 Antigen (Rapid)', 'covid-antigen', 'Virology', 'Quick COVID test', 'COVID Antigen', 199, 259, 'Nasal Swab', 0, '1hr', true),
('HIV ELISA (4th Gen)', 'hiv-elisa', 'Serology', 'HIV screening', 'HIV ELISA', 449, 584, 'Blood', 0, '24hr', true),
('HIV Rapid Test', 'hiv-rapid', 'Serology', 'Quick HIV test', 'HIV Rapid', 399, 519, 'Blood', 0, '2hr', true),
('HBsAg (Hepatitis B)', 'hbsag', 'Serology', 'Hepatitis B screening', 'HBsAg', 279, 363, 'Blood', 0, '1hr', true),
('Anti-HCV (Hepatitis C)', 'anti-hcv', 'Serology', 'Hepatitis C screening', 'Anti-HCV', 349, 454, 'Blood', 0, '1hr', true),
('VDRL/RPR (Syphilis)', 'vdrl-rpr', 'Serology', 'Syphilis screening', 'Syphilis Test', 199, 259, 'Blood', 0, '2hr', true);

-- ===== HORMONE TESTS (8 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('TSH (Thyroid Stimulating Hormone)', 'tsh-hormone', 'Endocrinology', 'Thyroid check', 'TSH', 199, 259, 'Blood', 0, '24hr', true),
('Prolactin', 'prolactin', 'Endocrinology', 'Milk secretion, irregular periods', 'Prolactin Level', 349, 454, 'Blood', 0, '24hr', true),
('LH (Luteinizing Hormone)', 'lh', 'Gynecology', 'Fertility, PCOS', 'Luteinizing Hormone', 299, 389, 'Blood', 0, '24hr', true),
('FSH (Follicle Stimulating Hormone)', 'fsh', 'Gynecology', 'Fertility, menopause', 'Follicle Stimulating Hormone', 299, 389, 'Blood', 0, '24hr', true),
('Testosterone Total (Male)', 'testosterone-male', 'Endocrinology', 'Low libido, fatigue', 'Testosterone (Male)', 399, 519, 'Blood', 0, '24hr', true),
('Testosterone Total (Female)', 'testosterone-female', 'Gynecology', 'PCOS, irregular periods', 'Testosterone (Female)', 399, 519, 'Blood', 0, '24hr', true),
('AMH (Anti-Mullerian Hormone)', 'amh', 'Gynecology', 'Ovarian reserve, fertility', 'AMH', 899, 1169, 'Blood', 0, '48hr', true),
('Cortisol (Morning)', 'cortisol', 'Endocrinology', 'Stress, weight gain', 'Morning Cortisol', 299, 389, 'Blood', 0, '24hr', true);

-- ===== PREGNANCY & FERTILITY TESTS (5 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('Beta-hCG (Pregnancy)', 'beta-hcg', 'Obstetrics', 'Pregnancy confirmation', 'Pregnancy hCG', 349, 454, 'Blood', 0, '4hr', true),
('Double Marker Test', 'double-marker', 'Obstetrics', 'Down syndrome screening', 'Double Marker', 1499, 1949, 'Blood', 0, '72hr', true),
('Triple Marker Test', 'triple-marker', 'Obstetrics', 'Birth defect screening', 'Triple Marker', 1799, 2339, 'Blood', 0, '72hr', true),
('Quadruple Marker Test', 'quadruple-marker', 'Obstetrics', 'Advanced birth defect screening', 'Quadruple Marker', 1999, 2599, 'Blood', 0, '72hr', true),
('Semen Analysis', 'semen-analysis', 'Andrology', 'Male fertility check', 'Semen Analysis', 499, 649, 'Semen', 0, '24hr', true);

-- ===== CHILD SPECIFIC TESTS (5 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('CBC (Child)', 'cbc-child', 'Pediatrics', 'Fever, growth issues', 'CBC Child', 299, 389, 'Blood', 0, '24hr', true),
('Vitamin D (Child)', 'vitamin-d-child', 'Pediatrics', 'Weak bones, delayed growth', 'Vitamin D Child', 279, 363, 'Blood', 0, '48hr', true),
('Iron Studies (Child)', 'iron-studies-child', 'Pediatrics', 'Paleness, low appetite', 'Iron Studies Child', 299, 389, 'Blood', 1, '24hr', true),
('Urine Routine (Child)', 'urine-routine-child', 'Pediatrics', 'UTI, fever', 'Urine Routine Child', 149, 194, 'Urine', 0, '24hr', true),
('Stool Routine (Child)', 'stool-routine-child', 'Pediatrics', 'Diarrhea, worms', 'Stool Routine Child', 149, 194, 'Stool', 0, '24hr', true);

-- ===== SENIOR CITIZEN TESTS (8 Tests) =====
INSERT INTO tests (name, slug, category, description, short_description, price, original_price, sample_type, fasting_required, turnaround_time, is_active) VALUES
('CBC (Senior)', 'cbc-senior', 'Hematology', 'General health', 'CBC Senior', 299, 389, 'Blood', 0, '24hr', true),
('Lipid Profile (Senior)', 'lipid-profile-senior', 'Cardiology', 'Heart health', 'Lipid Profile Senior', 399, 519, 'Blood', 1, '24hr', true),
('HbA1c (Senior)', 'hba1c-senior', 'Endocrinology', 'Diabetes control', 'HbA1c Senior', 179, 233, 'Blood', 0, '24hr', true),
('PSA (Senior Men)', 'psa-senior', 'Oncology', 'Prostate screening', 'PSA Senior', 399, 519, 'Blood', 0, '24hr', true),
('Vitamin D + B12 (Senior)', 'vitamin-d-b12-senior', 'Nutrition', 'Bone health, memory', 'Vitamin D+B12 Senior', 449, 584, 'Blood', 0, '48hr', true),
('ECG (Senior)', 'ecg-senior', 'Cardiology', 'Heart check', 'ECG Senior', 299, 389, 'Imaging', 0, '30min', true),
('2D Echo (Senior)', '2d-echo-senior', 'Cardiology', 'Heart function', '2D Echo Senior', 899, 1169, 'Imaging', 0, '24hr', true),
('Bone Density (DEXA)', 'bone-dexa', 'Rheumatology', 'Osteoporosis', 'DEXA Scan', 1299, 1689, 'Imaging', 0, '24hr', true);

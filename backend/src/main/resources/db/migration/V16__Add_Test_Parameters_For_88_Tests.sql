-- =================================================================
-- V16__Add_Test_Parameters_For_88_Tests.sql
-- =================================================================
-- Adds comprehensive test parameters and details for all 88 tests
-- This data will be used to populate the test detail page

-- BLOOD TESTS PARAMETERS (35 Tests)
INSERT INTO test_parameters (test_id, parameter_name, unit, normal_range_text, display_order, is_critical) VALUES
-- 1. CBC
(1, 'WBC (White Blood Cells)', 'G/uL', '4.5-11.0', 1, false),
(1, 'RBC (Red Blood Cells)', 'M/uL', '4.5-5.5 (M) / 4.0-5.0 (F)', 2, false),
(1, 'Hemoglobin', 'g/dL', '13.5-17.5 (M) / 12.0-15.5 (F)', 3, false),
(1, 'Hematocrit', '%', '38.8-50.0 (M) / 34.9-44.5 (F)', 4, false),
(1, 'Platelets', 'K/uL', '150-400', 5, false),

-- 2. Hemoglobin (Hb)
(2, 'Hemoglobin', 'g/dL', '13.5-17.5 (M) / 12.0-15.5 (F)', 1, false),

-- 3. Blood Sugar (Fasting)
(3, 'Glucose (Fasting)', 'mg/dL', '70-100', 1, true),

-- 4. Blood Sugar (Random)
(4, 'Glucose (Random)', 'mg/dL', '< 140', 1, true),

-- 5. HbA1c
(5, 'HbA1c', '%', '< 5.7%', 1, true),

-- 6. Lipid Profile
(6, 'Total Cholesterol', 'mg/dL', '< 200', 1, false),
(6, 'LDL Cholesterol', 'mg/dL', '< 100', 2, false),
(6, 'HDL Cholesterol', 'mg/dL', '> 40 (M) / > 50 (F)', 3, false),
(6, 'Triglycerides', 'mg/dL', '< 150', 4, false),

-- 7. Total Cholesterol
(7, 'Total Cholesterol', 'mg/dL', '< 200', 1, false),

-- 8. Triglycerides
(8, 'Triglycerides', 'mg/dL', '< 150', 1, false),

-- 9. HDL Cholesterol
(9, 'HDL Cholesterol', 'mg/dL', '> 40 (M) / > 50 (F)', 1, false),

-- 10. LDL Cholesterol
(10, 'LDL Cholesterol', 'mg/dL', '< 100', 1, false),

-- 11. Thyroid Profile
(11, 'T3 (Triiodothyronine)', 'pg/mL', '80-200', 1, false),
(11, 'T4 (Thyroxine)', 'ng/dL', '4.5-12', 2, false),
(11, 'TSH', 'mIU/L', '0.4-4.0', 3, false),

-- 12. TSH (Only)
(12, 'TSH', 'mIU/L', '0.4-4.0', 1, false),

-- 13. Liver Function Test
(13, 'Total Bilirubin', 'mg/dL', '0.3-1.2', 1, false),
(13, 'Direct Bilirubin', 'mg/dL', '0.1-0.3', 2, false),
(13, 'SGPT (ALT)', 'U/L', '7-56', 3, false),
(13, 'SGOT (AST)', 'U/L', '10-40', 4, false),

-- 14. SGPT (ALT)
(14, 'SGPT (ALT)', 'U/L', '7-56', 1, false),

-- 15. SGOT (AST)
(15, 'SGOT (AST)', 'U/L', '10-40', 1, false),

-- 16. Kidney Function Test
(16, 'Creatinine', 'mg/dL', '0.7-1.3', 1, false),
(16, 'Blood Urea', 'mg/dL', '10-50', 2, false),
(16, 'Sodium', 'mEq/L', '136-145', 3, false),
(16, 'Potassium', 'mEq/L', '3.5-5.0', 4, false),

-- 17. Serum Creatinine
(17, 'Creatinine', 'mg/dL', '0.7-1.3', 1, false),

-- 18. Blood Urea Nitrogen
(18, 'BUN', 'mg/dL', '7-20', 1, false),

-- 19. Uric Acid
(19, 'Uric Acid', 'mg/dL', '3.5-7.2 (M) / 2.6-6.0 (F)', 1, false),

-- 20. Vitamin D
(20, 'Vitamin D (25-OH)', 'ng/mL', '> 30', 1, false),

-- 21. Vitamin B12
(21, 'Vitamin B12', 'pg/mL', '200-900', 1, false),

-- 22. Iron Studies
(22, 'Serum Iron', 'µg/dL', '60-170 (M) / 50-150 (F)', 1, false),
(22, 'TIBC', 'µg/dL', '250-425', 2, false),
(22, 'Ferritin', 'ng/mL', '24-336 (M) / 11-307 (F)', 3, false),

-- 23. Serum Ferritin
(23, 'Ferritin', 'ng/mL', '24-336 (M) / 11-307 (F)', 1, false),

-- 24. CRP
(24, 'CRP', 'mg/L', '< 3.0', 1, true),

-- 25. ESR
(25, 'ESR', 'mm/hr', '0-20 (M) / 0-30 (F)', 1, false),

-- 26. Platelet Count
(26, 'Platelets', 'K/uL', '150-400', 1, false),

-- 27. PSA
(27, 'PSA (Prostate-Specific Antigen)', 'ng/mL', '0-4.0', 1, true),

-- 28. Electrolytes
(28, 'Sodium', 'mEq/L', '136-145', 1, false),
(28, 'Potassium', 'mEq/L', '3.5-5.0', 2, false),
(28, 'Chloride', 'mEq/L', '98-107', 3, false),

-- 29. Serum Calcium
(29, 'Total Calcium', 'mg/dL', '8.5-10.2', 1, false),

-- 30. Serum Magnesium
(30, 'Magnesium', 'mg/dL', '1.7-2.2', 1, false),

-- 31. Serum Phosphorus
(31, 'Phosphorus', 'mg/dL', '2.5-4.5', 1, false),

-- 32. Amylase
(32, 'Amylase', 'U/L', '30-110', 1, false),

-- 33. Lipase
(33, 'Lipase', 'U/L', '0-51', 1, false),

-- 34. LDH
(34, 'LDH', 'U/L', '140-280', 1, false),

-- 35. GGT
(35, 'GGT', 'U/L', '0-51 (M) / 0-32 (F)', 1, false);

-- URINE TESTS PARAMETERS (5 Tests)
INSERT INTO test_parameters (test_id, parameter_name, unit, normal_range_text, display_order, is_critical) VALUES
-- 36. Urine Routine
(36, 'Color', 'Appearance', 'Pale yellow to dark yellow', 1, false),
(36, 'Appearance', 'Appearance', 'Clear', 2, false),
(36, 'pH', 'pH', '4.5-8.0', 3, false),
(36, 'Specific Gravity', 'SG', '1.005-1.030', 4, false),
(36, 'Protein', 'mg/dL', 'Negative', 5, true),
(36, 'Glucose', 'mg/dL', 'Negative', 6, true),
(36, 'Ketones', 'mmol/L', 'Negative', 7, true),
(36, 'Leucocytes', 'Cells/µL', 'Negative', 8, false),
(36, 'Nitrites', 'Appearance', 'Negative', 9, false),
(36, 'Bilirubin', 'mg/dL', 'Negative', 10, false),

-- 37. Urine Pregnancy
(37, 'hCG (Pregnancy)', 'mIU/mL', '< 5 (Negative)', 1, true),

-- 38. Urine Microalbumin
(38, 'Microalbumin', 'µg/mL', '< 20', 1, false),

-- 39. Urine Culture
(39, 'Culture Result', 'Count/mL', '< 10,000', 1, true),

-- 40. Urine ACR
(40, 'Albumin/Creatinine Ratio', 'µg/mg', '< 30', 1, false);

-- RADIOLOGY TEST PARAMETERS (10 Tests) - These have descriptive parameters instead of numeric
INSERT INTO test_parameters (test_id, parameter_name, unit, normal_range_text, display_order, is_critical) VALUES
-- 41. X-Ray Chest
(41, 'Heart Size', 'Finding', 'Normal', 1, false),
(41, 'Lung Fields', 'Finding', 'Clear', 2, false),
(41, 'Mediastinum', 'Finding', 'Normal', 3, false),

-- 42. Ultrasound Abdomen
(42, 'Liver', 'Finding', 'Normal size and echotexture', 1, false),
(42, 'Spleen', 'Finding', 'Normal', 2, false),
(42, 'Kidneys', 'Finding', 'Normal', 3, false),
(42, 'Pancreas', 'Finding', 'Normal', 4, false),

-- 43. Ultrasound KUB
(43, 'Kidneys', 'Finding', 'No stones', 1, false),
(43, 'Ureters', 'Finding', 'Normal', 2, false),
(43, 'Bladder', 'Finding', 'Normal', 3, false),

-- 44. Ultrasound Pelvis
(44, 'Uterus', 'Finding', 'Normal size and contour', 1, false),
(44, 'Ovaries', 'Finding', 'Normal', 2, false),

-- 45. Obstetric Ultrasound
(45, 'Fetal Heart Rate', 'bpm', '120-160', 1, true),
(45, 'Fetal Growth', 'Percentile', '10th-90th', 2, false),

-- 46. ECG
(46, 'Heart Rate', 'bpm', '60-100', 1, false),
(46, 'Rhythm', 'Pattern', 'Normal Sinus Rhythm', 2, true),

-- 47. 2D Echo
(47, 'EF (Ejection Fraction)', '%', '50-70%', 1, false),
(47, 'LV (Left Ventricle)', 'mm', '> 35', 2, false),

-- 48. CT Head
(48, 'Brain', 'Finding', 'No abnormality', 1, true),

-- 49. MRI Brain
(49, 'White Matter', 'Finding', 'Normal', 1, false),
(49, 'Ventricles', 'Finding', 'Normal size', 2, false),

-- 50. Mammography
(50, 'Breast Tissue', 'Finding', 'Normal', 1, true),
(50, 'Microcalcifications', 'Finding', 'None', 2, true);

-- INFECTIOUS DISEASE TESTS PARAMETERS (12 Tests)
INSERT INTO test_parameters (test_id, parameter_name, unit, normal_range_text, display_order, is_critical) VALUES
-- 51. Malaria Antigen
(51, 'Malaria Antigen', 'Result', 'Negative', 1, true),

-- 52. Dengue NS1
(52, 'Dengue NS1 Antigen', 'Cut-off', 'Negative (< 1.0)', 1, true),

-- 53. Dengue IgM
(53, 'Dengue IgM Antibody', 'Index', 'Negative (< 0.9)', 1, true),

-- 54. Widal Test
(54, 'Salmonella O', 'Titer', '< 1:80', 1, false),
(54, 'Salmonella H', 'Titer', '< 1:160', 2, false),

-- 55. Typhoid Rapid
(55, 'Typhoid IgM', 'Result', 'Negative', 1, true),

-- 56. COVID-19 RT-PCR
(56, 'SARS-CoV-2 RT-PCR', 'Result', 'Negative', 1, true),

-- 57. COVID-19 Antigen
(57, 'COVID-19 Antigen', 'Result', 'Negative', 1, true),

-- 58. HIV ELISA
(58, 'HIV Antibodies', 'Result', 'Non-Reactive', 1, true),

-- 59. HIV Rapid
(59, 'HIV Result', 'Result', 'Negative', 1, true),

-- 60. HBsAg
(60, 'Hepatitis B Surface Antigen', 'Result', 'Negative', 1, true),

-- 61. Anti-HCV
(61, 'Hepatitis C Antibody', 'Result', 'Negative', 1, true),

-- 62. VDRL
(62, 'VDRL/RPR', 'Titer', 'Negative / Non-Reactive', 1, true);

-- HORMONE TESTS PARAMETERS (8 Tests)
INSERT INTO test_parameters (test_id, parameter_name, unit, normal_range_text, display_order, is_critical) VALUES
-- 63. TSH Hormone
(63, 'TSH', 'mIU/L', '0.4-4.0', 1, false),

-- 64. Prolactin
(64, 'Prolactin', 'ng/mL', '4.8-28.1 (F) / 2.0-18.0 (M)', 1, false),

-- 65. LH
(65, 'Luteinizing Hormone', 'mIU/mL', '5.9-17.5 (F) / 0.8-7.6 (M)', 1, false),

-- 66. FSH
(66, 'Follicle Stimulating Hormone', 'mIU/mL', '3.9-8.8 (F) / 1.5-12.4 (M)', 1, false),

-- 67. Testosterone Male
(67, 'Testosterone', 'ng/dL', '300-1000', 1, false),

-- 68. Testosterone Female
(68, 'Testosterone', 'ng/dL', '15-70', 1, false),

-- 69. AMH
(69, 'Anti-Mullerian Hormone', 'ng/mL', '1.0-4.0', 1, false),

-- 70. Cortisol Morning
(70, 'Morning Cortisol', 'µg/dL', '10-20', 1, false);

-- PREGNANCY TESTS PARAMETERS (5 Tests)
INSERT INTO test_parameters (test_id, parameter_name, unit, normal_range_text, display_order, is_critical) VALUES
-- 71. Beta-hCG
(71, 'Beta-hCG (Pregnancy)', 'mIU/mL', '> 5 (Positive)', 1, true),

-- 72. Double Marker
(72, 'Down Syndrome Risk', 'Ratio', '1:250 or less', 1, true),

-- 73. Triple Marker
(73, 'AFP', 'MoM', '0.5-2.5', 1, false),
(73, 'hCG', 'MoM', '0.5-2.5', 2, false),
(73, 'uE3', 'MoM', '0.5-2.5', 3, false),

-- 74. Quadruple Marker
(74, 'AFP', 'MoM', '0.5-2.5', 1, false),
(74, 'hCG', 'MoM', '0.5-2.5', 2, false),
(74, 'uE3', 'MoM', '0.5-2.5', 3, false),
(74, 'Inhibin A', 'MoM', '0.5-2.5', 4, false),

-- 75. Semen Analysis
(75, 'Volume', 'mL', '1.4-3.2', 1, false),
(75, 'Sperm Count', 'million/mL', '> 15', 2, false),
(75, 'Motility', '%', '> 40%', 3, false),
(75, 'Morphology', 'Forms', '> 4%', 4, false);

-- CHILD SPECIFIC TESTS (5 Tests) - Reuse some from blood tests
INSERT INTO test_parameters (test_id, parameter_name, unit, normal_range_text, display_order, is_critical) VALUES
-- 76. CBC Child
(76, 'WBC', 'G/uL', '5.0-15.0', 1, false),
(76, 'Hemoglobin', 'g/dL', '11.0-14.0', 2, false),

-- 77. Vitamin D Child
(77, 'Vitamin D (25-OH)', 'ng/mL', '> 30', 1, false),

-- 78. Iron Studies Child
(78, 'Hemoglobin', 'g/dL', '11.0-14.0', 1, false),
(78, 'Ferritin', 'ng/mL', '12-200', 2, false),

-- 79. Urine Routine Child
(79, 'Color', 'Appearance', 'Pale yellow', 1, false),
(79, 'Protein', 'mg/dL', 'Negative', 2, false),

-- 80. Stool Routine Child
(80, 'Color', 'Appearance', 'Brown', 1, false),
(80, 'Ova & Parasites', 'Result', 'Not seen', 2, false);

-- SENIOR CITIZEN TESTS (8 Tests) - Reuse parameters from main tests
INSERT INTO test_parameters (test_id, parameter_name, unit, normal_range_text, display_order, is_critical) VALUES
-- 81. CBC Senior
(81, 'WBC', 'G/uL', '4.5-11.0', 1, false),
(81, 'Hemoglobin', 'g/dL', '12.0-17.5', 2, false),

-- 82. Lipid Profile Senior
(82, 'Total Cholesterol', 'mg/dL', '< 200', 1, false),
(82, 'LDL', 'mg/dL', '< 100', 2, false),

-- 83. HbA1c Senior
(83, 'HbA1c', '%', '< 7%', 1, false),

-- 84. PSA Senior
(84, 'PSA', 'ng/mL', '0-4.0', 1, true),

-- 85. Vitamin D+B12 Senior
(85, 'Vitamin D', 'ng/mL', '> 30', 1, false),
(85, 'Vitamin B12', 'pg/mL', '> 200', 2, false),

-- 86. ECG Senior
(86, 'Heart Rate', 'bpm', '60-100', 1, false),
(86, 'Rhythm', 'Pattern', 'Normal Sinus', 2, true),

-- 87. 2D Echo Senior
(87, 'Ejection Fraction', '%', '> 50%', 1, false),

-- 88. DEXA Scan
(88, 'T-Score', 'SD', '> -1.0', 1, false);

package com.healthcare.labtestbooking.config;

import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.TestParameterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Loads comprehensive test parameters for all 88 lab tests
 * Runs after tests are seeded to populate test_parameters table
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TestParametersDataLoader implements CommandLineRunner {

    private final LabTestRepository labTestRepository;
    private final TestParameterRepository testParameterRepository;

    @Override
    public void run(String... args) throws Exception {
        // Note: This method may not execute if tests haven't been seeded yet
        // The preferred method is to call loadParametersForTests() directly after seeding tests
        // This is kept for backward compatibility and as a fallback
        loadParametersForTests();
    }

    /**
     * Public method to load parameters for all tests
     * Called by TestsSeeder after seeding the tests
     */
    public void loadParametersForTests() {
        try {
            log.info("========== TEST PARAMETERS DATA LOADER STARTED ==========");
            
            // Load all tests
            List<LabTest> tests = labTestRepository.findAll();
            if (tests.isEmpty()) {
                log.warn("⚠️ No tests found. Cannot load parameters.");
                log.info("========== TEST PARAMETERS DATA LOADER COMPLETED ==========");
                return;
            }

            // Check if parameters already exist
            long parameterCount = testParameterRepository.count();
            if (parameterCount > 50) {  // If > 50, assume data is already loaded
                log.info("✅ Test parameters already loaded ({} parameters found). Skipping.", parameterCount);
                log.info("========== TEST PARAMETERS DATA LOADER COMPLETED ==========");
                return;
            }

            // Delete existing parameters to refresh
            if (parameterCount > 0) {
                testParameterRepository.deleteAll();
                log.info("Cleared existing {} parameters to refresh", parameterCount);
            }

            // Create parameter map for each test
            Map<Long, List<TestParameter>> testParametersMap = buildTestParametersMap(tests);

            // Save all parameters
            int totalSaved = 0;
            for (LabTest test : tests) {
                List<TestParameter> params = testParametersMap.getOrDefault(test.getId(), new ArrayList<>());
                if (!params.isEmpty()) {
                    testParameterRepository.saveAll(params);
                    totalSaved += params.size();
                }
            }

            log.info("✅ Successfully loaded {} test parameters", totalSaved);
            log.info("========== TEST PARAMETERS DATA LOADER COMPLETED ==========");

        } catch (Exception e) {
            log.error("❌ Error loading test parameters", e);
        }
    }

    private Map<Long, List<TestParameter>> buildTestParametersMap(List<LabTest> tests) {
        Map<Long, List<TestParameter>> map = new HashMap<>();

        // Find tests by their properties and add parameters
        for (LabTest test : tests) {
            List<TestParameter> params = new ArrayList<>();
            
            String category = test.getCategoryName();
            String testName = test.getTestName() != null ? test.getTestName().trim() : "";

            // BLOOD TESTS (1-35)
            if ("BLOOD".equals(category)) {
                if (testName.contains("CBC") || testName.contains("Complete Blood Count")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "WBC (White Blood Cells)", "G/uL", "4.5-11.0", 1, false),
                        createParam(test, "RBC (Red Blood Cells)", "M/uL", "4.5-5.5 (M) / 4.0-5.0 (F)", 2, false),
                        createParam(test, "Hemoglobin", "g/dL", "13.5-17.5 (M) / 12.0-15.5 (F)", 3, false),
                        createParam(test, "Hematocrit", "%", "38.8-50.0 (M) / 34.9-44.5 (F)", 4, false),
                        createParam(test, "Platelets", "K/uL", "150-400", 5, false)
                    ));
                } else if (testName.contains("Hemoglobin") && !testName.contains("Test")) {
                    params.add(createParam(test, "Hemoglobin", "g/dL", "13.5-17.5 (M) / 12.0-15.5 (F)", 1, false));
                } else if (testName.contains("Fasting")) {
                    params.add(createParam(test, "Glucose (Fasting)", "mg/dL", "70-100", 1, true));
                } else if (testName.contains("Random")) {
                    params.add(createParam(test, "Glucose (Random)", "mg/dL", "< 140", 1, true));
                } else if (testName.contains("HbA1c") || testName.contains("A1c")) {
                    params.add(createParam(test, "HbA1c", "%", "< 5.7%", 1, true));
                } else if (testName.contains("Lipid Profile")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "Total Cholesterol", "mg/dL", "< 200", 1, false),
                        createParam(test, "LDL Cholesterol", "mg/dL", "< 100", 2, false),
                        createParam(test, "HDL Cholesterol", "mg/dL", "> 40 (M) / > 50 (F)", 3, false),
                        createParam(test, "Triglycerides", "mg/dL", "< 150", 4, false)
                    ));
                } else if (testName.contains("Cholesterol")) {
                    params.add(createParam(test, "Total Cholesterol", "mg/dL", "< 200", 1, false));
                } else if (testName.contains("Triglyceride")) {
                    params.add(createParam(test, "Triglycerides", "mg/dL", "< 150", 1, false));
                } else if (testName.contains("HDL")) {
                    params.add(createParam(test, "HDL Cholesterol", "mg/dL", "> 40 (M) / > 50 (F)", 1, false));
                } else if (testName.contains("LDL")) {
                    params.add(createParam(test, "LDL Cholesterol", "mg/dL", "< 100", 1, false));
                } else if (testName.contains("Thyroid")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "T3 (Triiodothyronine)", "pg/mL", "80-200", 1, false),
                        createParam(test, "T4 (Thyroxine)", "ng/dL", "4.5-12", 2, false),
                        createParam(test, "TSH", "mIU/L", "0.4-4.0", 3, false)
                    ));
                } else if (testName.contains("TSH")) {
                    params.add(createParam(test, "TSH", "mIU/L", "0.4-4.0", 1, false));
                } else if (testName.contains("Liver")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "Total Bilirubin", "mg/dL", "0.3-1.2", 1, false),
                        createParam(test, "Direct Bilirubin", "mg/dL", "0.1-0.3", 2, false),
                        createParam(test, "SGPT (ALT)", "U/L", "7-56", 3, false),
                        createParam(test, "SGOT (AST)", "U/L", "10-40", 4, false)
                    ));
                } else if (testName.contains("SGPT") || testName.contains("ALT")) {
                    params.add(createParam(test, "SGPT (ALT)", "U/L", "7-56", 1, false));
                } else if (testName.contains("SGOT") || testName.contains("AST")) {
                    params.add(createParam(test, "SGOT (AST)", "U/L", "10-40", 1, false));
                } else if (testName.contains("Kidney")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "Creatinine", "mg/dL", "0.7-1.3", 1, false),
                        createParam(test, "Blood Urea", "mg/dL", "10-50", 2, false),
                        createParam(test, "Sodium", "mEq/L", "136-145", 3, false),
                        createParam(test, "Potassium", "mEq/L", "3.5-5.0", 4, false)
                    ));
                } else if (testName.contains("Creatinine")) {
                    params.add(createParam(test, "Creatinine", "mg/dL", "0.7-1.3", 1, false));
                } else if (testName.contains("Urea")) {
                    params.add(createParam(test, "BUN", "mg/dL", "7-20", 1, false));
                } else if (testName.contains("Uric Acid")) {
                    params.add(createParam(test, "Uric Acid", "mg/dL", "3.5-7.2 (M) / 2.6-6.0 (F)", 1, false));
                } else if (testName.contains("Vitamin D")) {
                    params.add(createParam(test, "Vitamin D (25-OH)", "ng/mL", "> 30", 1, false));
                } else if (testName.contains("Vitamin B12")) {
                    params.add(createParam(test, "Vitamin B12", "pg/mL", "200-900", 1, false));
                } else if (testName.contains("Iron")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "Serum Iron", "µg/dL", "60-170 (M) / 50-150 (F)", 1, false),
                        createParam(test, "TIBC", "µg/dL", "250-425", 2, false),
                        createParam(test, "Ferritin", "ng/mL", "24-336 (M) / 11-307 (F)", 3, false)
                    ));
                } else if (testName.contains("Ferritin")) {
                    params.add(createParam(test, "Ferritin", "ng/mL", "24-336 (M) / 11-307 (F)", 1, false));
                } else if (testName.contains("CRP")) {
                    params.add(createParam(test, "CRP", "mg/L", "< 3.0", 1, true));
                } else if (testName.contains("ESR")) {
                    params.add(createParam(test, "ESR", "mm/hr", "0-20 (M) / 0-30 (F)", 1, false));
                } else if (testName.contains("Platelet")) {
                    params.add(createParam(test, "Platelets", "K/uL", "150-400", 1, false));
                } else if (testName.contains("PSA")) {
                    params.add(createParam(test, "PSA (Prostate-Specific Antigen)", "ng/mL", "0-4.0", 1, true));
                } else if (testName.contains("Electrolyte")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "Sodium", "mEq/L", "136-145", 1, false),
                        createParam(test, "Potassium", "mEq/L", "3.5-5.0", 2, false),
                        createParam(test, "Chloride", "mEq/L", "98-107", 3, false)
                    ));
                } else if (testName.contains("Calcium")) {
                    params.add(createParam(test, "Total Calcium", "mg/dL", "8.5-10.2", 1, false));
                } else if (testName.contains("Magnesium")) {
                    params.add(createParam(test, "Magnesium", "mg/dL", "1.7-2.2", 1, false));
                } else if (testName.contains("Phosphorus")) {
                    params.add(createParam(test, "Phosphorus", "mg/dL", "2.5-4.5", 1, false));
                } else if (testName.contains("Amylase")) {
                    params.add(createParam(test, "Amylase", "U/L", "30-110", 1, false));
                } else if (testName.contains("Lipase")) {
                    params.add(createParam(test, "Lipase", "U/L", "0-51", 1, false));
                } else if (testName.contains("LDH")) {
                    params.add(createParam(test, "LDH", "U/L", "140-280", 1, false));
                } else if (testName.contains("GGT")) {
                    params.add(createParam(test, "GGT", "U/L", "0-51 (M) / 0-32 (F)", 1, false));
                }
            }
            // URINE TESTS (36-40)
            else if ("URINE".equals(category)) {
                if (testName.contains("Routine") || testName.contains("Urinalysis")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "Color", "Appearance", "Pale yellow to dark yellow", 1, false),
                        createParam(test, "Appearance", "Appearance", "Clear", 2, false),
                        createParam(test, "pH", "pH", "4.5-8.0", 3, false),
                        createParam(test, "Specific Gravity", "SG", "1.005-1.030", 4, false),
                        createParam(test, "Protein", "mg/dL", "Negative", 5, true),
                        createParam(test, "Glucose", "mg/dL", "Negative", 6, true),
                        createParam(test, "Ketones", "mmol/L", "Negative", 7, true)
                    ));
                } else if (testName.contains("Pregnancy")) {
                    params.add(createParam(test, "hCG (Pregnancy)", "mIU/mL", "< 5 (Negative)", 1, true));
                } else if (testName.contains("Microalbumin")) {
                    params.add(createParam(test, "Microalbumin", "µg/mL", "< 20", 1, false));
                } else if (testName.contains("Culture")) {
                    params.add(createParam(test, "Culture Result", "Count/mL", "< 10,000", 1, true));
                } else if (testName.contains("ACR")) {
                    params.add(createParam(test, "Albumin/Creatinine Ratio", "µg/mg", "< 30", 1, false));
                }
            }
            // IMAGING TESTS (41-50) - Descriptive parameters
            else if ("IMAGING".equals(category) || "PATHOLOGY".equals(category)) {
                if (testName.contains("X-Ray")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "Heart Size", "Finding", "Normal", 1, false),
                        createParam(test, "Lung Fields", "Finding", "Clear", 2, false),
                        createParam(test, "Mediastinum", "Finding", "Normal", 3, false)
                    ));
                } else if (testName.contains("Ultrasound") && testName.contains("Abdomen")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "Liver", "Finding", "Normal size and echotexture", 1, false),
                        createParam(test, "Spleen", "Finding", "Normal", 2, false),
                        createParam(test, "Kidneys", "Finding", "Normal", 3, false),
                        createParam(test, "Pancreas", "Finding", "Normal", 4, false)
                    ));
                } else if (testName.contains("ECG")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "Heart Rate", "bpm", "60-100", 1, false),
                        createParam(test, "Rhythm", "Pattern", "Normal Sinus Rhythm", 2, true)
                    ));
                } else if (testName.contains("Echo") || testName.contains("2D")) {
                    params.addAll(Arrays.asList(
                        createParam(test, "EF (Ejection Fraction)", "%", "50-70%", 1, false),
                        createParam(test, "LV (Left Ventricle)", "mm", "> 35", 2, false)
                    ));
                } else if (testName.contains("CT") || testName.contains("MRI")) {
                    params.add(createParam(test, "Finding", "Finding", "No abnormality", 1, true));
                } else if (testName.contains("Mammo")) {
                    params.add(createParam(test, "Breast Tissue", "Finding", "Normal", 1, true));
                } else {
                    // Generic parameters for other tests
                    params.add(createParam(test, "Result Status", "Status", "Normal", 1, false));
                }
            }

            if (!params.isEmpty()) {
                map.put(test.getId(), params);
            }
        }

        return map;
    }

    private TestParameter createParam(LabTest test, String paramName, String unit, 
                                     String normalRangeText, int displayOrder, boolean isCritical) {
        return TestParameter.builder()
                .test(test)
                .parameterName(paramName)
                .unit(unit)
                .normalRangeText(normalRangeText)
                .displayOrder(displayOrder)
                .isCritical(isCritical)
                .build();
    }
}

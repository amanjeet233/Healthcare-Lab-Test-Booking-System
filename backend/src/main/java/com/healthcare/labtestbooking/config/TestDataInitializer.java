package com.healthcare.labtestbooking.config;

import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestCategory;
import com.healthcare.labtestbooking.entity.enums.TestType;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.TestCategoryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class TestDataInitializer {

    private final LabTestRepository labTestRepository;
    private final TestCategoryRepository testCategoryRepository;

    private Map<String, TestCategory> categoryMap = new HashMap<>();
    private int testCounter = 0;

    @Bean
    @Order(1)
    @Profile("!test")
    public CommandLineRunner initializeTestData() {
        return args -> {
            // DISABLED: Test data is now loaded via Flyway migrations (V15)
            log.info("TestDataInitializer: Skipping - using Flyway migrations instead");
            /*
            if (labTestRepository.count() < 100) {
                log.info("Initializing comprehensive lab test data...");
                initializeCategories();
                insertAllTests();
                log.info("Successfully inserted {} lab tests", testCounter);
            } else {
                log.info("Lab tests already exist, skipping initialization");
            }
            */
        };
    }

    @Transactional
    public void initializeCategories() {
        String[][] categories = {
            {"BLOOD_TESTS", "Blood Tests", "Complete range of blood-based diagnostic tests", "1"},
            {"URINE_TESTS", "Urine Tests", "Urinalysis and urine-based diagnostic tests", "2"},
            {"IMAGING", "Imaging Tests", "X-Ray, CT, MRI, Ultrasound and other imaging", "3"},
            {"SPECIALIZED", "Specialized Tests", "Genetic, pathology and specialized diagnostics", "4"},
            {"WELLNESS", "Wellness Packages", "Health checkup and preventive screening packages", "5"},
            {"CARDIAC", "Cardiac Tests", "Heart and cardiovascular diagnostic tests", "6"},
            {"HORMONES", "Hormone Tests", "Endocrine and hormone panel tests", "7"},
            {"ALLERGY", "Allergy Tests", "Allergen panels and immunoglobulin tests", "8"},
            {"INFECTIOUS", "Infectious Disease", "Tests for viral, bacterial and parasitic infections", "9"},
            {"DIABETES", "Diabetes Tests", "Blood sugar and diabetes monitoring tests", "10"},
            {"THYROID", "Thyroid Tests", "Thyroid function and antibody tests", "11"},
            {"LIVER", "Liver Function", "Hepatic panel and liver enzyme tests", "12"},
            {"KIDNEY", "Kidney Function", "Renal panel and kidney function tests", "13"},
            {"VITAMINS", "Vitamins & Minerals", "Nutritional deficiency and vitamin level tests", "14"},
            {"TUMOR_MARKERS", "Tumor Markers", "Cancer screening and tumor marker tests", "15"},
            {"AUTOIMMUNE", "Autoimmune Tests", "Autoantibody and autoimmune disorder tests", "16"},
            {"GENETIC", "Genetic Tests", "DNA analysis and genetic screening", "17"},
            {"PRENATAL", "Prenatal Tests", "Pregnancy and prenatal screening", "18"},
            {"STD", "STD Panel", "Sexually transmitted disease screening", "19"},
            {"DRUG_SCREENING", "Drug Screening", "Substance abuse and drug detection tests", "20"}
        };

        for (String[] cat : categories) {
            if (testCategoryRepository.findByCategoryName(cat[1]).isEmpty()) {
                TestCategory category = TestCategory.builder()
                    .categoryName(cat[1])
                    .description(cat[2])
                    .displayOrder(Integer.parseInt(cat[3]))
                    .isActive(true)
                    .build();
                category = testCategoryRepository.save(category);
                categoryMap.put(cat[0], category);
            } else {
                categoryMap.put(cat[0], testCategoryRepository.findByCategoryName(cat[1]).get());
            }
        }
        log.info("Initialized {} test categories", categories.length);
    }

    @Transactional
    public void insertAllTests() {
        List<LabTest> allTests = new ArrayList<>();

        // Blood Tests (300+)
        allTests.addAll(createCBCTests());
        allTests.addAll(createMetabolicPanelTests());
        allTests.addAll(createLipidProfileTests());
        allTests.addAll(createLiverFunctionTests());
        allTests.addAll(createKidneyFunctionTests());
        allTests.addAll(createThyroidTests());
        allTests.addAll(createDiabetesTests());
        allTests.addAll(createCardiacMarkerTests());
        allTests.addAll(createHormoneTests());
        allTests.addAll(createVitaminTests());
        allTests.addAll(createAllergyTests());
        allTests.addAll(createInfectionTests());
        allTests.addAll(createAutoImmuneTests());
        allTests.addAll(createTumorMarkerTests());
        allTests.addAll(createCoagulationTests());

        // Urine Tests (150+)
        allTests.addAll(createUrineTests());
        allTests.addAll(create24HourUrineTests());
        allTests.addAll(createDrugScreeningTests());

        // Imaging Tests (200+)
        allTests.addAll(createXRayTests());
        allTests.addAll(createUltrasoundTests());
        allTests.addAll(createCTScanTests());
        allTests.addAll(createMRITests());
        allTests.addAll(createSpecialImagingTests());

        // Specialized Tests (150+)
        allTests.addAll(createGeneticTests());
        allTests.addAll(createPathologyTests());
        allTests.addAll(createMicrobiologyTests());
        allTests.addAll(createSpecialChemistryTests());

        // Wellness Packages (200+)
        allTests.addAll(createBasicHealthCheckups());
        allTests.addAll(createExecutiveHealthPackages());
        allTests.addAll(createWomensHealthTests());
        allTests.addAll(createMensHealthTests());
        allTests.addAll(createSeniorCitizenTests());
        allTests.addAll(createPreventiveScreenings());

        // Additional Specialized Tests (130+)
        allTests.addAll(createSTDTests());
        allTests.addAll(createPrenatalTests());
        allTests.addAll(createImmunologyTests());
        allTests.addAll(createElectrophysiologyTests());
        allTests.addAll(createRespiratoryTests());

        // Batch save
        labTestRepository.saveAll(allTests);
        testCounter = allTests.size();
    }

    // ==================== BLOOD TESTS ====================

    private List<LabTest> createCBCTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("BLOOD_TESTS");

        tests.add(createTest("CBC001", "Complete Blood Count (CBC)", "Measures WBC, RBC, Hemoglobin, Hematocrit, Platelets for overall health assessment", cat, TestType.HEMATOLOGY, new BigDecimal("299"), false, null, 4, "See detailed report", "mg/dL"));
        tests.add(createTest("CBC002", "CBC with Differential", "CBC with detailed WBC breakdown including neutrophils, lymphocytes, monocytes", cat, TestType.HEMATOLOGY, new BigDecimal("399"), false, null, 4, "See detailed report", "cells/mcL"));
        tests.add(createTest("CBC003", "Hemoglobin (Hb)", "Measures oxygen-carrying protein in red blood cells", cat, TestType.HEMATOLOGY, new BigDecimal("99"), false, null, 2, "M:13.5-17.5, F:12-16 g/dL", "g/dL"));
        tests.add(createTest("CBC004", "Hematocrit (HCT)", "Percentage of blood volume occupied by red blood cells", cat, TestType.HEMATOLOGY, new BigDecimal("99"), false, null, 2, "M:38.8-50%, F:34.9-44.5%", "%"));
        tests.add(createTest("CBC005", "Red Blood Cell Count", "Total number of red blood cells per volume of blood", cat, TestType.HEMATOLOGY, new BigDecimal("149"), false, null, 2, "M:4.7-6.1, F:4.2-5.4 million/mcL", "million/mcL"));
        tests.add(createTest("CBC006", "White Blood Cell Count", "Total number of white blood cells for immunity assessment", cat, TestType.HEMATOLOGY, new BigDecimal("149"), false, null, 2, "4,500-11,000 cells/mcL", "cells/mcL"));
        tests.add(createTest("CBC007", "Platelet Count", "Number of platelets for blood clotting assessment", cat, TestType.HEMATOLOGY, new BigDecimal("149"), false, null, 2, "150,000-400,000/mcL", "/mcL"));
        tests.add(createTest("CBC008", "Mean Corpuscular Volume (MCV)", "Average size of red blood cells", cat, TestType.HEMATOLOGY, new BigDecimal("129"), false, null, 2, "80-100 fL", "fL"));
        tests.add(createTest("CBC009", "Mean Corpuscular Hemoglobin (MCH)", "Average amount of hemoglobin per red blood cell", cat, TestType.HEMATOLOGY, new BigDecimal("129"), false, null, 2, "27-33 pg", "pg"));
        tests.add(createTest("CBC010", "MCHC", "Average concentration of hemoglobin in red blood cells", cat, TestType.HEMATOLOGY, new BigDecimal("129"), false, null, 2, "32-36 g/dL", "g/dL"));
        tests.add(createTest("CBC011", "Red Cell Distribution Width (RDW)", "Variation in red blood cell size", cat, TestType.HEMATOLOGY, new BigDecimal("129"), false, null, 2, "11.5-14.5%", "%"));
        tests.add(createTest("CBC012", "Reticulocyte Count", "Immature red blood cells indicating bone marrow function", cat, TestType.HEMATOLOGY, new BigDecimal("349"), false, null, 24, "0.5-2.5%", "%"));
        tests.add(createTest("CBC013", "Absolute Neutrophil Count", "Total number of neutrophils for infection assessment", cat, TestType.HEMATOLOGY, new BigDecimal("199"), false, null, 4, "2,500-7,000/mcL", "/mcL"));
        tests.add(createTest("CBC014", "Absolute Lymphocyte Count", "Total number of lymphocytes for immune function", cat, TestType.HEMATOLOGY, new BigDecimal("199"), false, null, 4, "1,000-4,800/mcL", "/mcL"));
        tests.add(createTest("CBC015", "Absolute Eosinophil Count", "Eosinophils count for allergy and parasitic assessment", cat, TestType.HEMATOLOGY, new BigDecimal("199"), false, null, 4, "100-500/mcL", "/mcL"));
        tests.add(createTest("CBC016", "Peripheral Blood Smear", "Microscopic examination of blood cells morphology", cat, TestType.HEMATOLOGY, new BigDecimal("399"), false, null, 24, "Normal morphology", "qualitative"));
        tests.add(createTest("CBC017", "ESR (Erythrocyte Sedimentation Rate)", "Inflammation marker measuring RBC settling rate", cat, TestType.HEMATOLOGY, new BigDecimal("149"), false, null, 2, "M:0-15, F:0-20 mm/hr", "mm/hr"));
        tests.add(createTest("CBC018", "Absolute Monocyte Count", "Monocytes for chronic infection assessment", cat, TestType.HEMATOLOGY, new BigDecimal("199"), false, null, 4, "200-800/mcL", "/mcL"));
        tests.add(createTest("CBC019", "Absolute Basophil Count", "Basophils count for allergic reaction assessment", cat, TestType.HEMATOLOGY, new BigDecimal("199"), false, null, 4, "0-100/mcL", "/mcL"));
        tests.add(createTest("CBC020", "Mean Platelet Volume (MPV)", "Average size of platelets", cat, TestType.HEMATOLOGY, new BigDecimal("149"), false, null, 2, "7.5-11.5 fL", "fL"));

        // Additional CBC Tests
        tests.add(createTest("CBC021", "Platelet Distribution Width (PDW)", "Variation in platelet size", cat, TestType.HEMATOLOGY, new BigDecimal("149"), false, null, 2, "10-17%", "%"));
        tests.add(createTest("CBC022", "Immature Platelet Fraction (IPF)", "Young platelets for bone marrow assessment", cat, TestType.HEMATOLOGY, new BigDecimal("399"), false, null, 24, "1-6%", "%"));
        tests.add(createTest("CBC023", "Hemoglobin Electrophoresis", "Hemoglobin variants for thalassemia and sickle cell", cat, TestType.HEMATOLOGY, new BigDecimal("999"), false, null, 72, "HbA >95%, HbA2 <3.5%", "%"));
        tests.add(createTest("CBC024", "HPLC Hemoglobin Analysis", "High-performance analysis of hemoglobin variants", cat, TestType.HEMATOLOGY, new BigDecimal("1299"), false, null, 72, "See detailed report", "%"));
        tests.add(createTest("CBC025", "Sickling Test", "Screening for sickle cell trait or disease", cat, TestType.HEMATOLOGY, new BigDecimal("299"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("CBC026", "G6PD (Glucose-6-Phosphate Dehydrogenase)", "Enzyme deficiency causing hemolytic anemia", cat, TestType.HEMATOLOGY, new BigDecimal("599"), false, null, 48, "Normal activity", "U/g Hb"));
        tests.add(createTest("CBC027", "Osmotic Fragility Test", "Red cell membrane stability assessment", cat, TestType.HEMATOLOGY, new BigDecimal("499"), false, null, 48, "Normal", "% hemolysis"));
        tests.add(createTest("CBC028", "Direct Coombs Test (DAT)", "Antibodies attached to red blood cells", cat, TestType.HEMATOLOGY, new BigDecimal("399"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("CBC029", "Indirect Coombs Test (IAT)", "Antibodies in serum against red blood cells", cat, TestType.HEMATOLOGY, new BigDecimal("399"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("CBC030", "Cold Agglutinins", "Antibodies causing RBC clumping in cold", cat, TestType.HEMATOLOGY, new BigDecimal("599"), false, null, 48, "Titer <1:32", "titer"));
        tests.add(createTest("CBC031", "Heinz Body Stain", "Damaged hemoglobin in red blood cells", cat, TestType.HEMATOLOGY, new BigDecimal("299"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("CBC032", "Iron Stain (Bone Marrow)", "Iron stores in bone marrow", cat, TestType.HEMATOLOGY, new BigDecimal("799"), false, null, 72, "Grade 2-3", "grade"));
        tests.add(createTest("CBC033", "Reticulocyte Hemoglobin Content (CHr)", "Iron availability for RBC production", cat, TestType.HEMATOLOGY, new BigDecimal("399"), false, null, 24, ">29 pg", "pg"));
        tests.add(createTest("CBC034", "Serum Erythropoietin (EPO)", "Hormone stimulating RBC production", cat, TestType.HEMATOLOGY, new BigDecimal("999"), false, null, 72, "4-24 mIU/mL", "mIU/mL"));
        tests.add(createTest("CBC035", "Soluble Transferrin Receptor (sTfR)", "Iron deficiency marker", cat, TestType.HEMATOLOGY, new BigDecimal("899"), false, null, 72, "1.9-4.4 mg/L", "mg/L"));
        tests.add(createTest("CBC036", "Plasma Hemoglobin (Free)", "Indicator of intravascular hemolysis", cat, TestType.HEMATOLOGY, new BigDecimal("499"), false, null, 24, "<5 mg/dL", "mg/dL"));
        tests.add(createTest("CBC037", "Hepcidin", "Iron regulation hormone", cat, TestType.HEMATOLOGY, new BigDecimal("1499"), false, null, 96, "20-200 ng/mL", "ng/mL"));
        tests.add(createTest("CBC038", "Methemoglobin", "Abnormal hemoglobin unable to carry oxygen", cat, TestType.HEMATOLOGY, new BigDecimal("399"), false, null, 4, "<1%", "%"));
        tests.add(createTest("CBC039", "Carboxyhemoglobin", "Carbon monoxide bound hemoglobin", cat, TestType.HEMATOLOGY, new BigDecimal("399"), false, null, 4, "<3% non-smoker", "%"));
        tests.add(createTest("CBC040", "Blood Smear Malaria Parasites", "Microscopic examination for malaria", cat, TestType.HEMATOLOGY, new BigDecimal("249"), false, null, 4, "Not seen", "qualitative"));

        return tests;
    }

    private List<LabTest> createMetabolicPanelTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("BLOOD_TESTS");

        tests.add(createTest("BMP001", "Basic Metabolic Panel (BMP)", "8 tests measuring glucose, calcium, electrolytes, kidney function", cat, TestType.BIOCHEMISTRY, new BigDecimal("599"), true, 8, 4, "See detailed report", "multiple"));
        tests.add(createTest("CMP001", "Comprehensive Metabolic Panel (CMP)", "14 tests including BMP plus liver function markers", cat, TestType.BIOCHEMISTRY, new BigDecimal("899"), true, 10, 4, "See detailed report", "multiple"));
        tests.add(createTest("ELEC001", "Electrolyte Panel", "Sodium, Potassium, Chloride, Bicarbonate levels", cat, TestType.BIOCHEMISTRY, new BigDecimal("399"), false, null, 4, "See detailed report", "mEq/L"));
        tests.add(createTest("ELEC002", "Sodium (Na)", "Essential electrolyte for fluid balance and nerve function", cat, TestType.BIOCHEMISTRY, new BigDecimal("149"), false, null, 2, "136-145 mEq/L", "mEq/L"));
        tests.add(createTest("ELEC003", "Potassium (K)", "Essential electrolyte for heart and muscle function", cat, TestType.BIOCHEMISTRY, new BigDecimal("149"), false, null, 2, "3.5-5.0 mEq/L", "mEq/L"));
        tests.add(createTest("ELEC004", "Chloride (Cl)", "Electrolyte maintaining fluid and acid-base balance", cat, TestType.BIOCHEMISTRY, new BigDecimal("149"), false, null, 2, "98-106 mEq/L", "mEq/L"));
        tests.add(createTest("ELEC005", "Bicarbonate (CO2)", "Measures blood acidity and kidney function", cat, TestType.BIOCHEMISTRY, new BigDecimal("149"), false, null, 2, "23-29 mEq/L", "mEq/L"));
        tests.add(createTest("ELEC006", "Calcium (Ca)", "Essential mineral for bones, muscles, and nerves", cat, TestType.BIOCHEMISTRY, new BigDecimal("179"), false, null, 2, "8.5-10.5 mg/dL", "mg/dL"));
        tests.add(createTest("ELEC007", "Ionized Calcium", "Free calcium in blood for cellular function", cat, TestType.BIOCHEMISTRY, new BigDecimal("299"), false, null, 4, "4.5-5.6 mg/dL", "mg/dL"));
        tests.add(createTest("ELEC008", "Magnesium (Mg)", "Mineral essential for muscle and nerve function", cat, TestType.BIOCHEMISTRY, new BigDecimal("199"), false, null, 4, "1.7-2.2 mg/dL", "mg/dL"));
        tests.add(createTest("ELEC009", "Phosphorus", "Mineral essential for bones and energy metabolism", cat, TestType.BIOCHEMISTRY, new BigDecimal("179"), false, null, 4, "2.5-4.5 mg/dL", "mg/dL"));
        tests.add(createTest("GLU001", "Fasting Blood Glucose", "Blood sugar level after overnight fasting", cat, TestType.DIABETES, new BigDecimal("99"), true, 12, 2, "70-100 mg/dL", "mg/dL"));
        tests.add(createTest("GLU002", "Random Blood Glucose", "Blood sugar at any time regardless of meals", cat, TestType.DIABETES, new BigDecimal("79"), false, null, 2, "<140 mg/dL", "mg/dL"));
        tests.add(createTest("BUN001", "Blood Urea Nitrogen (BUN)", "Waste product indicating kidney function", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("149"), false, null, 2, "7-20 mg/dL", "mg/dL"));
        tests.add(createTest("CREAT001", "Creatinine, Serum", "Waste product for kidney function assessment", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("149"), false, null, 2, "M:0.7-1.3, F:0.6-1.1 mg/dL", "mg/dL"));

        return tests;
    }

    private List<LabTest> createLipidProfileTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("BLOOD_TESTS");

        tests.add(createTest("LIP001", "Lipid Profile (Standard)", "Total cholesterol, LDL, HDL, VLDL, Triglycerides", cat, TestType.LIPID_PROFILE, new BigDecimal("499"), true, 12, 24, "See detailed report", "mg/dL"));
        tests.add(createTest("LIP002", "Lipid Profile (Advanced)", "Standard lipid plus Apo A1, Apo B, Lipoprotein(a)", cat, TestType.LIPID_PROFILE, new BigDecimal("999"), true, 12, 24, "See detailed report", "mg/dL"));
        tests.add(createTest("LIP003", "Total Cholesterol", "Total amount of cholesterol in blood", cat, TestType.LIPID_PROFILE, new BigDecimal("149"), true, 12, 4, "<200 mg/dL desirable", "mg/dL"));
        tests.add(createTest("LIP004", "LDL Cholesterol (Direct)", "Bad cholesterol directly measured", cat, TestType.LIPID_PROFILE, new BigDecimal("249"), true, 12, 4, "<100 mg/dL optimal", "mg/dL"));
        tests.add(createTest("LIP005", "HDL Cholesterol", "Good cholesterol protecting against heart disease", cat, TestType.LIPID_PROFILE, new BigDecimal("199"), true, 12, 4, ">40 M, >50 F mg/dL", "mg/dL"));
        tests.add(createTest("LIP006", "VLDL Cholesterol", "Very low density lipoprotein carrying triglycerides", cat, TestType.LIPID_PROFILE, new BigDecimal("179"), true, 12, 4, "5-40 mg/dL", "mg/dL"));
        tests.add(createTest("LIP007", "Triglycerides", "Fat in blood from food and body production", cat, TestType.LIPID_PROFILE, new BigDecimal("179"), true, 12, 4, "<150 mg/dL normal", "mg/dL"));
        tests.add(createTest("LIP008", "Non-HDL Cholesterol", "Total cholesterol minus HDL for CVD risk", cat, TestType.LIPID_PROFILE, new BigDecimal("199"), true, 12, 4, "<130 mg/dL optimal", "mg/dL"));
        tests.add(createTest("LIP009", "TC/HDL Ratio", "Cholesterol ratio for cardiovascular risk assessment", cat, TestType.LIPID_PROFILE, new BigDecimal("149"), true, 12, 4, "<5.0 desirable", "ratio"));
        tests.add(createTest("LIP010", "LDL/HDL Ratio", "Bad to good cholesterol ratio", cat, TestType.LIPID_PROFILE, new BigDecimal("149"), true, 12, 4, "<3.0 optimal", "ratio"));
        tests.add(createTest("LIP011", "Apolipoprotein A1 (Apo A1)", "Main protein of HDL cholesterol", cat, TestType.LIPID_PROFILE, new BigDecimal("599"), true, 12, 24, "M:94-178, F:101-199 mg/dL", "mg/dL"));
        tests.add(createTest("LIP012", "Apolipoprotein B (Apo B)", "Main protein of LDL cholesterol", cat, TestType.LIPID_PROFILE, new BigDecimal("599"), true, 12, 24, "<90 mg/dL optimal", "mg/dL"));
        tests.add(createTest("LIP013", "Lipoprotein(a) [Lp(a)]", "Genetic risk factor for cardiovascular disease", cat, TestType.LIPID_PROFILE, new BigDecimal("799"), true, 12, 48, "<30 mg/dL desirable", "mg/dL"));
        tests.add(createTest("LIP014", "Small Dense LDL", "Most atherogenic LDL particles measurement", cat, TestType.LIPID_PROFILE, new BigDecimal("1299"), true, 12, 72, "Pattern A preferred", "nm"));
        tests.add(createTest("LIP015", "Oxidized LDL", "Damaged LDL contributing to atherosclerosis", cat, TestType.LIPID_PROFILE, new BigDecimal("1499"), true, 12, 72, "<60 U/L", "U/L"));

        return tests;
    }

    private List<LabTest> createLiverFunctionTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("LIVER");

        tests.add(createTest("LFT001", "Liver Function Test (LFT)", "Complete liver panel including enzymes and proteins", cat, TestType.LIVER_FUNCTION, new BigDecimal("599"), true, 10, 24, "See detailed report", "multiple"));
        tests.add(createTest("LFT002", "SGOT/AST", "Liver enzyme also found in heart and muscles", cat, TestType.LIVER_FUNCTION, new BigDecimal("149"), false, null, 4, "10-40 U/L", "U/L"));
        tests.add(createTest("LFT003", "SGPT/ALT", "Liver-specific enzyme for hepatocyte damage", cat, TestType.LIVER_FUNCTION, new BigDecimal("149"), false, null, 4, "7-56 U/L", "U/L"));
        tests.add(createTest("LFT004", "Alkaline Phosphatase (ALP)", "Enzyme from liver and bone", cat, TestType.LIVER_FUNCTION, new BigDecimal("179"), false, null, 4, "44-147 U/L", "U/L"));
        tests.add(createTest("LFT005", "Gamma GT (GGT)", "Enzyme elevated in liver and bile duct disease", cat, TestType.LIVER_FUNCTION, new BigDecimal("199"), false, null, 4, "M:9-48, F:9-36 U/L", "U/L"));
        tests.add(createTest("LFT006", "Total Bilirubin", "Breakdown product of red blood cells", cat, TestType.LIVER_FUNCTION, new BigDecimal("149"), false, null, 4, "0.1-1.2 mg/dL", "mg/dL"));
        tests.add(createTest("LFT007", "Direct Bilirubin", "Conjugated bilirubin processed by liver", cat, TestType.LIVER_FUNCTION, new BigDecimal("149"), false, null, 4, "0-0.3 mg/dL", "mg/dL"));
        tests.add(createTest("LFT008", "Indirect Bilirubin", "Unconjugated bilirubin before liver processing", cat, TestType.LIVER_FUNCTION, new BigDecimal("149"), false, null, 4, "0.1-0.9 mg/dL", "mg/dL"));
        tests.add(createTest("LFT009", "Total Protein", "Total albumin and globulin in blood", cat, TestType.LIVER_FUNCTION, new BigDecimal("149"), false, null, 4, "6.0-8.3 g/dL", "g/dL"));
        tests.add(createTest("LFT010", "Albumin", "Main protein made by liver for nutrient transport", cat, TestType.LIVER_FUNCTION, new BigDecimal("149"), false, null, 4, "3.5-5.0 g/dL", "g/dL"));
        tests.add(createTest("LFT011", "Globulin", "Proteins including antibodies and enzymes", cat, TestType.LIVER_FUNCTION, new BigDecimal("149"), false, null, 4, "2.0-3.5 g/dL", "g/dL"));
        tests.add(createTest("LFT012", "A/G Ratio", "Albumin to globulin ratio for liver assessment", cat, TestType.LIVER_FUNCTION, new BigDecimal("99"), false, null, 4, "1.1-2.5", "ratio"));
        tests.add(createTest("LFT013", "Prothrombin Time (PT)", "Blood clotting time requiring vitamin K from liver", cat, TestType.COAGULATION, new BigDecimal("299"), false, null, 4, "11-13.5 seconds", "seconds"));
        tests.add(createTest("LFT014", "INR", "Standardized PT for anticoagulation monitoring", cat, TestType.COAGULATION, new BigDecimal("299"), false, null, 4, "0.8-1.1 normal", "ratio"));
        tests.add(createTest("LFT015", "5' Nucleotidase", "Specific liver enzyme for cholestasis", cat, TestType.LIVER_FUNCTION, new BigDecimal("399"), false, null, 24, "2-17 U/L", "U/L"));

        return tests;
    }

    private List<LabTest> createKidneyFunctionTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("KIDNEY");

        tests.add(createTest("KFT001", "Kidney Function Test (KFT/RFT)", "Complete renal panel including BUN, creatinine, electrolytes", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("599"), false, null, 24, "See detailed report", "multiple"));
        tests.add(createTest("KFT002", "Blood Urea", "Waste product from protein metabolism", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("149"), false, null, 4, "15-40 mg/dL", "mg/dL"));
        tests.add(createTest("KFT003", "Serum Creatinine", "Waste from muscle metabolism filtered by kidneys", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("149"), false, null, 4, "M:0.7-1.3, F:0.6-1.1 mg/dL", "mg/dL"));
        tests.add(createTest("KFT004", "BUN/Creatinine Ratio", "Helps differentiate kidney from other conditions", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("199"), false, null, 4, "10:1 to 20:1", "ratio"));
        tests.add(createTest("KFT005", "eGFR (Estimated GFR)", "Estimated glomerular filtration rate for kidney function", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("249"), false, null, 4, ">90 mL/min normal", "mL/min/1.73m2"));
        tests.add(createTest("KFT006", "Uric Acid, Serum", "End product of purine metabolism", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("179"), false, null, 4, "M:3.5-7.2, F:2.6-6.0 mg/dL", "mg/dL"));
        tests.add(createTest("KFT007", "Cystatin C", "Alternative marker for GFR estimation", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("799"), false, null, 24, "0.6-1.0 mg/L", "mg/L"));
        tests.add(createTest("KFT008", "Beta-2 Microglobulin", "Marker for kidney tubular function", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("899"), false, null, 48, "0.7-1.8 mg/L", "mg/L"));
        tests.add(createTest("KFT009", "Microalbumin, Serum", "Early kidney damage marker especially in diabetes", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("499"), false, null, 24, "<20 mg/L", "mg/L"));
        tests.add(createTest("KFT010", "Creatinine Clearance", "24-hour test for actual GFR measurement", cat, TestType.KIDNEY_FUNCTION, new BigDecimal("699"), false, null, 48, "M:97-137, F:88-128 mL/min", "mL/min"));

        return tests;
    }

    private List<LabTest> createThyroidTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("THYROID");

        tests.add(createTest("THY001", "Thyroid Profile (T3, T4, TSH)", "Complete thyroid function assessment", cat, TestType.THYROID, new BigDecimal("499"), false, null, 24, "See detailed report", "multiple"));
        tests.add(createTest("THY002", "TSH (Thyroid Stimulating Hormone)", "Primary test for thyroid function", cat, TestType.THYROID, new BigDecimal("249"), false, null, 4, "0.4-4.0 mIU/L", "mIU/L"));
        tests.add(createTest("THY003", "Free T4 (Thyroxine)", "Active thyroid hormone unbound to proteins", cat, TestType.THYROID, new BigDecimal("249"), false, null, 4, "0.8-1.8 ng/dL", "ng/dL"));
        tests.add(createTest("THY004", "Free T3 (Triiodothyronine)", "Most active thyroid hormone", cat, TestType.THYROID, new BigDecimal("249"), false, null, 4, "2.3-4.2 pg/mL", "pg/mL"));
        tests.add(createTest("THY005", "Total T4", "Total thyroxine including protein-bound", cat, TestType.THYROID, new BigDecimal("199"), false, null, 4, "5.0-12.0 mcg/dL", "mcg/dL"));
        tests.add(createTest("THY006", "Total T3", "Total triiodothyronine in blood", cat, TestType.THYROID, new BigDecimal("199"), false, null, 4, "80-200 ng/dL", "ng/dL"));
        tests.add(createTest("THY007", "T3 Uptake", "Indirect measure of thyroid binding proteins", cat, TestType.THYROID, new BigDecimal("199"), false, null, 4, "25-35%", "%"));
        tests.add(createTest("THY008", "Reverse T3 (rT3)", "Inactive form of T3 for metabolism assessment", cat, TestType.THYROID, new BigDecimal("599"), false, null, 48, "10-24 ng/dL", "ng/dL"));
        tests.add(createTest("THY009", "Anti-TPO Antibodies", "Thyroid peroxidase antibodies for autoimmune thyroid", cat, TestType.THYROID, new BigDecimal("599"), false, null, 24, "<35 IU/mL", "IU/mL"));
        tests.add(createTest("THY010", "Anti-Thyroglobulin Antibodies", "Antibodies against thyroglobulin protein", cat, TestType.THYROID, new BigDecimal("599"), false, null, 24, "<20 IU/mL", "IU/mL"));
        tests.add(createTest("THY011", "Thyroglobulin", "Protein for thyroid cancer monitoring", cat, TestType.THYROID, new BigDecimal("799"), false, null, 48, "1.5-38.5 ng/mL", "ng/mL"));
        tests.add(createTest("THY012", "TSH Receptor Antibodies (TRAb)", "Antibodies causing Graves disease", cat, TestType.THYROID, new BigDecimal("999"), false, null, 72, "<1.75 IU/L", "IU/L"));
        tests.add(createTest("THY013", "Thyroid Complete Panel", "TSH, Free T3, Free T4, TPO-Ab, TG-Ab", cat, TestType.THYROID, new BigDecimal("1299"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("THY014", "Calcitonin", "Hormone for medullary thyroid cancer screening", cat, TestType.THYROID, new BigDecimal("1199"), false, null, 72, "M:<10, F:<5 pg/mL", "pg/mL"));
        tests.add(createTest("THY015", "Free Thyroxine Index (FTI)", "Calculated index for thyroid status", cat, TestType.THYROID, new BigDecimal("299"), false, null, 24, "1.5-4.5", "index"));

        return tests;
    }

    // Helper method to create a LabTest
    private LabTest createTest(String code, String name, String desc, TestCategory category,
            TestType type, BigDecimal price, boolean fasting, Integer fastingHours,
            int reportHours, String normalRange, String unit) {
        return LabTest.builder()
            .testCode(code)
            .testName(name)
            .description(desc)
            .category(category)
            .testType(type)
            .price(price)
            .fastingRequired(fasting)
            .fastingHours(fastingHours)
            .reportTimeHours(reportHours)
            .normalRangeText(normalRange)
            .unit(unit)
            .isActive(true)
            .build();
    }

    private List<LabTest> createDiabetesTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("DIABETES");

        tests.add(createTest("DM001", "HbA1c (Glycated Hemoglobin)", "3-month average blood sugar level for diabetes monitoring", cat, TestType.DIABETES, new BigDecimal("499"), false, null, 24, "<5.7% normal", "%"));
        tests.add(createTest("DM002", "Fasting Plasma Glucose", "Blood sugar after 8-12 hour fasting", cat, TestType.DIABETES, new BigDecimal("99"), true, 12, 2, "70-100 mg/dL", "mg/dL"));
        tests.add(createTest("DM003", "Post Prandial Blood Sugar (PPBS)", "Blood sugar 2 hours after meal", cat, TestType.DIABETES, new BigDecimal("99"), false, null, 2, "<140 mg/dL", "mg/dL"));
        tests.add(createTest("DM004", "Glucose Tolerance Test (GTT)", "2-hour test for diabetes diagnosis", cat, TestType.DIABETES, new BigDecimal("399"), true, 12, 4, "<140 mg/dL at 2hr", "mg/dL"));
        tests.add(createTest("DM005", "Extended GTT (3-hour)", "Extended glucose tolerance for gestational diabetes", cat, TestType.DIABETES, new BigDecimal("599"), true, 12, 6, "See detailed report", "mg/dL"));
        tests.add(createTest("DM006", "Fasting Insulin", "Insulin level for insulin resistance assessment", cat, TestType.DIABETES, new BigDecimal("599"), true, 12, 24, "2.6-24.9 mcIU/mL", "mcIU/mL"));
        tests.add(createTest("DM007", "HOMA-IR (Insulin Resistance)", "Calculated insulin resistance index", cat, TestType.DIABETES, new BigDecimal("799"), true, 12, 24, "<2.5 normal", "index"));
        tests.add(createTest("DM008", "C-Peptide", "Marker of insulin production by pancreas", cat, TestType.DIABETES, new BigDecimal("899"), true, 12, 48, "0.5-2.0 ng/mL", "ng/mL"));
        tests.add(createTest("DM009", "Fructosamine", "2-3 week average blood sugar level", cat, TestType.DIABETES, new BigDecimal("499"), false, null, 24, "200-285 µmol/L", "µmol/L"));
        tests.add(createTest("DM010", "GAD65 Antibodies", "Autoantibodies for Type 1 diabetes", cat, TestType.DIABETES, new BigDecimal("1299"), false, null, 72, "<5 U/mL", "U/mL"));
        tests.add(createTest("DM011", "Islet Cell Antibodies (ICA)", "Antibodies indicating autoimmune diabetes", cat, TestType.DIABETES, new BigDecimal("1499"), false, null, 72, "Negative", "qualitative"));
        tests.add(createTest("DM012", "Insulin Antibodies", "Antibodies against insulin molecule", cat, TestType.DIABETES, new BigDecimal("999"), false, null, 48, "<0.4 U/mL", "U/mL"));
        tests.add(createTest("DM013", "Random Blood Sugar", "Blood sugar at any time of day", cat, TestType.DIABETES, new BigDecimal("79"), false, null, 2, "<200 mg/dL", "mg/dL"));
        tests.add(createTest("DM014", "Diabetes Panel Complete", "FBS, PPBS, HbA1c, Lipid Profile, KFT", cat, TestType.DIABETES, new BigDecimal("1499"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("DM015", "Proinsulin", "Insulin precursor for beta cell function", cat, TestType.DIABETES, new BigDecimal("1199"), true, 12, 72, "2-22 pmol/L", "pmol/L"));

        return tests;
    }

    private List<LabTest> createCardiacMarkerTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("CARDIAC");

        tests.add(createTest("CAR001", "Cardiac Profile Complete", "Troponin I, CK-MB, LDH, Myoglobin assessment", cat, TestType.CARDIAC_MARKERS, new BigDecimal("1499"), false, null, 4, "See detailed report", "multiple"));
        tests.add(createTest("CAR002", "Troponin I (High Sensitivity)", "Highly specific marker for heart muscle damage", cat, TestType.CARDIAC_MARKERS, new BigDecimal("799"), false, null, 2, "<0.04 ng/mL", "ng/mL"));
        tests.add(createTest("CAR003", "Troponin T", "Cardiac-specific protein for MI diagnosis", cat, TestType.CARDIAC_MARKERS, new BigDecimal("799"), false, null, 2, "<0.01 ng/mL", "ng/mL"));
        tests.add(createTest("CAR004", "CK-MB (Creatine Kinase MB)", "Heart-specific enzyme for cardiac damage", cat, TestType.CARDIAC_MARKERS, new BigDecimal("399"), false, null, 4, "<5% of total CK", "ng/mL"));
        tests.add(createTest("CAR005", "Total CK (Creatine Kinase)", "Enzyme from heart, brain, and skeletal muscle", cat, TestType.CARDIAC_MARKERS, new BigDecimal("249"), false, null, 4, "M:38-174, F:26-140 U/L", "U/L"));
        tests.add(createTest("CAR006", "LDH (Lactate Dehydrogenase)", "Enzyme elevated in tissue damage", cat, TestType.CARDIAC_MARKERS, new BigDecimal("199"), false, null, 4, "140-280 U/L", "U/L"));
        tests.add(createTest("CAR007", "LDH Isoenzymes", "LDH fractions for organ-specific damage", cat, TestType.CARDIAC_MARKERS, new BigDecimal("599"), false, null, 24, "See detailed report", "U/L"));
        tests.add(createTest("CAR008", "Myoglobin", "Early marker of muscle damage including heart", cat, TestType.CARDIAC_MARKERS, new BigDecimal("599"), false, null, 4, "M:<92, F:<76 ng/mL", "ng/mL"));
        tests.add(createTest("CAR009", "BNP (B-Type Natriuretic Peptide)", "Hormone released in heart failure", cat, TestType.CARDIAC_MARKERS, new BigDecimal("1299"), false, null, 4, "<100 pg/mL", "pg/mL"));
        tests.add(createTest("CAR010", "NT-proBNP", "Inactive form of BNP for heart failure assessment", cat, TestType.CARDIAC_MARKERS, new BigDecimal("1499"), false, null, 4, "<125 pg/mL (<75 yrs)", "pg/mL"));
        tests.add(createTest("CAR011", "D-Dimer", "Clot breakdown product for DVT/PE risk", cat, TestType.CARDIAC_MARKERS, new BigDecimal("699"), false, null, 4, "<500 ng/mL", "ng/mL"));
        tests.add(createTest("CAR012", "Homocysteine", "Amino acid linked to cardiovascular risk", cat, TestType.CARDIAC_MARKERS, new BigDecimal("799"), true, 12, 24, "5-15 µmol/L", "µmol/L"));
        tests.add(createTest("CAR013", "hs-CRP (High Sensitivity CRP)", "Inflammation marker for cardiovascular risk", cat, TestType.CARDIAC_MARKERS, new BigDecimal("599"), false, null, 4, "<1.0 mg/L low risk", "mg/L"));
        tests.add(createTest("CAR014", "Lipoprotein-PLA2 (Lp-PLA2)", "Enzyme marker for vulnerable plaque", cat, TestType.CARDIAC_MARKERS, new BigDecimal("1999"), true, 12, 72, "<200 ng/mL", "ng/mL"));
        tests.add(createTest("CAR015", "Fibrinogen", "Clotting protein elevated in CVD risk", cat, TestType.CARDIAC_MARKERS, new BigDecimal("499"), false, null, 24, "200-400 mg/dL", "mg/dL"));
        tests.add(createTest("CAR016", "Myeloperoxidase (MPO)", "Enzyme linked to atherosclerosis progression", cat, TestType.CARDIAC_MARKERS, new BigDecimal("1799"), false, null, 72, "<470 pmol/L", "pmol/L"));
        tests.add(createTest("CAR017", "Heart Risk Panel", "Lipid Profile, hs-CRP, Homocysteine, Lp(a)", cat, TestType.CARDIAC_MARKERS, new BigDecimal("2499"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("CAR018", "Apolipoprotein E Genotype", "Genetic test for cardiovascular and Alzheimer risk", cat, TestType.GENETIC, new BigDecimal("2999"), false, null, 120, "E3/E3 common", "genotype"));

        return tests;
    }

    private List<LabTest> createHormoneTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("HORMONES");

        // Male Hormones
        tests.add(createTest("HOR001", "Testosterone, Total", "Primary male sex hormone level", cat, TestType.HORMONES, new BigDecimal("599"), true, 8, 24, "M:270-1070, F:15-70 ng/dL", "ng/dL"));
        tests.add(createTest("HOR002", "Testosterone, Free", "Bioavailable testosterone in blood", cat, TestType.HORMONES, new BigDecimal("799"), true, 8, 48, "M:9-30, F:0.3-1.9 pg/mL", "pg/mL"));
        tests.add(createTest("HOR003", "SHBG (Sex Hormone Binding Globulin)", "Protein binding testosterone and estradiol", cat, TestType.HORMONES, new BigDecimal("699"), true, 8, 24, "M:10-57, F:18-144 nmol/L", "nmol/L"));
        tests.add(createTest("HOR004", "DHT (Dihydrotestosterone)", "Active testosterone metabolite", cat, TestType.HORMONES, new BigDecimal("999"), true, 8, 72, "M:30-85, F:4-22 ng/dL", "ng/dL"));

        // Female Hormones
        tests.add(createTest("HOR005", "Estradiol (E2)", "Primary female sex hormone", cat, TestType.HORMONES, new BigDecimal("599"), false, null, 24, "Varies by cycle phase", "pg/mL"));
        tests.add(createTest("HOR006", "Progesterone", "Hormone for menstrual cycle and pregnancy", cat, TestType.HORMONES, new BigDecimal("599"), false, null, 24, "Varies by cycle phase", "ng/mL"));
        tests.add(createTest("HOR007", "FSH (Follicle Stimulating Hormone)", "Hormone controlling reproduction", cat, TestType.HORMONES, new BigDecimal("499"), false, null, 24, "Varies by age/gender", "mIU/mL"));
        tests.add(createTest("HOR008", "LH (Luteinizing Hormone)", "Hormone triggering ovulation and testosterone", cat, TestType.HORMONES, new BigDecimal("499"), false, null, 24, "Varies by age/gender", "mIU/mL"));
        tests.add(createTest("HOR009", "Prolactin", "Hormone for milk production and reproduction", cat, TestType.HORMONES, new BigDecimal("599"), true, 8, 24, "M:2-18, F:2-29 ng/mL", "ng/mL"));
        tests.add(createTest("HOR010", "AMH (Anti-Mullerian Hormone)", "Ovarian reserve marker for fertility", cat, TestType.HORMONES, new BigDecimal("1499"), false, null, 72, "1.0-3.5 ng/mL optimal", "ng/mL"));

        // Adrenal Hormones
        tests.add(createTest("HOR011", "Cortisol, Morning", "Stress hormone for adrenal function", cat, TestType.HORMONES, new BigDecimal("499"), true, 8, 24, "6-23 mcg/dL (AM)", "mcg/dL"));
        tests.add(createTest("HOR012", "Cortisol, Evening", "Evening cortisol for diurnal variation", cat, TestType.HORMONES, new BigDecimal("499"), false, null, 24, "3-10 mcg/dL (PM)", "mcg/dL"));
        tests.add(createTest("HOR013", "DHEA-S", "Adrenal hormone precursor for sex hormones", cat, TestType.HORMONES, new BigDecimal("699"), true, 8, 24, "Varies by age/gender", "mcg/dL"));
        tests.add(createTest("HOR014", "ACTH", "Pituitary hormone controlling adrenal glands", cat, TestType.HORMONES, new BigDecimal("899"), true, 8, 24, "7-63 pg/mL (AM)", "pg/mL"));
        tests.add(createTest("HOR015", "Aldosterone", "Hormone regulating blood pressure and electrolytes", cat, TestType.HORMONES, new BigDecimal("999"), true, 8, 48, "4-31 ng/dL (upright)", "ng/dL"));
        tests.add(createTest("HOR016", "Renin Activity", "Enzyme for blood pressure regulation", cat, TestType.HORMONES, new BigDecimal("999"), true, 8, 48, "0.5-4.0 ng/mL/hr", "ng/mL/hr"));

        // Pituitary Hormones
        tests.add(createTest("HOR017", "Growth Hormone (GH)", "Hormone for growth and metabolism", cat, TestType.HORMONES, new BigDecimal("899"), true, 8, 24, "M:0-3, F:0-8 ng/mL", "ng/mL"));
        tests.add(createTest("HOR018", "IGF-1 (Somatomedin C)", "Mediator of growth hormone effects", cat, TestType.HORMONES, new BigDecimal("999"), true, 8, 48, "Varies by age", "ng/mL"));
        tests.add(createTest("HOR019", "IGFBP-3", "Binding protein for IGF-1", cat, TestType.HORMONES, new BigDecimal("1199"), false, null, 72, "Varies by age", "ng/mL"));

        // Pregnancy Hormones
        tests.add(createTest("HOR020", "Beta hCG (Quantitative)", "Pregnancy hormone level for dating", cat, TestType.HORMONES, new BigDecimal("499"), false, null, 4, "Varies by gestational age", "mIU/mL"));
        tests.add(createTest("HOR021", "Estriol (Free E3)", "Estrogen for pregnancy monitoring", cat, TestType.HORMONES, new BigDecimal("699"), false, null, 48, "Varies by gestational age", "ng/mL"));
        tests.add(createTest("HOR022", "Inhibin A", "Marker for pregnancy complications", cat, TestType.HORMONES, new BigDecimal("1199"), false, null, 72, "Varies by gestational age", "pg/mL"));
        tests.add(createTest("HOR023", "PAPP-A", "Pregnancy-associated protein for Down screening", cat, TestType.HORMONES, new BigDecimal("1499"), false, null, 72, "See MoM values", "mIU/mL"));

        // Complete Panels
        tests.add(createTest("HOR024", "Female Hormone Panel", "FSH, LH, Estradiol, Progesterone, Prolactin", cat, TestType.HORMONES, new BigDecimal("1999"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("HOR025", "Male Hormone Panel", "Total & Free Testosterone, SHBG, DHEA-S, PSA", cat, TestType.HORMONES, new BigDecimal("2499"), true, 8, 48, "See detailed report", "multiple"));
        tests.add(createTest("HOR026", "Fertility Panel - Female", "FSH, LH, AMH, Estradiol, Prolactin, TSH", cat, TestType.HORMONES, new BigDecimal("3499"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("HOR027", "PCOS Panel", "LH, FSH, Testosterone, DHEA-S, Insulin, Glucose", cat, TestType.HORMONES, new BigDecimal("2999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("HOR028", "Menopause Panel", "FSH, LH, Estradiol, TSH", cat, TestType.HORMONES, new BigDecimal("1499"), false, null, 48, "See detailed report", "multiple"));

        return tests;
    }
    private List<LabTest> createVitaminTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("VITAMINS");

        tests.add(createTest("VIT001", "Vitamin D, 25-Hydroxy", "Primary vitamin D metabolite for bone and immune health", cat, TestType.VITAMINS_MINERALS, new BigDecimal("799"), false, null, 24, "30-100 ng/mL optimal", "ng/mL"));
        tests.add(createTest("VIT002", "Vitamin D, 1,25-Dihydroxy", "Active form of vitamin D", cat, TestType.VITAMINS_MINERALS, new BigDecimal("1499"), false, null, 72, "18-72 pg/mL", "pg/mL"));
        tests.add(createTest("VIT003", "Vitamin B12 (Cobalamin)", "Essential vitamin for nerve and blood cell health", cat, TestType.VITAMINS_MINERALS, new BigDecimal("599"), false, null, 24, "200-900 pg/mL", "pg/mL"));
        tests.add(createTest("VIT004", "Folate (Folic Acid)", "B-vitamin essential for DNA synthesis and pregnancy", cat, TestType.VITAMINS_MINERALS, new BigDecimal("499"), false, null, 24, ">3.0 ng/mL", "ng/mL"));
        tests.add(createTest("VIT005", "Vitamin B1 (Thiamine)", "Essential for energy metabolism and nerve function", cat, TestType.VITAMINS_MINERALS, new BigDecimal("999"), false, null, 72, "70-180 nmol/L", "nmol/L"));
        tests.add(createTest("VIT006", "Vitamin B2 (Riboflavin)", "Essential for energy production and cell function", cat, TestType.VITAMINS_MINERALS, new BigDecimal("999"), false, null, 72, ">13.2 mcg/L", "mcg/L"));
        tests.add(createTest("VIT007", "Vitamin B6 (Pyridoxine)", "Essential for protein metabolism and brain function", cat, TestType.VITAMINS_MINERALS, new BigDecimal("999"), false, null, 72, "5-50 mcg/L", "mcg/L"));
        tests.add(createTest("VIT008", "Vitamin A (Retinol)", "Essential for vision, immunity, and skin health", cat, TestType.VITAMINS_MINERALS, new BigDecimal("1199"), true, 12, 72, "38-98 mcg/dL", "mcg/dL"));
        tests.add(createTest("VIT009", "Vitamin E (Tocopherol)", "Antioxidant vitamin protecting cell membranes", cat, TestType.VITAMINS_MINERALS, new BigDecimal("1199"), true, 12, 72, "5.5-17 mg/L", "mg/L"));
        tests.add(createTest("VIT010", "Vitamin C (Ascorbic Acid)", "Antioxidant essential for collagen and immunity", cat, TestType.VITAMINS_MINERALS, new BigDecimal("899"), false, null, 48, "0.4-2.0 mg/dL", "mg/dL"));
        tests.add(createTest("VIT011", "Vitamin K", "Essential for blood clotting and bone health", cat, TestType.VITAMINS_MINERALS, new BigDecimal("1499"), true, 12, 72, "0.1-2.2 ng/mL", "ng/mL"));
        tests.add(createTest("VIT012", "Iron, Serum", "Essential mineral for oxygen transport", cat, TestType.VITAMINS_MINERALS, new BigDecimal("199"), true, 12, 4, "M:65-175, F:50-170 mcg/dL", "mcg/dL"));
        tests.add(createTest("VIT013", "Ferritin", "Iron storage protein indicating body iron reserves", cat, TestType.VITAMINS_MINERALS, new BigDecimal("399"), false, null, 24, "M:30-400, F:15-150 ng/mL", "ng/mL"));
        tests.add(createTest("VIT014", "TIBC (Total Iron Binding Capacity)", "Measure of transferrin available for iron binding", cat, TestType.VITAMINS_MINERALS, new BigDecimal("299"), true, 12, 24, "250-370 mcg/dL", "mcg/dL"));
        tests.add(createTest("VIT015", "Transferrin Saturation", "Percentage of transferrin bound to iron", cat, TestType.VITAMINS_MINERALS, new BigDecimal("349"), true, 12, 24, "20-50%", "%"));
        tests.add(createTest("VIT016", "Iron Studies Panel", "Iron, Ferritin, TIBC, Transferrin Saturation", cat, TestType.VITAMINS_MINERALS, new BigDecimal("799"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("VIT017", "Zinc, Serum", "Essential mineral for immunity and wound healing", cat, TestType.VITAMINS_MINERALS, new BigDecimal("599"), true, 12, 48, "60-120 mcg/dL", "mcg/dL"));
        tests.add(createTest("VIT018", "Copper, Serum", "Essential mineral for enzyme function", cat, TestType.VITAMINS_MINERALS, new BigDecimal("699"), false, null, 48, "70-140 mcg/dL", "mcg/dL"));
        tests.add(createTest("VIT019", "Selenium, Serum", "Essential trace mineral and antioxidant", cat, TestType.VITAMINS_MINERALS, new BigDecimal("999"), false, null, 72, "70-150 ng/mL", "ng/mL"));
        tests.add(createTest("VIT020", "Manganese, Serum", "Trace mineral for bone and enzyme health", cat, TestType.VITAMINS_MINERALS, new BigDecimal("999"), false, null, 72, "0.4-1.1 mcg/L", "mcg/L"));
        tests.add(createTest("VIT021", "Chromium, Serum", "Trace mineral for glucose metabolism", cat, TestType.VITAMINS_MINERALS, new BigDecimal("1199"), false, null, 72, "0.05-0.5 mcg/L", "mcg/L"));
        tests.add(createTest("VIT022", "Iodine, Urine", "Essential mineral for thyroid function", cat, TestType.VITAMINS_MINERALS, new BigDecimal("799"), false, null, 72, "100-199 mcg/L adequate", "mcg/L"));
        tests.add(createTest("VIT023", "Methylmalonic Acid (MMA)", "Marker for B12 deficiency at cellular level", cat, TestType.VITAMINS_MINERALS, new BigDecimal("1299"), false, null, 72, "<0.4 µmol/L", "µmol/L"));
        tests.add(createTest("VIT024", "Homocysteine", "Marker for B12, folate, B6 status", cat, TestType.VITAMINS_MINERALS, new BigDecimal("799"), true, 12, 24, "5-15 µmol/L", "µmol/L"));
        tests.add(createTest("VIT025", "Comprehensive Vitamin Panel", "Vitamin A, B12, D, E, Folate, Iron Studies", cat, TestType.VITAMINS_MINERALS, new BigDecimal("3999"), true, 12, 72, "See detailed report", "multiple"));

        return tests;
    }

    private List<LabTest> createAllergyTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("ALLERGY");

        tests.add(createTest("ALG001", "Total IgE", "Overall allergy tendency marker", cat, TestType.ALLERGY, new BigDecimal("499"), false, null, 24, "<100 IU/mL normal", "IU/mL"));
        tests.add(createTest("ALG002", "Food Allergy Panel - Basic (8 foods)", "Milk, Egg, Wheat, Soy, Peanut, Tree Nuts, Fish, Shellfish", cat, TestType.ALLERGY, new BigDecimal("1999"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG003", "Food Allergy Panel - Comprehensive (20 foods)", "Extended panel including common food allergens", cat, TestType.ALLERGY, new BigDecimal("3999"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG004", "Vegetarian Food Allergy Panel", "Plant-based food allergens including legumes and grains", cat, TestType.ALLERGY, new BigDecimal("2499"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG005", "Inhalant Allergy Panel - Regional", "Dust mites, mold, pet dander, pollens regional mix", cat, TestType.ALLERGY, new BigDecimal("2499"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG006", "Dust Mite Allergy IgE", "Specific IgE to house dust mites", cat, TestType.ALLERGY, new BigDecimal("599"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG007", "Cat Dander IgE", "Specific IgE to cat allergens", cat, TestType.ALLERGY, new BigDecimal("599"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG008", "Dog Dander IgE", "Specific IgE to dog allergens", cat, TestType.ALLERGY, new BigDecimal("599"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG009", "Mold Panel IgE", "Common indoor and outdoor molds", cat, TestType.ALLERGY, new BigDecimal("1499"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG010", "Grass Pollen IgE", "Timothy grass and mixed grass pollens", cat, TestType.ALLERGY, new BigDecimal("799"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG011", "Tree Pollen Panel IgE", "Oak, birch, cedar, and common tree pollens", cat, TestType.ALLERGY, new BigDecimal("1299"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG012", "Weed Pollen Panel IgE", "Ragweed, pigweed, and common weed pollens", cat, TestType.ALLERGY, new BigDecimal("1299"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG013", "Milk IgE (Cow's)", "Specific IgE to cow's milk proteins", cat, TestType.ALLERGY, new BigDecimal("599"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG014", "Egg White IgE", "Specific IgE to egg white proteins", cat, TestType.ALLERGY, new BigDecimal("599"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG015", "Peanut IgE", "Specific IgE to peanut allergens", cat, TestType.ALLERGY, new BigDecimal("599"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG016", "Wheat IgE", "Specific IgE to wheat proteins", cat, TestType.ALLERGY, new BigDecimal("599"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG017", "Soy IgE", "Specific IgE to soy proteins", cat, TestType.ALLERGY, new BigDecimal("599"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG018", "Shellfish Panel IgE", "Shrimp, crab, lobster allergens", cat, TestType.ALLERGY, new BigDecimal("1299"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG019", "Tree Nut Panel IgE", "Almond, cashew, walnut, hazelnut allergens", cat, TestType.ALLERGY, new BigDecimal("1499"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG020", "Drug Allergy Panel - Antibiotics", "Penicillin, amoxicillin, cephalosporin IgE", cat, TestType.ALLERGY, new BigDecimal("1999"), false, null, 72, "See detailed report", "kU/L"));
        tests.add(createTest("ALG021", "Latex IgE", "Specific IgE to natural rubber latex", cat, TestType.ALLERGY, new BigDecimal("799"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG022", "Bee Venom IgE", "Specific IgE to honeybee venom", cat, TestType.ALLERGY, new BigDecimal("799"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG023", "Wasp Venom IgE", "Specific IgE to wasp venom", cat, TestType.ALLERGY, new BigDecimal("799"), false, null, 48, "<0.35 kU/L negative", "kU/L"));
        tests.add(createTest("ALG024", "Comprehensive Allergy Panel (40 allergens)", "Food, inhalant, and environmental allergens", cat, TestType.ALLERGY, new BigDecimal("5999"), false, null, 96, "See detailed report", "kU/L"));
        tests.add(createTest("ALG025", "Eosinophil Cationic Protein (ECP)", "Marker for eosinophil activation in allergy", cat, TestType.ALLERGY, new BigDecimal("999"), false, null, 48, "<13.3 mcg/L", "mcg/L"));

        return tests;
    }

    private List<LabTest> createInfectionTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("INFECTIOUS");

        // HIV Tests
        tests.add(createTest("INF001", "HIV 1/2 Antibody + p24 Antigen (4th Gen)", "Comprehensive HIV screening test", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("599"), false, null, 4, "Non-reactive", "qualitative"));
        tests.add(createTest("INF002", "HIV RNA PCR (Viral Load)", "Quantitative HIV viral load measurement", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("3999"), false, null, 72, "<20 copies/mL", "copies/mL"));
        tests.add(createTest("INF003", "HIV 1 Western Blot", "Confirmatory test for HIV-1 antibodies", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("1999"), false, null, 72, "Negative", "qualitative"));

        // Hepatitis Tests
        tests.add(createTest("INF004", "Hepatitis B Surface Antigen (HBsAg)", "Active Hepatitis B infection marker", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("399"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("INF005", "Hepatitis B Surface Antibody (Anti-HBs)", "Immunity to Hepatitis B marker", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("399"), false, null, 24, ">10 mIU/mL immune", "mIU/mL"));
        tests.add(createTest("INF006", "Hepatitis B Core Antibody (Anti-HBc)", "Past or current Hepatitis B exposure", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("499"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("INF007", "Hepatitis B Panel Complete", "HBsAg, Anti-HBs, Anti-HBc Total and IgM", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("1299"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("INF008", "Hepatitis B DNA PCR (Viral Load)", "Quantitative HBV viral load", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("3499"), false, null, 72, "<10 IU/mL", "IU/mL"));
        tests.add(createTest("INF009", "Hepatitis C Antibody", "Screening test for Hepatitis C exposure", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("599"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("INF010", "Hepatitis C RNA PCR (Viral Load)", "Quantitative HCV viral load", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("4499"), false, null, 72, "<15 IU/mL", "IU/mL"));
        tests.add(createTest("INF011", "Hepatitis C Genotype", "HCV genotype for treatment guidance", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("5999"), false, null, 120, "See report", "genotype"));
        tests.add(createTest("INF012", "Hepatitis A IgM Antibody", "Acute Hepatitis A infection marker", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("499"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("INF013", "Hepatitis A Total Antibody", "Immunity or past Hepatitis A infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("499"), false, null, 24, "Reactive if immune", "qualitative"));
        tests.add(createTest("INF014", "Hepatitis E IgM Antibody", "Acute Hepatitis E infection marker", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("799"), false, null, 48, "Non-reactive", "qualitative"));

        // STD Panel
        tests.add(createTest("INF015", "Syphilis RPR/VDRL", "Screening test for syphilis", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("299"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("INF016", "Syphilis TPHA/TPPA", "Confirmatory test for syphilis", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("499"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("INF017", "Chlamydia trachomatis PCR", "Molecular test for chlamydia infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("899"), false, null, 48, "Not detected", "qualitative"));
        tests.add(createTest("INF018", "Gonorrhea (Neisseria) PCR", "Molecular test for gonorrhea infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("899"), false, null, 48, "Not detected", "qualitative"));
        tests.add(createTest("INF019", "Herpes Simplex 1 IgG", "HSV-1 antibody indicating past exposure", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("699"), false, null, 48, "<0.9 index negative", "index"));
        tests.add(createTest("INF020", "Herpes Simplex 2 IgG", "HSV-2 antibody indicating past exposure", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("699"), false, null, 48, "<0.9 index negative", "index"));
        tests.add(createTest("INF021", "HPV DNA High Risk Panel", "Detection of high-risk HPV types", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("1999"), false, null, 72, "Not detected", "qualitative"));
        tests.add(createTest("INF022", "STD Panel Complete", "HIV, HBV, HCV, Syphilis, Chlamydia, Gonorrhea, HSV", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("4999"), false, null, 72, "See detailed report", "multiple"));

        // COVID-19 Tests
        tests.add(createTest("INF023", "COVID-19 RT-PCR", "Gold standard molecular test for active infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("999"), false, null, 24, "Not detected", "qualitative"));
        tests.add(createTest("INF024", "COVID-19 Rapid Antigen", "Quick test for active infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("399"), false, null, 1, "Negative", "qualitative"));
        tests.add(createTest("INF025", "COVID-19 Antibody IgG", "Past infection or vaccination response", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("599"), false, null, 24, "See report", "AU/mL"));

        // Other Infections
        tests.add(createTest("INF026", "Dengue NS1 Antigen", "Early marker for dengue infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("599"), false, null, 4, "Negative", "qualitative"));
        tests.add(createTest("INF027", "Dengue IgM and IgG", "Antibodies for dengue infection staging", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("799"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("INF028", "Malaria Parasite Detection", "Blood smear examination for malaria", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("299"), false, null, 4, "Not seen", "qualitative"));
        tests.add(createTest("INF029", "Malaria Antigen (Rapid)", "Quick test for plasmodium antigens", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("399"), false, null, 1, "Negative", "qualitative"));
        tests.add(createTest("INF030", "Typhoid (Widal) Test", "Agglutination test for typhoid antibodies", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("299"), false, null, 24, "<1:80 negative", "titer"));
        tests.add(createTest("INF031", "Typhidot IgM", "Rapid test for acute typhoid fever", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("499"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("INF032", "Tuberculosis QuantiFERON Gold", "Blood test for TB infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("2999"), false, null, 72, "Negative", "IU/mL"));
        tests.add(createTest("INF033", "Tuberculosis PCR (GeneXpert)", "Molecular test for active TB", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("1999"), false, null, 48, "Not detected", "qualitative"));
        tests.add(createTest("INF034", "EBV (Mono) Panel", "Epstein-Barr virus antibody panel", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("1499"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("INF035", "CMV IgG and IgM", "Cytomegalovirus antibody status", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("999"), false, null, 48, "See detailed report", "AU/mL"));

        // Additional Infection Tests
        tests.add(createTest("INF036", "Chikungunya IgM", "Acute chikungunya infection marker", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("699"), false, null, 48, "Negative", "qualitative"));
        tests.add(createTest("INF037", "Zika Virus IgM", "Acute Zika infection marker", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("1299"), false, null, 72, "Negative", "qualitative"));
        tests.add(createTest("INF038", "Japanese Encephalitis IgM", "JE virus infection marker", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("999"), false, null, 72, "Negative", "qualitative"));
        tests.add(createTest("INF039", "Leptospira IgM", "Leptospirosis screening", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("799"), false, null, 48, "Negative", "qualitative"));
        tests.add(createTest("INF040", "Scrub Typhus IgM", "Orientia tsutsugamushi infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("799"), false, null, 48, "Negative", "qualitative"));
        tests.add(createTest("INF041", "Brucella Antibodies", "Brucellosis screening", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("699"), false, null, 48, "Negative (<1:80)", "titer"));
        tests.add(createTest("INF042", "Toxoplasma IgG and IgM", "Toxoplasmosis screening", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("999"), false, null, 48, "See detailed report", "IU/mL"));
        tests.add(createTest("INF043", "Rubella IgG and IgM", "German measles immunity and infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("699"), false, null, 48, "IgG >10 IU/mL immune", "IU/mL"));
        tests.add(createTest("INF044", "Measles IgG and IgM", "Rubeola immunity and infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("699"), false, null, 48, "See detailed report", "AU/mL"));
        tests.add(createTest("INF045", "Mumps IgG and IgM", "Mumps immunity and infection status", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("699"), false, null, 48, "See detailed report", "AU/mL"));
        tests.add(createTest("INF046", "Varicella Zoster IgG", "Chickenpox immunity status", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("699"), false, null, 48, "Positive = immune", "AU/mL"));
        tests.add(createTest("INF047", "Parvovirus B19 IgG/IgM", "Fifth disease infection status", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("999"), false, null, 72, "See detailed report", "AU/mL"));
        tests.add(createTest("INF048", "H. pylori Breath Test", "Urea breath test for H. pylori", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("799"), false, null, 2, "Negative", "qualitative"));
        tests.add(createTest("INF049", "H. pylori IgG Antibody", "Past or present H. pylori exposure", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("499"), false, null, 24, "Negative", "AU/mL"));
        tests.add(createTest("INF050", "TORCH Panel Complete", "Toxoplasma, Rubella, CMV, HSV screening", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("2499"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("INF051", "Influenza A/B PCR", "Flu virus molecular detection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("999"), false, null, 24, "Not detected", "qualitative"));
        tests.add(createTest("INF052", "RSV (Respiratory Syncytial Virus)", "RSV infection detection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("799"), false, null, 24, "Not detected", "qualitative"));
        tests.add(createTest("INF053", "Respiratory Panel PCR", "Multiple respiratory pathogen detection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("2999"), false, null, 48, "See detailed report", "qualitative"));
        tests.add(createTest("INF054", "Legionella Urinary Antigen", "Legionnaires disease screening", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("999"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("INF055", "Strep A Rapid Test", "Group A streptococcus detection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("299"), false, null, 1, "Negative", "qualitative"));
        tests.add(createTest("INF056", "ASO Titer (Antistreptolysin O)", "Post-streptococcal infection marker", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("399"), false, null, 24, "<200 IU/mL", "IU/mL"));
        tests.add(createTest("INF057", "Anti-DNase B", "Streptococcal infection marker", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("499"), false, null, 48, "<170 U/mL", "U/mL"));
        tests.add(createTest("INF058", "Mycoplasma IgG/IgM", "Atypical pneumonia pathogen", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("799"), false, null, 48, "See detailed report", "AU/mL"));
        tests.add(createTest("INF059", "Chlamydia pneumoniae IgG/IgM", "Respiratory chlamydia infection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("899"), false, null, 72, "See detailed report", "AU/mL"));
        tests.add(createTest("INF060", "Bordetella pertussis PCR", "Whooping cough molecular detection", cat, TestType.INFECTIOUS_DISEASE, new BigDecimal("1299"), false, null, 48, "Not detected", "qualitative"));

        return tests;
    }

    private List<LabTest> createAutoImmuneTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("AUTOIMMUNE");

        tests.add(createTest("AUT001", "ANA (Antinuclear Antibody) Screen", "Screening test for autoimmune disorders", cat, TestType.AUTOIMMUNE, new BigDecimal("799"), false, null, 48, "Negative", "titer"));
        tests.add(createTest("AUT002", "ANA with Reflex to Pattern", "ANA with pattern identification if positive", cat, TestType.AUTOIMMUNE, new BigDecimal("1299"), false, null, 72, "Negative", "titer"));
        tests.add(createTest("AUT003", "Anti-dsDNA Antibody", "Specific marker for SLE (Lupus)", cat, TestType.AUTOIMMUNE, new BigDecimal("999"), false, null, 48, "<30 IU/mL", "IU/mL"));
        tests.add(createTest("AUT004", "Anti-Smith (Anti-Sm) Antibody", "Highly specific for SLE", cat, TestType.AUTOIMMUNE, new BigDecimal("999"), false, null, 72, "Negative", "qualitative"));
        tests.add(createTest("AUT005", "Anti-SSA/Ro Antibody", "Marker for Sjogren syndrome and SLE", cat, TestType.AUTOIMMUNE, new BigDecimal("899"), false, null, 48, "Negative", "U/mL"));
        tests.add(createTest("AUT006", "Anti-SSB/La Antibody", "Marker for Sjogren syndrome", cat, TestType.AUTOIMMUNE, new BigDecimal("899"), false, null, 48, "Negative", "U/mL"));
        tests.add(createTest("AUT007", "Rheumatoid Factor (RF)", "Marker for rheumatoid arthritis", cat, TestType.AUTOIMMUNE, new BigDecimal("399"), false, null, 24, "<14 IU/mL", "IU/mL"));
        tests.add(createTest("AUT008", "Anti-CCP (Cyclic Citrullinated Peptide)", "Specific marker for rheumatoid arthritis", cat, TestType.AUTOIMMUNE, new BigDecimal("999"), false, null, 48, "<20 U/mL", "U/mL"));
        tests.add(createTest("AUT009", "RA Panel (RF + Anti-CCP)", "Complete rheumatoid arthritis panel", cat, TestType.AUTOIMMUNE, new BigDecimal("1299"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("AUT010", "Complement C3", "Complement protein consumed in autoimmune disorders", cat, TestType.AUTOIMMUNE, new BigDecimal("499"), false, null, 24, "90-180 mg/dL", "mg/dL"));
        tests.add(createTest("AUT011", "Complement C4", "Complement protein indicating immune activation", cat, TestType.AUTOIMMUNE, new BigDecimal("499"), false, null, 24, "16-48 mg/dL", "mg/dL"));
        tests.add(createTest("AUT012", "CH50 (Total Complement)", "Overall complement pathway function", cat, TestType.AUTOIMMUNE, new BigDecimal("699"), false, null, 48, "60-144 U/mL", "U/mL"));
        tests.add(createTest("AUT013", "Anti-Cardiolipin Antibodies", "Markers for antiphospholipid syndrome", cat, TestType.AUTOIMMUNE, new BigDecimal("1199"), false, null, 72, "Negative", "GPL/MPL"));
        tests.add(createTest("AUT014", "Lupus Anticoagulant", "Clotting abnormality in lupus/APS", cat, TestType.AUTOIMMUNE, new BigDecimal("1499"), false, null, 48, "Negative", "ratio"));
        tests.add(createTest("AUT015", "Beta-2 Glycoprotein I Antibodies", "Marker for antiphospholipid syndrome", cat, TestType.AUTOIMMUNE, new BigDecimal("1199"), false, null, 72, "<20 U/mL", "U/mL"));
        tests.add(createTest("AUT016", "APS (Antiphospholipid) Panel", "Complete APS workup panel", cat, TestType.AUTOIMMUNE, new BigDecimal("3499"), false, null, 96, "See detailed report", "multiple"));
        tests.add(createTest("AUT017", "Anti-Histone Antibody", "Marker for drug-induced lupus", cat, TestType.AUTOIMMUNE, new BigDecimal("999"), false, null, 72, "Negative", "U"));
        tests.add(createTest("AUT018", "Anti-RNP Antibody", "Marker for mixed connective tissue disease", cat, TestType.AUTOIMMUNE, new BigDecimal("899"), false, null, 48, "Negative", "U/mL"));
        tests.add(createTest("AUT019", "Anti-Jo1 Antibody", "Marker for polymyositis/dermatomyositis", cat, TestType.AUTOIMMUNE, new BigDecimal("999"), false, null, 72, "Negative", "U/mL"));
        tests.add(createTest("AUT020", "Anti-Scl-70 Antibody", "Marker for systemic sclerosis", cat, TestType.AUTOIMMUNE, new BigDecimal("999"), false, null, 72, "Negative", "U/mL"));
        tests.add(createTest("AUT021", "Anti-Centromere Antibody", "Marker for limited scleroderma (CREST)", cat, TestType.AUTOIMMUNE, new BigDecimal("999"), false, null, 72, "Negative", "U/mL"));
        tests.add(createTest("AUT022", "ANCA Panel (pANCA, cANCA)", "Markers for vasculitis", cat, TestType.AUTOIMMUNE, new BigDecimal("1499"), false, null, 72, "Negative", "titer"));
        tests.add(createTest("AUT023", "Anti-MPO Antibody", "Specific test for microscopic polyangiitis", cat, TestType.AUTOIMMUNE, new BigDecimal("999"), false, null, 72, "<20 U/mL", "U/mL"));
        tests.add(createTest("AUT024", "Anti-PR3 Antibody", "Specific test for granulomatosis with polyangiitis", cat, TestType.AUTOIMMUNE, new BigDecimal("999"), false, null, 72, "<20 U/mL", "U/mL"));
        tests.add(createTest("AUT025", "Autoimmune Panel Comprehensive", "ANA, dsDNA, ENA Panel, RF, CCP, Complements", cat, TestType.AUTOIMMUNE, new BigDecimal("5999"), false, null, 120, "See detailed report", "multiple"));

        return tests;
    }

    private List<LabTest> createTumorMarkerTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("TUMOR_MARKERS");

        tests.add(createTest("TUM001", "PSA, Total", "Prostate cancer screening and monitoring", cat, TestType.TUMOR_MARKERS, new BigDecimal("499"), false, null, 24, "<4.0 ng/mL", "ng/mL"));
        tests.add(createTest("TUM002", "PSA, Free", "Free PSA for prostate cancer risk stratification", cat, TestType.TUMOR_MARKERS, new BigDecimal("699"), false, null, 24, ">25% suggests benign", "%"));
        tests.add(createTest("TUM003", "PSA Ratio (Free/Total)", "Calculated ratio for prostate cancer risk", cat, TestType.TUMOR_MARKERS, new BigDecimal("999"), false, null, 24, ">25% favors benign", "ratio"));
        tests.add(createTest("TUM004", "CEA (Carcinoembryonic Antigen)", "Marker for colorectal and other cancers", cat, TestType.TUMOR_MARKERS, new BigDecimal("599"), false, null, 24, "<3.0 ng/mL non-smoker", "ng/mL"));
        tests.add(createTest("TUM005", "CA 125", "Ovarian cancer marker and monitoring", cat, TestType.TUMOR_MARKERS, new BigDecimal("799"), false, null, 48, "<35 U/mL", "U/mL"));
        tests.add(createTest("TUM006", "CA 19-9", "Pancreatic and biliary cancer marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("799"), false, null, 48, "<37 U/mL", "U/mL"));
        tests.add(createTest("TUM007", "CA 15-3", "Breast cancer monitoring marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("799"), false, null, 48, "<30 U/mL", "U/mL"));
        tests.add(createTest("TUM008", "AFP (Alpha-Fetoprotein)", "Liver cancer and germ cell tumor marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("599"), false, null, 24, "<10 ng/mL", "ng/mL"));
        tests.add(createTest("TUM009", "AFP-L3%", "Specific fraction for hepatocellular carcinoma", cat, TestType.TUMOR_MARKERS, new BigDecimal("1999"), false, null, 72, "<10%", "%"));
        tests.add(createTest("TUM010", "Beta-hCG (Tumor Marker)", "Germ cell tumor and choriocarcinoma marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("499"), false, null, 24, "<5 mIU/mL (non-pregnant)", "mIU/mL"));
        tests.add(createTest("TUM011", "LDH (Tumor Marker)", "Non-specific tumor marker for various cancers", cat, TestType.TUMOR_MARKERS, new BigDecimal("199"), false, null, 24, "140-280 U/L", "U/L"));
        tests.add(createTest("TUM012", "HE4 (Human Epididymis Protein 4)", "Ovarian cancer marker complementing CA-125", cat, TestType.TUMOR_MARKERS, new BigDecimal("1299"), false, null, 72, "Varies by age/menopause", "pmol/L"));
        tests.add(createTest("TUM013", "ROMA Score (HE4 + CA125)", "Calculated ovarian cancer risk", cat, TestType.TUMOR_MARKERS, new BigDecimal("1999"), false, null, 72, "See report", "%"));
        tests.add(createTest("TUM014", "NSE (Neuron Specific Enolase)", "Small cell lung cancer and neuroblastoma marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("999"), false, null, 48, "<12.5 ng/mL", "ng/mL"));
        tests.add(createTest("TUM015", "Chromogranin A", "Neuroendocrine tumor marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("1299"), false, null, 72, "<100 ng/mL", "ng/mL"));
        tests.add(createTest("TUM016", "Cyfra 21-1", "Non-small cell lung cancer marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("999"), false, null, 48, "<3.3 ng/mL", "ng/mL"));
        tests.add(createTest("TUM017", "SCC Antigen", "Squamous cell carcinoma marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("899"), false, null, 48, "<1.5 ng/mL", "ng/mL"));
        tests.add(createTest("TUM018", "Thyroglobulin", "Thyroid cancer monitoring marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("799"), false, null, 48, "<55 ng/mL", "ng/mL"));
        tests.add(createTest("TUM019", "Calcitonin", "Medullary thyroid cancer marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("1199"), false, null, 72, "M:<10, F:<5 pg/mL", "pg/mL"));
        tests.add(createTest("TUM020", "S-100 Protein", "Melanoma and brain tumor marker", cat, TestType.TUMOR_MARKERS, new BigDecimal("1499"), false, null, 72, "<0.15 mcg/L", "mcg/L"));
        tests.add(createTest("TUM021", "Cancer Panel - Male", "PSA, CEA, AFP, CA19-9", cat, TestType.TUMOR_MARKERS, new BigDecimal("2499"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("TUM022", "Cancer Panel - Female", "CA125, CA15-3, CEA, AFP", cat, TestType.TUMOR_MARKERS, new BigDecimal("2499"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("TUM023", "Cancer Panel Comprehensive", "All major tumor markers assessment", cat, TestType.TUMOR_MARKERS, new BigDecimal("4999"), false, null, 72, "See detailed report", "multiple"));

        return tests;
    }

    private List<LabTest> createCoagulationTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("BLOOD_TESTS");

        tests.add(createTest("COA001", "Prothrombin Time (PT)", "Measures extrinsic clotting pathway", cat, TestType.COAGULATION, new BigDecimal("299"), false, null, 4, "11-13.5 seconds", "seconds"));
        tests.add(createTest("COA002", "INR (International Normalized Ratio)", "Standardized PT for warfarin monitoring", cat, TestType.COAGULATION, new BigDecimal("299"), false, null, 4, "0.8-1.1 normal", "ratio"));
        tests.add(createTest("COA003", "aPTT (Activated Partial Thromboplastin Time)", "Intrinsic pathway and heparin monitoring", cat, TestType.COAGULATION, new BigDecimal("349"), false, null, 4, "25-35 seconds", "seconds"));
        tests.add(createTest("COA004", "Thrombin Time", "Final common pathway of coagulation", cat, TestType.COAGULATION, new BigDecimal("399"), false, null, 24, "14-19 seconds", "seconds"));
        tests.add(createTest("COA005", "Fibrinogen", "Clotting factor and acute phase reactant", cat, TestType.COAGULATION, new BigDecimal("499"), false, null, 24, "200-400 mg/dL", "mg/dL"));
        tests.add(createTest("COA006", "D-Dimer", "Clot breakdown product for DVT/PE", cat, TestType.COAGULATION, new BigDecimal("699"), false, null, 4, "<500 ng/mL", "ng/mL"));
        tests.add(createTest("COA007", "Bleeding Time", "Platelet function screening test", cat, TestType.COAGULATION, new BigDecimal("199"), false, null, 2, "2-7 minutes", "minutes"));
        tests.add(createTest("COA008", "Clotting Time", "Overall coagulation screening", cat, TestType.COAGULATION, new BigDecimal("149"), false, null, 2, "5-15 minutes", "minutes"));
        tests.add(createTest("COA009", "Factor VIII Activity", "Hemophilia A diagnosis", cat, TestType.COAGULATION, new BigDecimal("1499"), false, null, 72, "50-150%", "%"));
        tests.add(createTest("COA010", "Factor IX Activity", "Hemophilia B diagnosis", cat, TestType.COAGULATION, new BigDecimal("1499"), false, null, 72, "50-150%", "%"));
        tests.add(createTest("COA011", "von Willebrand Factor Antigen", "vWD diagnosis - factor level", cat, TestType.COAGULATION, new BigDecimal("1299"), false, null, 72, "50-200%", "%"));
        tests.add(createTest("COA012", "von Willebrand Factor Activity", "vWD diagnosis - factor function", cat, TestType.COAGULATION, new BigDecimal("1499"), false, null, 72, "50-150%", "%"));
        tests.add(createTest("COA013", "Protein C Activity", "Inherited thrombophilia screening", cat, TestType.COAGULATION, new BigDecimal("1799"), false, null, 72, "70-140%", "%"));
        tests.add(createTest("COA014", "Protein S Activity", "Inherited thrombophilia screening", cat, TestType.COAGULATION, new BigDecimal("1799"), false, null, 72, "60-140%", "%"));
        tests.add(createTest("COA015", "Antithrombin III Activity", "Natural anticoagulant level", cat, TestType.COAGULATION, new BigDecimal("1499"), false, null, 72, "80-120%", "%"));
        tests.add(createTest("COA016", "Factor V Leiden Mutation", "Genetic test for thrombophilia", cat, TestType.COAGULATION, new BigDecimal("2999"), false, null, 120, "Negative", "qualitative"));
        tests.add(createTest("COA017", "Prothrombin Gene Mutation (G20210A)", "Genetic test for thrombophilia", cat, TestType.COAGULATION, new BigDecimal("2999"), false, null, 120, "Negative", "qualitative"));
        tests.add(createTest("COA018", "Thrombophilia Panel", "Complete inherited clotting disorder workup", cat, TestType.COAGULATION, new BigDecimal("7999"), false, null, 120, "See detailed report", "multiple"));
        tests.add(createTest("COA019", "Platelet Function Analysis (PFA-100)", "Platelet function screening test", cat, TestType.COAGULATION, new BigDecimal("1299"), false, null, 24, "See report", "seconds"));
        tests.add(createTest("COA020", "Complete Coagulation Panel", "PT, aPTT, Fibrinogen, D-Dimer, Platelet Count", cat, TestType.COAGULATION, new BigDecimal("1499"), false, null, 24, "See detailed report", "multiple"));

        return tests;
    }
    // ==================== URINE TESTS ====================

    private List<LabTest> createUrineTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("URINE_TESTS");

        tests.add(createTest("URI001", "Routine Urinalysis (Complete)", "Physical, chemical, and microscopic urine examination", cat, TestType.URINE, new BigDecimal("199"), false, null, 4, "See detailed report", "multiple"));
        tests.add(createTest("URI002", "Urine Physical Examination", "Color, clarity, specific gravity assessment", cat, TestType.URINE, new BigDecimal("99"), false, null, 2, "Yellow, clear, 1.005-1.030", "multiple"));
        tests.add(createTest("URI003", "Urine Chemical Analysis", "pH, protein, glucose, ketones, blood, bilirubin", cat, TestType.URINE, new BigDecimal("149"), false, null, 2, "All negative/normal", "multiple"));
        tests.add(createTest("URI004", "Urine Microscopy", "RBC, WBC, epithelial cells, casts, crystals", cat, TestType.URINE, new BigDecimal("149"), false, null, 4, "See detailed report", "cells/hpf"));
        tests.add(createTest("URI005", "Urine Protein", "Total protein in spot urine sample", cat, TestType.URINE, new BigDecimal("99"), false, null, 2, "Negative", "mg/dL"));
        tests.add(createTest("URI006", "Urine Glucose", "Sugar in urine for diabetes screening", cat, TestType.URINE, new BigDecimal("79"), false, null, 2, "Negative", "mg/dL"));
        tests.add(createTest("URI007", "Urine Ketones", "Ketone bodies indicating fat metabolism", cat, TestType.URINE, new BigDecimal("99"), false, null, 2, "Negative", "mg/dL"));
        tests.add(createTest("URI008", "Urine Bilirubin", "Bile pigment for liver/biliary disease", cat, TestType.URINE, new BigDecimal("99"), false, null, 2, "Negative", "qualitative"));
        tests.add(createTest("URI009", "Urine Urobilinogen", "Bilirubin metabolite assessment", cat, TestType.URINE, new BigDecimal("99"), false, null, 2, "0.2-1.0 EU/dL", "EU/dL"));
        tests.add(createTest("URI010", "Urine Blood (Occult)", "Hidden blood in urine detection", cat, TestType.URINE, new BigDecimal("99"), false, null, 2, "Negative", "qualitative"));
        tests.add(createTest("URI011", "Urine pH", "Acidity or alkalinity of urine", cat, TestType.URINE, new BigDecimal("79"), false, null, 2, "5.0-8.0", "pH"));
        tests.add(createTest("URI012", "Urine Specific Gravity", "Concentration of urine assessment", cat, TestType.URINE, new BigDecimal("79"), false, null, 2, "1.005-1.030", "ratio"));
        tests.add(createTest("URI013", "Urine Nitrites", "Bacterial infection indicator", cat, TestType.URINE, new BigDecimal("79"), false, null, 2, "Negative", "qualitative"));
        tests.add(createTest("URI014", "Urine Leukocyte Esterase", "White blood cell enzyme for UTI", cat, TestType.URINE, new BigDecimal("79"), false, null, 2, "Negative", "qualitative"));
        tests.add(createTest("URI015", "Urine Microalbumin", "Early kidney damage marker", cat, TestType.URINE, new BigDecimal("399"), false, null, 24, "<30 mg/L", "mg/L"));
        tests.add(createTest("URI016", "Urine Albumin/Creatinine Ratio (ACR)", "Standardized albumin excretion assessment", cat, TestType.URINE, new BigDecimal("499"), false, null, 24, "<30 mg/g normal", "mg/g"));
        tests.add(createTest("URI017", "Urine Protein/Creatinine Ratio (PCR)", "Protein excretion assessment", cat, TestType.URINE, new BigDecimal("499"), false, null, 24, "<150 mg/g normal", "mg/g"));
        tests.add(createTest("URI018", "Urine Creatinine (Spot)", "Creatinine for ratio calculations", cat, TestType.URINE, new BigDecimal("149"), false, null, 4, "20-275 mg/dL", "mg/dL"));
        tests.add(createTest("URI019", "Urine Pregnancy Test (hCG)", "Qualitative pregnancy detection", cat, TestType.URINE, new BigDecimal("149"), false, null, 1, "Negative/Positive", "qualitative"));
        tests.add(createTest("URI020", "Urine Osmolality", "Urine concentration measurement", cat, TestType.URINE, new BigDecimal("399"), false, null, 24, "300-900 mOsm/kg", "mOsm/kg"));
        tests.add(createTest("URI021", "Urine Sodium", "Sodium excretion assessment", cat, TestType.URINE_CHEMISTRY, new BigDecimal("299"), false, null, 24, "40-220 mEq/24hr", "mEq/L"));
        tests.add(createTest("URI022", "Urine Potassium", "Potassium excretion assessment", cat, TestType.URINE_CHEMISTRY, new BigDecimal("299"), false, null, 24, "25-125 mEq/24hr", "mEq/L"));
        tests.add(createTest("URI023", "Urine Chloride", "Chloride excretion assessment", cat, TestType.URINE_CHEMISTRY, new BigDecimal("299"), false, null, 24, "110-250 mEq/24hr", "mEq/L"));
        tests.add(createTest("URI024", "Urine Uric Acid", "Uric acid excretion for gout/stones", cat, TestType.URINE_CHEMISTRY, new BigDecimal("349"), false, null, 24, "250-750 mg/24hr", "mg/24hr"));
        tests.add(createTest("URI025", "Urine Culture and Sensitivity", "Bacterial identification and antibiotic susceptibility", cat, TestType.MICROBIOLOGY, new BigDecimal("499"), false, null, 72, "<10,000 CFU/mL", "CFU/mL"));

        // Additional Urine Tests
        tests.add(createTest("URI026", "Urine Amylase", "Pancreatic and salivary amylase excretion", cat, TestType.URINE_CHEMISTRY, new BigDecimal("349"), false, null, 24, "28-100 U/hr", "U/hr"));
        tests.add(createTest("URI027", "Urine Porphyrins", "Porphyria screening", cat, TestType.URINE_CHEMISTRY, new BigDecimal("999"), false, null, 72, "<300 mcg/24hr", "mcg/24hr"));
        tests.add(createTest("URI028", "Urine Porphobilinogen (PBG)", "Acute porphyria marker", cat, TestType.URINE_CHEMISTRY, new BigDecimal("799"), false, null, 48, "<2 mg/24hr", "mg/24hr"));
        tests.add(createTest("URI029", "Urine Delta-ALA", "Porphyria intermediate", cat, TestType.URINE_CHEMISTRY, new BigDecimal("799"), false, null, 48, "<7 mg/24hr", "mg/24hr"));
        tests.add(createTest("URI030", "Urine Amino Acids", "Metabolic disorder screening", cat, TestType.URINE_CHEMISTRY, new BigDecimal("1499"), false, null, 96, "See detailed report", "multiple"));
        tests.add(createTest("URI031", "Urine Organic Acids", "Metabolic disorder screening", cat, TestType.URINE_CHEMISTRY, new BigDecimal("1999"), false, null, 120, "See detailed report", "multiple"));
        tests.add(createTest("URI032", "Urine Mucopolysaccharides", "Storage disease screening", cat, TestType.URINE_CHEMISTRY, new BigDecimal("999"), false, null, 72, "Negative", "qualitative"));
        tests.add(createTest("URI033", "Urine Reducing Substances", "Galactosemia and other metabolic disorders", cat, TestType.URINE_CHEMISTRY, new BigDecimal("199"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("URI034", "Urine Copper", "Wilson disease screening", cat, TestType.URINE_CHEMISTRY, new BigDecimal("699"), false, null, 48, "<40 mcg/24hr", "mcg/24hr"));
        tests.add(createTest("URI035", "Urine Lead", "Heavy metal exposure assessment", cat, TestType.URINE_CHEMISTRY, new BigDecimal("799"), false, null, 72, "<80 mcg/24hr", "mcg/24hr"));
        tests.add(createTest("URI036", "Urine Mercury", "Mercury toxicity assessment", cat, TestType.URINE_CHEMISTRY, new BigDecimal("999"), false, null, 72, "<20 mcg/24hr", "mcg/24hr"));
        tests.add(createTest("URI037", "Urine Arsenic", "Arsenic exposure assessment", cat, TestType.URINE_CHEMISTRY, new BigDecimal("999"), false, null, 72, "<50 mcg/L", "mcg/L"));
        tests.add(createTest("URI038", "Urine Heavy Metals Panel", "Multiple heavy metal screening", cat, TestType.URINE_CHEMISTRY, new BigDecimal("2499"), false, null, 96, "See detailed report", "multiple"));
        tests.add(createTest("URI039", "Urine Myoglobin", "Muscle damage assessment", cat, TestType.URINE, new BigDecimal("499"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("URI040", "Urine Hemosiderin", "Chronic hemolysis marker", cat, TestType.URINE, new BigDecimal("399"), false, null, 48, "Negative", "qualitative"));
        tests.add(createTest("URI041", "Urine Cystine (Qualitative)", "Cystinuria screening", cat, TestType.URINE, new BigDecimal("299"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("URI042", "Urine Cystine (Quantitative)", "Stone former cystine measurement", cat, TestType.URINE_CHEMISTRY, new BigDecimal("699"), false, null, 48, "<30 mg/24hr", "mg/24hr"));
        tests.add(createTest("URI043", "Urine Hydroxproline", "Bone resorption marker", cat, TestType.URINE_CHEMISTRY, new BigDecimal("699"), false, null, 48, "11-35 mg/24hr", "mg/24hr"));
        tests.add(createTest("URI044", "Urine Deoxypyridinoline", "Bone resorption marker", cat, TestType.URINE_CHEMISTRY, new BigDecimal("899"), false, null, 72, "See age/gender norms", "nmol/mmol Cr"));
        tests.add(createTest("URI045", "Urine NTx (N-Telopeptide)", "Bone turnover marker", cat, TestType.URINE_CHEMISTRY, new BigDecimal("999"), false, null, 72, "See age/gender norms", "nmol BCE/mmol Cr"));
        tests.add(createTest("URI046", "Urine Catecholamines Random", "Spot check for pheochromocytoma", cat, TestType.URINE_CHEMISTRY, new BigDecimal("799"), false, null, 48, "See detailed report", "mcg/g Cr"));
        tests.add(createTest("URI047", "Urine Beta-2 Microglobulin", "Tubular kidney damage marker", cat, TestType.URINE, new BigDecimal("699"), false, null, 48, "<300 mcg/L", "mcg/L"));
        tests.add(createTest("URI048", "Urine NAG (N-Acetyl-beta-glucosaminidase)", "Early tubular damage marker", cat, TestType.URINE, new BigDecimal("599"), false, null, 48, "<12 U/L", "U/L"));
        tests.add(createTest("URI049", "Urine KIM-1 (Kidney Injury Molecule)", "Acute kidney injury biomarker", cat, TestType.URINE, new BigDecimal("999"), false, null, 72, "See reference", "ng/mL"));
        tests.add(createTest("URI050", "Urine NGAL (Neutrophil Gelatinase)", "Acute kidney injury biomarker", cat, TestType.URINE, new BigDecimal("1199"), false, null, 72, "<20 ng/mL", "ng/mL"));

        return tests;
    }

    private List<LabTest> create24HourUrineTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("URINE_TESTS");

        tests.add(createTest("U24001", "24-Hour Urine Protein", "Total protein excretion over 24 hours", cat, TestType.URINE, new BigDecimal("399"), false, null, 48, "<150 mg/24hr", "mg/24hr"));
        tests.add(createTest("U24002", "24-Hour Urine Creatinine", "Kidney function and muscle mass assessment", cat, TestType.URINE, new BigDecimal("349"), false, null, 48, "M:1-2, F:0.8-1.8 g/24hr", "g/24hr"));
        tests.add(createTest("U24003", "24-Hour Creatinine Clearance", "GFR estimation from 24-hour collection", cat, TestType.URINE, new BigDecimal("599"), false, null, 48, "M:97-137, F:88-128 mL/min", "mL/min"));
        tests.add(createTest("U24004", "24-Hour Urine Calcium", "Calcium excretion for stones/parathyroid", cat, TestType.URINE_CHEMISTRY, new BigDecimal("449"), false, null, 48, "100-300 mg/24hr", "mg/24hr"));
        tests.add(createTest("U24005", "24-Hour Urine Phosphorus", "Phosphorus excretion assessment", cat, TestType.URINE_CHEMISTRY, new BigDecimal("449"), false, null, 48, "400-1300 mg/24hr", "mg/24hr"));
        tests.add(createTest("U24006", "24-Hour Urine Magnesium", "Magnesium excretion for deficiency", cat, TestType.URINE_CHEMISTRY, new BigDecimal("499"), false, null, 48, "73-122 mg/24hr", "mg/24hr"));
        tests.add(createTest("U24007", "24-Hour Urine Oxalate", "Oxalate for kidney stone risk", cat, TestType.URINE_CHEMISTRY, new BigDecimal("699"), false, null, 72, "<45 mg/24hr", "mg/24hr"));
        tests.add(createTest("U24008", "24-Hour Urine Citrate", "Citrate for stone protection assessment", cat, TestType.URINE_CHEMISTRY, new BigDecimal("699"), false, null, 72, ">320 mg/24hr", "mg/24hr"));
        tests.add(createTest("U24009", "24-Hour Urine Uric Acid", "Uric acid for gout and stones", cat, TestType.URINE_CHEMISTRY, new BigDecimal("449"), false, null, 48, "250-750 mg/24hr", "mg/24hr"));
        tests.add(createTest("U24010", "Kidney Stone Panel (24-Hour)", "Complete stone risk assessment", cat, TestType.URINE_CHEMISTRY, new BigDecimal("1999"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("U24011", "24-Hour Urine Cortisol", "Free cortisol for Cushing syndrome", cat, TestType.HORMONES, new BigDecimal("999"), false, null, 72, "4-50 mcg/24hr", "mcg/24hr"));
        tests.add(createTest("U24012", "24-Hour Urine Metanephrines", "Pheochromocytoma screening", cat, TestType.HORMONES, new BigDecimal("1999"), false, null, 96, "See detailed report", "mcg/24hr"));
        tests.add(createTest("U24013", "24-Hour Urine Catecholamines", "Epinephrine, norepinephrine, dopamine", cat, TestType.HORMONES, new BigDecimal("1799"), false, null, 96, "See detailed report", "mcg/24hr"));
        tests.add(createTest("U24014", "24-Hour Urine VMA", "Catecholamine metabolite for tumors", cat, TestType.HORMONES, new BigDecimal("999"), false, null, 72, "<6.5 mg/24hr", "mg/24hr"));
        tests.add(createTest("U24015", "24-Hour Urine 5-HIAA", "Carcinoid tumor marker", cat, TestType.HORMONES, new BigDecimal("999"), false, null, 72, "2-8 mg/24hr", "mg/24hr"));

        return tests;
    }

    private List<LabTest> createDrugScreeningTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("DRUG_SCREENING");

        tests.add(createTest("DRG001", "Drug Screen (5-Panel Urine)", "Marijuana, Cocaine, Opiates, Amphetamines, PCP", cat, TestType.DRUG_SCREENING, new BigDecimal("999"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("DRG002", "Drug Screen (10-Panel Urine)", "5-panel plus Benzos, Barbiturates, Methadone, Methaqualone, Propoxyphene", cat, TestType.DRUG_SCREENING, new BigDecimal("1499"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("DRG003", "Drug Screen (12-Panel Urine)", "10-panel plus MDMA, Oxycodone", cat, TestType.DRUG_SCREENING, new BigDecimal("1999"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("DRG004", "Marijuana (THC) Screen", "Cannabis/THC metabolite detection", cat, TestType.DRUG_SCREENING, new BigDecimal("399"), false, null, 24, "Negative (<50 ng/mL)", "ng/mL"));
        tests.add(createTest("DRG005", "Cocaine Metabolites Screen", "Benzoylecgonine detection", cat, TestType.DRUG_SCREENING, new BigDecimal("399"), false, null, 24, "Negative", "ng/mL"));
        tests.add(createTest("DRG006", "Opiates Screen", "Morphine, codeine, heroin metabolites", cat, TestType.DRUG_SCREENING, new BigDecimal("399"), false, null, 24, "Negative", "ng/mL"));
        tests.add(createTest("DRG007", "Amphetamines Screen", "Amphetamine, methamphetamine detection", cat, TestType.DRUG_SCREENING, new BigDecimal("399"), false, null, 24, "Negative", "ng/mL"));
        tests.add(createTest("DRG008", "Benzodiazepines Screen", "Sedative/anxiety medication detection", cat, TestType.DRUG_SCREENING, new BigDecimal("399"), false, null, 24, "Negative", "ng/mL"));
        tests.add(createTest("DRG009", "Barbiturates Screen", "Sedative medication detection", cat, TestType.DRUG_SCREENING, new BigDecimal("399"), false, null, 24, "Negative", "ng/mL"));
        tests.add(createTest("DRG010", "Alcohol (EtG/EtS)", "Alcohol metabolites for recent use", cat, TestType.DRUG_SCREENING, new BigDecimal("599"), false, null, 24, "Negative", "ng/mL"));
        tests.add(createTest("DRG011", "Drug Confirmation (GC-MS)", "Confirmatory testing for positive screens", cat, TestType.DRUG_SCREENING, new BigDecimal("1999"), false, null, 72, "See detailed report", "ng/mL"));
        tests.add(createTest("DRG012", "Hair Drug Test (5-Panel)", "90-day drug history from hair sample", cat, TestType.DRUG_SCREENING, new BigDecimal("3999"), false, null, 120, "See detailed report", "pg/mg"));
        tests.add(createTest("DRG013", "Nicotine/Cotinine Test", "Tobacco use detection", cat, TestType.DRUG_SCREENING, new BigDecimal("499"), false, null, 24, "Negative", "ng/mL"));
        tests.add(createTest("DRG014", "Steroid Panel", "Anabolic steroid detection", cat, TestType.DRUG_SCREENING, new BigDecimal("2999"), false, null, 120, "See detailed report", "multiple"));
        tests.add(createTest("DRG015", "Comprehensive Drug Panel", "Extended detection including designer drugs", cat, TestType.DRUG_SCREENING, new BigDecimal("4999"), false, null, 96, "See detailed report", "multiple"));

        return tests;
    }

    // ==================== IMAGING TESTS ====================

    private List<LabTest> createXRayTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("IMAGING");

        // Chest X-Rays
        tests.add(createTest("XR001", "X-Ray Chest PA", "Single view chest for heart and lungs", cat, TestType.XRAY, new BigDecimal("399"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR002", "X-Ray Chest PA and Lateral", "Two view chest examination", cat, TestType.XRAY, new BigDecimal("599"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR003", "X-Ray Chest Portable", "Bedside chest X-ray for ICU/ER", cat, TestType.XRAY, new BigDecimal("499"), false, null, 1, "Normal", "qualitative"));

        // Spine X-Rays
        tests.add(createTest("XR004", "X-Ray Cervical Spine AP/Lateral", "Neck spine two views", cat, TestType.XRAY, new BigDecimal("699"), false, null, 2, "Normal alignment", "qualitative"));
        tests.add(createTest("XR005", "X-Ray Cervical Spine (5 Views)", "Complete neck spine examination", cat, TestType.XRAY, new BigDecimal("999"), false, null, 4, "Normal alignment", "qualitative"));
        tests.add(createTest("XR006", "X-Ray Thoracic Spine AP/Lateral", "Mid-back spine examination", cat, TestType.XRAY, new BigDecimal("699"), false, null, 2, "Normal alignment", "qualitative"));
        tests.add(createTest("XR007", "X-Ray Lumbar Spine AP/Lateral", "Lower back spine two views", cat, TestType.XRAY, new BigDecimal("699"), false, null, 2, "Normal alignment", "qualitative"));
        tests.add(createTest("XR008", "X-Ray Lumbar Spine (5 Views)", "Complete lower spine examination", cat, TestType.XRAY, new BigDecimal("1099"), false, null, 4, "Normal alignment", "qualitative"));
        tests.add(createTest("XR009", "X-Ray Whole Spine AP/Lateral", "Complete spine screening for scoliosis", cat, TestType.XRAY, new BigDecimal("1499"), false, null, 4, "Normal alignment", "qualitative"));

        // Extremity X-Rays
        tests.add(createTest("XR010", "X-Ray Shoulder (2 Views)", "Shoulder joint examination", cat, TestType.XRAY, new BigDecimal("599"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR011", "X-Ray Elbow (2 Views)", "Elbow joint examination", cat, TestType.XRAY, new BigDecimal("499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR012", "X-Ray Wrist (2 Views)", "Wrist joint examination", cat, TestType.XRAY, new BigDecimal("499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR013", "X-Ray Hand (2 Views)", "Hand bones examination", cat, TestType.XRAY, new BigDecimal("499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR014", "X-Ray Hip (2 Views)", "Hip joint examination", cat, TestType.XRAY, new BigDecimal("699"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR015", "X-Ray Pelvis AP", "Pelvic bones examination", cat, TestType.XRAY, new BigDecimal("599"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR016", "X-Ray Knee (2 Views)", "Knee joint examination", cat, TestType.XRAY, new BigDecimal("499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR017", "X-Ray Knee Standing (Weight Bearing)", "Knee joint space assessment", cat, TestType.XRAY, new BigDecimal("599"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR018", "X-Ray Ankle (2 Views)", "Ankle joint examination", cat, TestType.XRAY, new BigDecimal("499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR019", "X-Ray Foot (2 Views)", "Foot bones examination", cat, TestType.XRAY, new BigDecimal("499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR020", "X-Ray Both Feet (Standing)", "Weight bearing foot assessment", cat, TestType.XRAY, new BigDecimal("799"), false, null, 2, "Normal", "qualitative"));

        // Abdominal and Other
        tests.add(createTest("XR021", "X-Ray Abdomen (KUB)", "Kidneys, ureters, bladder assessment", cat, TestType.XRAY, new BigDecimal("499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR022", "X-Ray Abdomen Erect", "Air-fluid levels for obstruction", cat, TestType.XRAY, new BigDecimal("499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR023", "X-Ray Skull AP/Lateral", "Skull bones examination", cat, TestType.XRAY, new BigDecimal("699"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR024", "X-Ray Paranasal Sinuses", "Sinus cavities examination", cat, TestType.XRAY, new BigDecimal("499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("XR025", "X-Ray Dental Panoramic (OPG)", "Complete dental arch imaging", cat, TestType.XRAY, new BigDecimal("799"), false, null, 2, "Normal", "qualitative"));

        return tests;
    }

    private List<LabTest> createUltrasoundTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("IMAGING");

        // Abdominal Ultrasounds
        tests.add(createTest("USG001", "Ultrasound Abdomen Complete", "Liver, gallbladder, pancreas, spleen, kidneys", cat, TestType.ULTRASOUND, new BigDecimal("1299"), true, 6, 2, "Normal", "qualitative"));
        tests.add(createTest("USG002", "Ultrasound Abdomen Upper", "Liver, gallbladder, pancreas, spleen", cat, TestType.ULTRASOUND, new BigDecimal("999"), true, 6, 2, "Normal", "qualitative"));
        tests.add(createTest("USG003", "Ultrasound Abdomen Lower", "Pelvis and lower abdomen organs", cat, TestType.ULTRASOUND, new BigDecimal("999"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG004", "Ultrasound Liver and Gallbladder", "Hepatobiliary system assessment", cat, TestType.ULTRASOUND, new BigDecimal("799"), true, 6, 2, "Normal", "qualitative"));
        tests.add(createTest("USG005", "Ultrasound Kidneys and Bladder (KUB)", "Renal and bladder assessment", cat, TestType.ULTRASOUND, new BigDecimal("899"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG006", "Ultrasound Spleen", "Spleen size and structure", cat, TestType.ULTRASOUND, new BigDecimal("599"), true, 6, 2, "Normal", "qualitative"));
        tests.add(createTest("USG007", "Ultrasound Pancreas", "Pancreatic structure assessment", cat, TestType.ULTRASOUND, new BigDecimal("799"), true, 8, 2, "Normal", "qualitative"));

        // Pelvic Ultrasounds
        tests.add(createTest("USG008", "Ultrasound Pelvis (Female)", "Uterus, ovaries, adnexa assessment", cat, TestType.ULTRASOUND, new BigDecimal("999"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG009", "Ultrasound Transvaginal", "Detailed uterine and ovarian imaging", cat, TestType.ULTRASOUND, new BigDecimal("1299"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG010", "Ultrasound Pelvis (Male)", "Prostate and seminal vesicles", cat, TestType.ULTRASOUND, new BigDecimal("999"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG011", "Ultrasound Prostate (Transrectal)", "Detailed prostate imaging", cat, TestType.ULTRASOUND, new BigDecimal("1499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG012", "Ultrasound Scrotum", "Testicular and scrotal assessment", cat, TestType.ULTRASOUND, new BigDecimal("999"), false, null, 2, "Normal", "qualitative"));

        // Pregnancy Ultrasounds
        tests.add(createTest("USG013", "Ultrasound Obstetric (Early/Dating)", "First trimester pregnancy dating", cat, TestType.ULTRASOUND, new BigDecimal("1299"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG014", "Ultrasound NT Scan (11-14 weeks)", "Nuchal translucency screening", cat, TestType.ULTRASOUND, new BigDecimal("1999"), false, null, 2, "Normal NT <3mm", "mm"));
        tests.add(createTest("USG015", "Ultrasound Anomaly Scan (18-22 weeks)", "Detailed fetal anatomy survey", cat, TestType.ULTRASOUND, new BigDecimal("2499"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("USG016", "Ultrasound Growth Scan (3rd Trimester)", "Fetal growth and wellbeing", cat, TestType.ULTRASOUND, new BigDecimal("1499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG017", "Ultrasound 3D/4D Baby Face", "3D visualization of fetal face", cat, TestType.ULTRASOUND, new BigDecimal("2999"), false, null, 2, "Normal", "qualitative"));

        // Other Ultrasounds
        tests.add(createTest("USG018", "Ultrasound Thyroid", "Thyroid gland structure and nodules", cat, TestType.ULTRASOUND, new BigDecimal("899"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG019", "Ultrasound Breast (Both)", "Breast tissue assessment", cat, TestType.ULTRASOUND, new BigDecimal("1299"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG020", "Ultrasound Breast (Single)", "Single breast assessment", cat, TestType.ULTRASOUND, new BigDecimal("799"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG021", "Ultrasound Neck/Soft Tissue", "Lymph nodes and soft tissue masses", cat, TestType.ULTRASOUND, new BigDecimal("899"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("USG022", "Ultrasound Musculoskeletal", "Joints, tendons, muscles assessment", cat, TestType.ULTRASOUND, new BigDecimal("999"), false, null, 2, "Normal", "qualitative"));

        // Doppler Ultrasounds
        tests.add(createTest("USG023", "Doppler Carotid (Bilateral)", "Carotid artery blood flow assessment", cat, TestType.DOPPLER, new BigDecimal("1999"), false, null, 4, "Normal velocities", "cm/s"));
        tests.add(createTest("USG024", "Doppler Venous Lower Limb (DVT)", "Deep vein thrombosis assessment", cat, TestType.DOPPLER, new BigDecimal("1799"), false, null, 2, "No thrombus", "qualitative"));
        tests.add(createTest("USG025", "Doppler Arterial Lower Limb", "Peripheral arterial disease assessment", cat, TestType.DOPPLER, new BigDecimal("1999"), false, null, 4, "Normal ABI", "ratio"));
        tests.add(createTest("USG026", "Doppler Renal Arteries", "Renal artery stenosis assessment", cat, TestType.DOPPLER, new BigDecimal("1999"), false, null, 4, "Normal velocities", "cm/s"));
        tests.add(createTest("USG027", "Doppler Portal Vein", "Portal hypertension assessment", cat, TestType.DOPPLER, new BigDecimal("1499"), true, 6, 4, "Normal flow", "cm/s"));
        tests.add(createTest("USG028", "Doppler Obstetric (Fetal)", "Umbilical and middle cerebral artery", cat, TestType.DOPPLER, new BigDecimal("1799"), false, null, 2, "Normal ratios", "ratio"));

        return tests;
    }

    private List<LabTest> createCTScanTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("IMAGING");

        // Head and Neck CT
        tests.add(createTest("CT001", "CT Brain (Plain)", "Brain structure without contrast", cat, TestType.CT_SCAN, new BigDecimal("3999"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("CT002", "CT Brain with Contrast", "Brain with IV contrast for tumors/infections", cat, TestType.CT_SCAN, new BigDecimal("5499"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT003", "CT Brain Plain and Contrast", "Complete brain imaging protocol", cat, TestType.CT_SCAN, new BigDecimal("6999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT004", "CT Paranasal Sinuses", "Sinus detailed imaging", cat, TestType.CT_SCAN, new BigDecimal("3499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("CT005", "CT Orbit", "Eye socket and orbital structures", cat, TestType.CT_SCAN, new BigDecimal("3999"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("CT006", "CT Temporal Bone", "Middle and inner ear structures", cat, TestType.CT_SCAN, new BigDecimal("4499"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT007", "CT Neck with Contrast", "Neck soft tissues and vessels", cat, TestType.CT_SCAN, new BigDecimal("5499"), false, null, 4, "Normal", "qualitative"));

        // Chest CT
        tests.add(createTest("CT008", "CT Chest (Plain)", "Lungs and mediastinum without contrast", cat, TestType.CT_SCAN, new BigDecimal("4499"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("CT009", "CT Chest with Contrast", "Chest with IV contrast for masses/vessels", cat, TestType.CT_SCAN, new BigDecimal("5999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT010", "CT Chest HRCT", "High resolution for interstitial lung disease", cat, TestType.CT_SCAN, new BigDecimal("5499"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT011", "CT Pulmonary Angiography (CTPA)", "Pulmonary embolism assessment", cat, TestType.CT_SCAN, new BigDecimal("7999"), false, null, 2, "No PE", "qualitative"));

        // Abdominal CT
        tests.add(createTest("CT012", "CT Abdomen (Plain)", "Abdominal organs without contrast", cat, TestType.CT_SCAN, new BigDecimal("4999"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("CT013", "CT Abdomen with Contrast", "Abdominal organs with IV contrast", cat, TestType.CT_SCAN, new BigDecimal("6499"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT014", "CT Abdomen and Pelvis with Contrast", "Complete abdomen and pelvis scan", cat, TestType.CT_SCAN, new BigDecimal("7999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT015", "CT KUB (Kidney Stone Protocol)", "Non-contrast for renal stones", cat, TestType.CT_SCAN, new BigDecimal("4499"), false, null, 2, "No stones", "qualitative"));
        tests.add(createTest("CT016", "CT Liver Triphasic", "Liver with arterial, portal, delayed phases", cat, TestType.CT_SCAN, new BigDecimal("8999"), false, null, 4, "Normal", "qualitative"));

        // Spine CT
        tests.add(createTest("CT017", "CT Cervical Spine", "Neck spine detailed imaging", cat, TestType.CT_SCAN, new BigDecimal("4499"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT018", "CT Thoracic Spine", "Mid-back spine imaging", cat, TestType.CT_SCAN, new BigDecimal("4499"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT019", "CT Lumbar Spine", "Lower back spine imaging", cat, TestType.CT_SCAN, new BigDecimal("4499"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("CT020", "CT Whole Spine", "Complete spine imaging", cat, TestType.CT_SCAN, new BigDecimal("9999"), false, null, 4, "Normal", "qualitative"));

        // CT Angiography
        tests.add(createTest("CT021", "CT Angiography Brain", "Brain vessel imaging", cat, TestType.CT_SCAN, new BigDecimal("8999"), false, null, 4, "Normal vessels", "qualitative"));
        tests.add(createTest("CT022", "CT Angiography Carotid", "Neck vessel imaging", cat, TestType.CT_SCAN, new BigDecimal("7999"), false, null, 4, "Normal vessels", "qualitative"));
        tests.add(createTest("CT023", "CT Angiography Coronary", "Heart vessel calcium scoring and angiogram", cat, TestType.CT_SCAN, new BigDecimal("14999"), false, null, 4, "Normal coronaries", "qualitative"));
        tests.add(createTest("CT024", "CT Angiography Aorta", "Aortic aneurysm assessment", cat, TestType.CT_SCAN, new BigDecimal("9999"), false, null, 4, "Normal aorta", "qualitative"));
        tests.add(createTest("CT025", "CT Angiography Lower Limb", "Peripheral vascular assessment", cat, TestType.CT_SCAN, new BigDecimal("9999"), false, null, 4, "Normal vessels", "qualitative"));

        return tests;
    }

    private List<LabTest> createMRITests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("IMAGING");

        // Brain MRI
        tests.add(createTest("MRI001", "MRI Brain (Plain)", "Brain soft tissue without contrast", cat, TestType.MRI, new BigDecimal("7999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI002", "MRI Brain with Contrast", "Brain with gadolinium enhancement", cat, TestType.MRI, new BigDecimal("9999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI003", "MRI Brain Plain and Contrast", "Complete brain MRI protocol", cat, TestType.MRI, new BigDecimal("11999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI004", "MRI Brain with MRA", "Brain and vessel imaging combined", cat, TestType.MRI, new BigDecimal("12999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI005", "MRI Brain Epilepsy Protocol", "Specialized for seizure focus", cat, TestType.MRI, new BigDecimal("10999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI006", "MRI Brain Pituitary", "Focused pituitary gland imaging", cat, TestType.MRI, new BigDecimal("8999"), false, null, 4, "Normal", "qualitative"));

        // Spine MRI
        tests.add(createTest("MRI007", "MRI Cervical Spine", "Neck spine soft tissue imaging", cat, TestType.MRI, new BigDecimal("8999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI008", "MRI Thoracic Spine", "Mid-back spine imaging", cat, TestType.MRI, new BigDecimal("8999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI009", "MRI Lumbar Spine", "Lower back spine imaging", cat, TestType.MRI, new BigDecimal("8999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI010", "MRI Whole Spine Screening", "Complete spine screening", cat, TestType.MRI, new BigDecimal("14999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI011", "MRI Spine with Contrast", "Spine with gadolinium enhancement", cat, TestType.MRI, new BigDecimal("10999"), false, null, 4, "Normal", "qualitative"));

        // Joint MRI
        tests.add(createTest("MRI012", "MRI Shoulder", "Rotator cuff and labrum imaging", cat, TestType.MRI, new BigDecimal("8999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI013", "MRI Elbow", "Elbow joint soft tissue imaging", cat, TestType.MRI, new BigDecimal("7999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI014", "MRI Wrist", "Wrist ligaments and tendons imaging", cat, TestType.MRI, new BigDecimal("7999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI015", "MRI Hip", "Hip joint and labrum imaging", cat, TestType.MRI, new BigDecimal("8999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI016", "MRI Knee", "Meniscus, ligaments, cartilage imaging", cat, TestType.MRI, new BigDecimal("8999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI017", "MRI Ankle", "Ankle ligaments and tendons imaging", cat, TestType.MRI, new BigDecimal("7999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI018", "MRI Foot", "Foot soft tissue imaging", cat, TestType.MRI, new BigDecimal("7999"), false, null, 4, "Normal", "qualitative"));

        // Abdominal and Pelvic MRI
        tests.add(createTest("MRI019", "MRI Abdomen", "Abdominal organs soft tissue imaging", cat, TestType.MRI, new BigDecimal("9999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI020", "MRI Liver (Hepatocyte Specific)", "Liver with special contrast agent", cat, TestType.MRI, new BigDecimal("12999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI021", "MRCP (Biliary)", "Bile duct and pancreatic duct imaging", cat, TestType.MRI, new BigDecimal("10999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI022", "MRI Pelvis (Female)", "Uterus and ovaries imaging", cat, TestType.MRI, new BigDecimal("9999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI023", "MRI Pelvis (Male)", "Prostate and pelvic organs imaging", cat, TestType.MRI, new BigDecimal("9999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI024", "MRI Prostate (Multiparametric)", "Detailed prostate cancer imaging", cat, TestType.MRI, new BigDecimal("14999"), false, null, 4, "Normal", "qualitative"));

        // MR Angiography
        tests.add(createTest("MRI025", "MRA Brain", "Brain vessel imaging without radiation", cat, TestType.MRI, new BigDecimal("9999"), false, null, 4, "Normal vessels", "qualitative"));
        tests.add(createTest("MRI026", "MRA Carotid", "Carotid artery imaging", cat, TestType.MRI, new BigDecimal("8999"), false, null, 4, "Normal vessels", "qualitative"));
        tests.add(createTest("MRI027", "MRA Renal", "Renal artery imaging", cat, TestType.MRI, new BigDecimal("9999"), false, null, 4, "Normal vessels", "qualitative"));
        tests.add(createTest("MRI028", "MRV Brain", "Brain venous system imaging", cat, TestType.MRI, new BigDecimal("9999"), false, null, 4, "Normal veins", "qualitative"));

        // Cardiac MRI
        tests.add(createTest("MRI029", "MRI Cardiac (Structural)", "Heart structure and function", cat, TestType.MRI, new BigDecimal("14999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("MRI030", "MRI Cardiac (Viability)", "Heart muscle viability assessment", cat, TestType.MRI, new BigDecimal("16999"), false, null, 4, "Normal", "qualitative"));

        return tests;
    }

    private List<LabTest> createSpecialImagingTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("IMAGING");

        // Mammography
        tests.add(createTest("MAM001", "Mammography (Bilateral)", "Breast cancer screening both breasts", cat, TestType.MAMMOGRAPHY, new BigDecimal("1999"), false, null, 2, "BI-RADS Category 1", "category"));
        tests.add(createTest("MAM002", "Mammography (Single Breast)", "Single breast diagnostic imaging", cat, TestType.MAMMOGRAPHY, new BigDecimal("1299"), false, null, 2, "BI-RADS Category 1", "category"));
        tests.add(createTest("MAM003", "3D Mammography (Tomosynthesis)", "Advanced 3D breast imaging", cat, TestType.MAMMOGRAPHY, new BigDecimal("2999"), false, null, 2, "BI-RADS Category 1", "category"));
        tests.add(createTest("MAM004", "Mammography with Ultrasound", "Complete breast assessment", cat, TestType.MAMMOGRAPHY, new BigDecimal("2999"), false, null, 4, "Normal", "qualitative"));

        // Bone Density
        tests.add(createTest("DEXA001", "DEXA Scan (Spine and Hip)", "Bone density for osteoporosis", cat, TestType.DEXA_SCAN, new BigDecimal("2499"), false, null, 2, "T-score >-1.0 normal", "T-score"));
        tests.add(createTest("DEXA002", "DEXA Scan (Whole Body)", "Full body bone density and composition", cat, TestType.DEXA_SCAN, new BigDecimal("3499"), false, null, 2, "See detailed report", "T-score"));
        tests.add(createTest("DEXA003", "DEXA Body Composition", "Fat, muscle, bone mass analysis", cat, TestType.DEXA_SCAN, new BigDecimal("2999"), false, null, 2, "See detailed report", "%"));

        // Echocardiography
        tests.add(createTest("ECHO001", "2D Echocardiography", "Heart structure and function assessment", cat, TestType.ECHOCARDIOGRAPHY, new BigDecimal("2499"), false, null, 2, "Normal EF >55%", "%"));
        tests.add(createTest("ECHO002", "2D Echo with Color Doppler", "Heart with blood flow assessment", cat, TestType.ECHOCARDIOGRAPHY, new BigDecimal("2999"), false, null, 2, "Normal", "qualitative"));
        tests.add(createTest("ECHO003", "Stress Echocardiography", "Heart function during exercise/stress", cat, TestType.ECHOCARDIOGRAPHY, new BigDecimal("4999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("ECHO004", "Transesophageal Echo (TEE)", "Detailed heart imaging from esophagus", cat, TestType.ECHOCARDIOGRAPHY, new BigDecimal("7999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("ECHO005", "3D Echocardiography", "Three-dimensional heart imaging", cat, TestType.ECHOCARDIOGRAPHY, new BigDecimal("5999"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("ECHO006", "Fetal Echocardiography", "Fetal heart assessment", cat, TestType.ECHOCARDIOGRAPHY, new BigDecimal("3999"), false, null, 4, "Normal", "qualitative"));

        // Other Special Imaging
        tests.add(createTest("PET001", "PET-CT Whole Body", "Cancer staging and monitoring", cat, TestType.PET_SCAN, new BigDecimal("29999"), false, null, 24, "See detailed report", "SUV"));
        tests.add(createTest("PET002", "PET-CT Brain", "Brain metabolism imaging", cat, TestType.PET_SCAN, new BigDecimal("24999"), false, null, 24, "See detailed report", "SUV"));
        tests.add(createTest("NUC001", "Bone Scan (Whole Body)", "Skeletal metastases screening", cat, TestType.OTHER, new BigDecimal("4999"), false, null, 24, "Normal", "qualitative"));
        tests.add(createTest("NUC002", "Thyroid Scan", "Thyroid function and nodule assessment", cat, TestType.OTHER, new BigDecimal("3499"), false, null, 24, "Normal uptake", "%"));
        tests.add(createTest("NUC003", "Renal Scan (DTPA/DMSA)", "Kidney function assessment", cat, TestType.OTHER, new BigDecimal("4999"), false, null, 24, "Normal function", "mL/min"));
        tests.add(createTest("NUC004", "Cardiac Nuclear Scan (SPECT)", "Heart perfusion imaging", cat, TestType.OTHER, new BigDecimal("8999"), false, null, 24, "Normal perfusion", "qualitative"));
        tests.add(createTest("FLU001", "Barium Swallow", "Esophageal imaging with contrast", cat, TestType.FLUOROSCOPY, new BigDecimal("2499"), true, 6, 4, "Normal", "qualitative"));
        tests.add(createTest("FLU002", "Barium Meal", "Stomach imaging with contrast", cat, TestType.FLUOROSCOPY, new BigDecimal("2999"), true, 8, 4, "Normal", "qualitative"));
        tests.add(createTest("FLU003", "Barium Enema", "Colon imaging with contrast", cat, TestType.FLUOROSCOPY, new BigDecimal("3499"), true, 12, 4, "Normal", "qualitative"));
        tests.add(createTest("FLU004", "IVU/IVP (Intravenous Urography)", "Urinary tract with IV contrast", cat, TestType.FLUOROSCOPY, new BigDecimal("3999"), true, 6, 4, "Normal", "qualitative"));
        tests.add(createTest("FLU005", "HSG (Hysterosalpingography)", "Uterus and fallopian tubes imaging", cat, TestType.FLUOROSCOPY, new BigDecimal("4999"), false, null, 4, "Normal", "qualitative"));

        return tests;
    }
    // ==================== SPECIALIZED TESTS ====================

    private List<LabTest> createGeneticTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("GENETIC");

        // Cancer Genetic Tests
        tests.add(createTest("GEN001", "BRCA1/BRCA2 Gene Test", "Hereditary breast and ovarian cancer risk", cat, TestType.GENETIC, new BigDecimal("24999"), false, null, 240, "No pathogenic variant", "qualitative"));
        tests.add(createTest("GEN002", "Lynch Syndrome Panel", "Hereditary colorectal cancer genes", cat, TestType.GENETIC, new BigDecimal("19999"), false, null, 240, "No pathogenic variant", "qualitative"));
        tests.add(createTest("GEN003", "Hereditary Cancer Panel (Comprehensive)", "Multiple cancer susceptibility genes", cat, TestType.GENETIC, new BigDecimal("49999"), false, null, 336, "See detailed report", "qualitative"));

        // Carrier Screening
        tests.add(createTest("GEN004", "Cystic Fibrosis Carrier Test", "CFTR gene mutation screening", cat, TestType.GENETIC, new BigDecimal("9999"), false, null, 168, "Negative", "qualitative"));
        tests.add(createTest("GEN005", "Thalassemia Carrier Test", "Beta-globin gene mutations", cat, TestType.GENETIC, new BigDecimal("4999"), false, null, 120, "Negative", "qualitative"));
        tests.add(createTest("GEN006", "Sickle Cell Carrier Test", "HbS mutation detection", cat, TestType.GENETIC, new BigDecimal("3999"), false, null, 72, "Negative", "qualitative"));
        tests.add(createTest("GEN007", "Spinal Muscular Atrophy Carrier", "SMN1 gene deletion carrier test", cat, TestType.GENETIC, new BigDecimal("7999"), false, null, 168, "Negative", "qualitative"));
        tests.add(createTest("GEN008", "Expanded Carrier Panel (100+ genes)", "Comprehensive carrier screening", cat, TestType.GENETIC, new BigDecimal("29999"), false, null, 336, "See detailed report", "qualitative"));

        // Prenatal Genetic Tests
        tests.add(createTest("GEN009", "NIPT (Non-Invasive Prenatal Test)", "Cell-free fetal DNA screening for chromosomal disorders", cat, TestType.GENETIC, new BigDecimal("14999"), false, null, 168, "Low risk", "qualitative"));
        tests.add(createTest("GEN010", "First Trimester Screen (Combined)", "NT, PAPP-A, free beta-hCG for Down syndrome", cat, TestType.GENETIC, new BigDecimal("4999"), false, null, 72, "Low risk", "risk ratio"));
        tests.add(createTest("GEN011", "Quad Screen (Second Trimester)", "AFP, hCG, Estriol, Inhibin A screening", cat, TestType.GENETIC, new BigDecimal("3999"), false, null, 72, "Low risk", "risk ratio"));
        tests.add(createTest("GEN012", "Amniocentesis Chromosome Analysis", "Fetal karyotype from amniotic fluid", cat, TestType.GENETIC, new BigDecimal("14999"), false, null, 336, "46,XX or 46,XY normal", "karyotype"));
        tests.add(createTest("GEN013", "Chorionic Villus Sampling (CVS)", "Early fetal chromosome analysis", cat, TestType.GENETIC, new BigDecimal("14999"), false, null, 336, "Normal karyotype", "karyotype"));

        // Pharmacogenomics
        tests.add(createTest("GEN014", "Pharmacogenomics Panel (Basic)", "Drug metabolism genes CYP450 panel", cat, TestType.GENETIC, new BigDecimal("9999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("GEN015", "Warfarin Sensitivity (CYP2C9/VKORC1)", "Warfarin dosing genetic test", cat, TestType.GENETIC, new BigDecimal("4999"), false, null, 120, "See detailed report", "qualitative"));
        tests.add(createTest("GEN016", "Clopidogrel Sensitivity (CYP2C19)", "Plavix response genetic test", cat, TestType.GENETIC, new BigDecimal("4999"), false, null, 120, "See detailed report", "qualitative"));
        tests.add(createTest("GEN017", "Statin Induced Myopathy (SLCO1B1)", "Statin side effect risk", cat, TestType.GENETIC, new BigDecimal("4999"), false, null, 120, "See detailed report", "qualitative"));
        tests.add(createTest("GEN018", "Comprehensive Pharmacogenomics", "200+ drug metabolism genes", cat, TestType.GENETIC, new BigDecimal("24999"), false, null, 240, "See detailed report", "qualitative"));

        // Hereditary Conditions
        tests.add(createTest("GEN019", "Hemochromatosis Gene Test (HFE)", "Iron overload genetic risk", cat, TestType.GENETIC, new BigDecimal("4999"), false, null, 120, "Negative", "qualitative"));
        tests.add(createTest("GEN020", "Celiac Disease HLA-DQ2/DQ8", "Celiac disease genetic predisposition", cat, TestType.GENETIC, new BigDecimal("4999"), false, null, 120, "See report", "qualitative"));
        tests.add(createTest("GEN021", "Lactose Intolerance Gene Test", "MCM6 gene lactase persistence", cat, TestType.GENETIC, new BigDecimal("3999"), false, null, 120, "See report", "qualitative"));
        tests.add(createTest("GEN022", "MTHFR Gene Test", "Folate metabolism variants", cat, TestType.GENETIC, new BigDecimal("3999"), false, null, 120, "See report", "qualitative"));
        tests.add(createTest("GEN023", "Factor V Leiden and Prothrombin", "Thrombophilia genetic test", cat, TestType.GENETIC, new BigDecimal("5999"), false, null, 120, "Negative", "qualitative"));
        tests.add(createTest("GEN024", "ApoE Genotype", "Alzheimer and cardiovascular risk", cat, TestType.GENETIC, new BigDecimal("4999"), false, null, 120, "E3/E3 common", "genotype"));
        tests.add(createTest("GEN025", "Whole Exome Sequencing", "Complete coding region analysis", cat, TestType.GENETIC, new BigDecimal("79999"), false, null, 672, "See detailed report", "qualitative"));

        return tests;
    }

    private List<LabTest> createPathologyTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("SPECIALIZED");

        // Histopathology
        tests.add(createTest("PATH001", "Histopathology (Small Biopsy)", "Tissue examination under microscope", cat, TestType.HISTOPATHOLOGY, new BigDecimal("1999"), false, null, 96, "See detailed report", "qualitative"));
        tests.add(createTest("PATH002", "Histopathology (Large Specimen)", "Complex tissue examination", cat, TestType.HISTOPATHOLOGY, new BigDecimal("3999"), false, null, 120, "See detailed report", "qualitative"));
        tests.add(createTest("PATH003", "Immunohistochemistry (Single Marker)", "Specific protein detection in tissue", cat, TestType.HISTOPATHOLOGY, new BigDecimal("1499"), false, null, 72, "See detailed report", "qualitative"));
        tests.add(createTest("PATH004", "Immunohistochemistry Panel", "Multiple markers for tumor typing", cat, TestType.HISTOPATHOLOGY, new BigDecimal("4999"), false, null, 120, "See detailed report", "qualitative"));
        tests.add(createTest("PATH005", "Frozen Section (Intraoperative)", "Rapid tissue diagnosis during surgery", cat, TestType.HISTOPATHOLOGY, new BigDecimal("2999"), false, null, 1, "See report", "qualitative"));

        // Cytology
        tests.add(createTest("PATH006", "Pap Smear (Conventional)", "Cervical cancer screening", cat, TestType.CYTOLOGY, new BigDecimal("499"), false, null, 72, "NILM (Normal)", "qualitative"));
        tests.add(createTest("PATH007", "Pap Smear (Liquid-Based/ThinPrep)", "Advanced cervical screening", cat, TestType.CYTOLOGY, new BigDecimal("999"), false, null, 72, "NILM (Normal)", "qualitative"));
        tests.add(createTest("PATH008", "Pap Smear with HPV Co-Testing", "Cervical screening with HPV DNA", cat, TestType.CYTOLOGY, new BigDecimal("1999"), false, null, 96, "NILM, HPV negative", "qualitative"));
        tests.add(createTest("PATH009", "FNAC (Fine Needle Aspiration Cytology)", "Needle sampling of lumps/masses", cat, TestType.CYTOLOGY, new BigDecimal("1499"), false, null, 48, "See detailed report", "qualitative"));
        tests.add(createTest("PATH010", "Pleural/Peritoneal Fluid Cytology", "Fluid examination for cancer cells", cat, TestType.CYTOLOGY, new BigDecimal("999"), false, null, 48, "Negative for malignancy", "qualitative"));
        tests.add(createTest("PATH011", "Urine Cytology", "Urine cells for bladder cancer", cat, TestType.CYTOLOGY, new BigDecimal("799"), false, null, 48, "Negative", "qualitative"));
        tests.add(createTest("PATH012", "CSF Cytology", "Cerebrospinal fluid cell examination", cat, TestType.CYTOLOGY, new BigDecimal("1299"), false, null, 48, "Normal cells", "qualitative"));
        tests.add(createTest("PATH013", "Sputum Cytology", "Respiratory secretion examination", cat, TestType.CYTOLOGY, new BigDecimal("699"), false, null, 48, "Negative", "qualitative"));
        tests.add(createTest("PATH014", "Breast FNAC", "Breast lump aspiration cytology", cat, TestType.CYTOLOGY, new BigDecimal("1499"), false, null, 48, "See detailed report", "qualitative"));
        tests.add(createTest("PATH015", "Thyroid FNAC", "Thyroid nodule aspiration cytology", cat, TestType.CYTOLOGY, new BigDecimal("1999"), false, null, 48, "Bethesda Category", "category"));

        // Molecular Pathology
        tests.add(createTest("PATH016", "HPV Genotyping (High Risk)", "HPV type identification for cervical cancer risk", cat, TestType.PATHOLOGY, new BigDecimal("2999"), false, null, 96, "Not detected", "qualitative"));
        tests.add(createTest("PATH017", "EGFR Mutation Analysis", "Lung cancer targeted therapy guidance", cat, TestType.PATHOLOGY, new BigDecimal("9999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("PATH018", "KRAS Mutation Analysis", "Colorectal cancer therapy guidance", cat, TestType.PATHOLOGY, new BigDecimal("7999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("PATH019", "BRAF Mutation Analysis", "Melanoma and thyroid cancer guidance", cat, TestType.PATHOLOGY, new BigDecimal("7999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("PATH020", "HER2 FISH", "Breast cancer HER2 gene amplification", cat, TestType.PATHOLOGY, new BigDecimal("8999"), false, null, 120, "See detailed report", "ratio"));

        // Additional Pathology Tests
        tests.add(createTest("PATH021", "ALK Gene Rearrangement", "Lung cancer targeted therapy marker", cat, TestType.PATHOLOGY, new BigDecimal("9999"), false, null, 168, "Negative", "qualitative"));
        tests.add(createTest("PATH022", "ROS1 Gene Rearrangement", "Lung cancer targeted therapy marker", cat, TestType.PATHOLOGY, new BigDecimal("9999"), false, null, 168, "Negative", "qualitative"));
        tests.add(createTest("PATH023", "PD-L1 Expression", "Immunotherapy response predictor", cat, TestType.PATHOLOGY, new BigDecimal("6999"), false, null, 120, "See TPS %", "%"));
        tests.add(createTest("PATH024", "MSI/MMR Status", "Microsatellite instability for immunotherapy", cat, TestType.PATHOLOGY, new BigDecimal("7999"), false, null, 168, "MSS (stable)", "qualitative"));
        tests.add(createTest("PATH025", "TMB (Tumor Mutational Burden)", "Immunotherapy response marker", cat, TestType.PATHOLOGY, new BigDecimal("14999"), false, null, 240, "See mutations/Mb", "mutations/Mb"));
        tests.add(createTest("PATH026", "NTRK Fusion Analysis", "Pan-cancer targeted therapy marker", cat, TestType.PATHOLOGY, new BigDecimal("12999"), false, null, 240, "Negative", "qualitative"));
        tests.add(createTest("PATH027", "PIK3CA Mutation", "Breast cancer targeted therapy marker", cat, TestType.PATHOLOGY, new BigDecimal("7999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("PATH028", "IDH1/IDH2 Mutation", "Brain tumor and AML marker", cat, TestType.PATHOLOGY, new BigDecimal("8999"), false, null, 168, "Wild type", "qualitative"));
        tests.add(createTest("PATH029", "NRAS Mutation Analysis", "Melanoma therapy guidance", cat, TestType.PATHOLOGY, new BigDecimal("7999"), false, null, 168, "Wild type", "qualitative"));
        tests.add(createTest("PATH030", "FLT3 Mutation (AML)", "Acute myeloid leukemia prognostic marker", cat, TestType.PATHOLOGY, new BigDecimal("8999"), false, null, 120, "Negative", "qualitative"));
        tests.add(createTest("PATH031", "NPM1 Mutation (AML)", "AML prognostic and monitoring marker", cat, TestType.PATHOLOGY, new BigDecimal("7999"), false, null, 120, "Negative", "qualitative"));
        tests.add(createTest("PATH032", "BCR-ABL Quantitative", "CML monitoring by RT-PCR", cat, TestType.PATHOLOGY, new BigDecimal("5999"), false, null, 120, "See %IS", "%"));
        tests.add(createTest("PATH033", "JAK2 V617F Mutation", "Myeloproliferative neoplasm marker", cat, TestType.PATHOLOGY, new BigDecimal("4999"), false, null, 96, "Negative", "qualitative"));
        tests.add(createTest("PATH034", "CALR Mutation", "MPN marker when JAK2 negative", cat, TestType.PATHOLOGY, new BigDecimal("5999"), false, null, 120, "Negative", "qualitative"));
        tests.add(createTest("PATH035", "MPL Mutation", "MPN marker for ET and PMF", cat, TestType.PATHOLOGY, new BigDecimal("5999"), false, null, 120, "Negative", "qualitative"));
        tests.add(createTest("PATH036", "Lung Cancer Panel (EGFR, ALK, ROS1, KRAS)", "Comprehensive lung cancer genotyping", cat, TestType.PATHOLOGY, new BigDecimal("24999"), false, null, 240, "See detailed report", "multiple"));
        tests.add(createTest("PATH037", "Colorectal Cancer Panel", "KRAS, NRAS, BRAF, MSI", cat, TestType.PATHOLOGY, new BigDecimal("19999"), false, null, 240, "See detailed report", "multiple"));
        tests.add(createTest("PATH038", "Melanoma Panel", "BRAF, NRAS, KIT mutations", cat, TestType.PATHOLOGY, new BigDecimal("14999"), false, null, 240, "See detailed report", "multiple"));
        tests.add(createTest("PATH039", "Comprehensive Genomic Profiling", "Full tumor genome analysis 300+ genes", cat, TestType.PATHOLOGY, new BigDecimal("79999"), false, null, 504, "See detailed report", "multiple"));
        tests.add(createTest("PATH040", "Liquid Biopsy (ctDNA)", "Circulating tumor DNA analysis", cat, TestType.PATHOLOGY, new BigDecimal("49999"), false, null, 336, "See detailed report", "multiple"));

        // Hematopathology
        tests.add(createTest("PATH041", "Bone Marrow Aspiration", "Bone marrow cell examination", cat, TestType.HISTOPATHOLOGY, new BigDecimal("3999"), false, null, 96, "See detailed report", "qualitative"));
        tests.add(createTest("PATH042", "Bone Marrow Biopsy", "Bone marrow architecture assessment", cat, TestType.HISTOPATHOLOGY, new BigDecimal("4999"), false, null, 120, "See detailed report", "qualitative"));
        tests.add(createTest("PATH043", "Flow Cytometry (Leukemia/Lymphoma)", "Immunophenotyping for blood cancers", cat, TestType.PATHOLOGY, new BigDecimal("6999"), false, null, 72, "See detailed report", "qualitative"));
        tests.add(createTest("PATH044", "Cytogenetics (Karyotype)", "Chromosome analysis for blood cancers", cat, TestType.PATHOLOGY, new BigDecimal("7999"), false, null, 336, "46,XX or 46,XY normal", "karyotype"));
        tests.add(createTest("PATH045", "FISH Panel (Leukemia)", "Specific genetic abnormalities in leukemia", cat, TestType.PATHOLOGY, new BigDecimal("9999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("PATH046", "MRD (Minimal Residual Disease)", "Treatment response monitoring in leukemia", cat, TestType.PATHOLOGY, new BigDecimal("12999"), false, null, 168, "<0.01% negative", "%"));
        tests.add(createTest("PATH047", "Lymphoma FISH Panel", "Genetic markers for lymphoma", cat, TestType.PATHOLOGY, new BigDecimal("9999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("PATH048", "Myeloma FISH Panel", "Genetic risk stratification for myeloma", cat, TestType.PATHOLOGY, new BigDecimal("9999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("PATH049", "HLA Typing (Transplant)", "Tissue matching for transplantation", cat, TestType.PATHOLOGY, new BigDecimal("14999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("PATH050", "Chimerism Analysis", "Engraftment monitoring post-transplant", cat, TestType.PATHOLOGY, new BigDecimal("8999"), false, null, 120, "See % donor", "%"));

        return tests;
    }

    private List<LabTest> createMicrobiologyTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("BLOOD_TESTS");

        // Bacterial Cultures
        tests.add(createTest("MIC001", "Blood Culture (Aerobic/Anaerobic)", "Bacteria detection in bloodstream", cat, TestType.MICROBIOLOGY, new BigDecimal("999"), false, null, 120, "No growth", "qualitative"));
        tests.add(createTest("MIC002", "Urine Culture and Sensitivity", "UTI pathogen identification", cat, TestType.MICROBIOLOGY, new BigDecimal("499"), false, null, 72, "<10,000 CFU/mL", "CFU/mL"));
        tests.add(createTest("MIC003", "Stool Culture", "Intestinal pathogen detection", cat, TestType.MICROBIOLOGY, new BigDecimal("699"), false, null, 96, "No pathogen isolated", "qualitative"));
        tests.add(createTest("MIC004", "Throat Swab Culture", "Upper respiratory infection pathogen", cat, TestType.MICROBIOLOGY, new BigDecimal("399"), false, null, 72, "Normal flora", "qualitative"));
        tests.add(createTest("MIC005", "Wound Culture and Sensitivity", "Wound infection pathogen identification", cat, TestType.MICROBIOLOGY, new BigDecimal("599"), false, null, 72, "See detailed report", "qualitative"));
        tests.add(createTest("MIC006", "Sputum Culture and Sensitivity", "Lower respiratory infection pathogen", cat, TestType.MICROBIOLOGY, new BigDecimal("699"), false, null, 96, "See detailed report", "qualitative"));
        tests.add(createTest("MIC007", "CSF Culture", "Meningitis pathogen detection", cat, TestType.MICROBIOLOGY, new BigDecimal("999"), false, null, 120, "No growth", "qualitative"));
        tests.add(createTest("MIC008", "Pleural Fluid Culture", "Pleural infection pathogen detection", cat, TestType.MICROBIOLOGY, new BigDecimal("799"), false, null, 96, "No growth", "qualitative"));
        tests.add(createTest("MIC009", "Vaginal Swab Culture", "Vaginal infection pathogen identification", cat, TestType.MICROBIOLOGY, new BigDecimal("499"), false, null, 72, "Normal flora", "qualitative"));
        tests.add(createTest("MIC010", "Ear Swab Culture", "Ear infection pathogen identification", cat, TestType.MICROBIOLOGY, new BigDecimal("399"), false, null, 72, "See detailed report", "qualitative"));

        // Fungal Tests
        tests.add(createTest("MIC011", "Fungal Culture", "Fungal infection identification", cat, TestType.MICROBIOLOGY, new BigDecimal("799"), false, null, 336, "No fungus isolated", "qualitative"));
        tests.add(createTest("MIC012", "KOH Preparation (Skin/Nail)", "Direct fungal element detection", cat, TestType.MICROBIOLOGY, new BigDecimal("199"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("MIC013", "Fungal Sensitivity Testing", "Antifungal drug susceptibility", cat, TestType.MICROBIOLOGY, new BigDecimal("1499"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("MIC014", "Aspergillus Antigen (Galactomannan)", "Invasive aspergillosis detection", cat, TestType.MICROBIOLOGY, new BigDecimal("1999"), false, null, 48, "<0.5 index", "index"));
        tests.add(createTest("MIC015", "Candida Antigen/Antibody", "Systemic candidiasis assessment", cat, TestType.MICROBIOLOGY, new BigDecimal("1499"), false, null, 48, "Negative", "qualitative"));

        // Parasitology
        tests.add(createTest("MIC016", "Stool Ova and Parasites", "Intestinal parasite detection", cat, TestType.MICROBIOLOGY, new BigDecimal("299"), false, null, 24, "No ova/parasites", "qualitative"));
        tests.add(createTest("MIC017", "Stool Occult Blood", "Hidden blood in stool for GI bleeding", cat, TestType.MICROBIOLOGY, new BigDecimal("149"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("MIC018", "Giardia Antigen", "Giardiasis detection", cat, TestType.MICROBIOLOGY, new BigDecimal("499"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("MIC019", "H. pylori Stool Antigen", "Stomach infection detection", cat, TestType.MICROBIOLOGY, new BigDecimal("599"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("MIC020", "Malaria Parasite (Thick/Thin Smear)", "Blood smear for malaria", cat, TestType.MICROBIOLOGY, new BigDecimal("299"), false, null, 4, "Not seen", "qualitative"));

        // AFB and TB
        tests.add(createTest("MIC021", "AFB Smear (Sputum)", "Acid-fast bacilli for TB screening", cat, TestType.MICROBIOLOGY, new BigDecimal("299"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("MIC022", "AFB Culture (MGIT)", "TB culture rapid liquid method", cat, TestType.MICROBIOLOGY, new BigDecimal("1499"), false, null, 1008, "No growth", "qualitative"));
        tests.add(createTest("MIC023", "TB PCR (GeneXpert)", "Rapid molecular TB detection with rifampicin resistance", cat, TestType.MICROBIOLOGY, new BigDecimal("1999"), false, null, 4, "MTB not detected", "qualitative"));
        tests.add(createTest("MIC024", "TB Drug Sensitivity (First Line)", "Rifampicin, Isoniazid, etc. susceptibility", cat, TestType.MICROBIOLOGY, new BigDecimal("2999"), false, null, 1344, "See detailed report", "qualitative"));
        tests.add(createTest("MIC025", "TB Drug Sensitivity (Second Line)", "Extended TB drug susceptibility", cat, TestType.MICROBIOLOGY, new BigDecimal("4999"), false, null, 1344, "See detailed report", "qualitative"));

        return tests;
    }

    private List<LabTest> createSpecialChemistryTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("BLOOD_TESTS");

        tests.add(createTest("SPC001", "Ammonia, Blood", "Liver function and urea cycle assessment", cat, TestType.BIOCHEMISTRY, new BigDecimal("599"), false, null, 4, "15-45 mcg/dL", "mcg/dL"));
        tests.add(createTest("SPC002", "Lactate, Blood", "Tissue oxygenation marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("499"), false, null, 2, "0.5-2.2 mmol/L", "mmol/L"));
        tests.add(createTest("SPC003", "Ceruloplasmin", "Copper metabolism protein for Wilson disease", cat, TestType.BIOCHEMISTRY, new BigDecimal("799"), false, null, 48, "20-60 mg/dL", "mg/dL"));
        tests.add(createTest("SPC004", "Alpha-1 Antitrypsin", "Genetic lung and liver disease marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("999"), false, null, 72, "100-220 mg/dL", "mg/dL"));
        tests.add(createTest("SPC005", "Haptoglobin", "Hemolysis marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("699"), false, null, 48, "30-200 mg/dL", "mg/dL"));
        tests.add(createTest("SPC006", "Immunoglobulin G (IgG)", "Humoral immunity assessment", cat, TestType.IMMUNOLOGY, new BigDecimal("599"), false, null, 24, "700-1600 mg/dL", "mg/dL"));
        tests.add(createTest("SPC007", "Immunoglobulin A (IgA)", "Mucosal immunity assessment", cat, TestType.IMMUNOLOGY, new BigDecimal("599"), false, null, 24, "70-400 mg/dL", "mg/dL"));
        tests.add(createTest("SPC008", "Immunoglobulin M (IgM)", "Primary immune response assessment", cat, TestType.IMMUNOLOGY, new BigDecimal("599"), false, null, 24, "40-230 mg/dL", "mg/dL"));
        tests.add(createTest("SPC009", "Immunoglobulin E (IgE), Total", "Allergy and parasitic infection marker", cat, TestType.IMMUNOLOGY, new BigDecimal("499"), false, null, 24, "<100 IU/mL", "IU/mL"));
        tests.add(createTest("SPC010", "Serum Protein Electrophoresis (SPEP)", "Protein pattern for myeloma screening", cat, TestType.IMMUNOLOGY, new BigDecimal("999"), false, null, 48, "Normal pattern", "qualitative"));
        tests.add(createTest("SPC011", "Immunofixation Electrophoresis (IFE)", "Monoclonal protein identification", cat, TestType.IMMUNOLOGY, new BigDecimal("1999"), false, null, 72, "No monoclonal protein", "qualitative"));
        tests.add(createTest("SPC012", "Serum Free Light Chains", "Kappa and lambda light chains for myeloma", cat, TestType.IMMUNOLOGY, new BigDecimal("2499"), false, null, 72, "Normal ratio", "mg/dL"));
        tests.add(createTest("SPC013", "Beta-2 Microglobulin", "Myeloma and lymphoma marker", cat, TestType.IMMUNOLOGY, new BigDecimal("899"), false, null, 48, "0.7-1.8 mg/L", "mg/L"));
        tests.add(createTest("SPC014", "Procalcitonin (PCT)", "Bacterial sepsis marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("1299"), false, null, 4, "<0.1 ng/mL normal", "ng/mL"));
        tests.add(createTest("SPC015", "CRP (C-Reactive Protein)", "Inflammation marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("399"), false, null, 4, "<5 mg/L", "mg/L"));
        tests.add(createTest("SPC016", "Amylase, Serum", "Pancreatic enzyme for pancreatitis", cat, TestType.BIOCHEMISTRY, new BigDecimal("249"), false, null, 4, "30-110 U/L", "U/L"));
        tests.add(createTest("SPC017", "Lipase, Serum", "Specific pancreatic enzyme for pancreatitis", cat, TestType.BIOCHEMISTRY, new BigDecimal("299"), false, null, 4, "0-160 U/L", "U/L"));
        tests.add(createTest("SPC018", "Cholinesterase (Pseudocholinesterase)", "Liver function and organophosphate exposure", cat, TestType.BIOCHEMISTRY, new BigDecimal("499"), false, null, 24, "4,620-11,500 U/L", "U/L"));
        tests.add(createTest("SPC019", "ACE (Angiotensin Converting Enzyme)", "Sarcoidosis marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("799"), false, null, 48, "8-52 U/L", "U/L"));
        tests.add(createTest("SPC020", "Parathyroid Hormone (PTH)", "Calcium metabolism regulator", cat, TestType.BIOCHEMISTRY, new BigDecimal("899"), false, null, 24, "15-65 pg/mL", "pg/mL"));

        // Additional Special Chemistry Tests
        tests.add(createTest("SPC021", "PTH-related Protein (PTHrP)", "Humoral hypercalcemia of malignancy", cat, TestType.BIOCHEMISTRY, new BigDecimal("1499"), false, null, 72, "<2.0 pmol/L", "pmol/L"));
        tests.add(createTest("SPC022", "Gastrin, Fasting", "Zollinger-Ellison syndrome marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("999"), false, null, 72, "<100 pg/mL", "pg/mL"));
        tests.add(createTest("SPC023", "Pepsinogen I and II", "Gastric atrophy markers", cat, TestType.BIOCHEMISTRY, new BigDecimal("1199"), false, null, 72, "See detailed report", "ng/mL"));
        tests.add(createTest("SPC024", "Intrinsic Factor Antibodies", "Pernicious anemia marker", cat, TestType.IMMUNOLOGY, new BigDecimal("999"), false, null, 72, "Negative", "qualitative"));
        tests.add(createTest("SPC025", "Parietal Cell Antibodies", "Autoimmune gastritis marker", cat, TestType.IMMUNOLOGY, new BigDecimal("899"), false, null, 72, "Negative", "titer"));
        tests.add(createTest("SPC026", "Anti-Tissue Transglutaminase IgA", "Celiac disease screening", cat, TestType.IMMUNOLOGY, new BigDecimal("799"), false, null, 48, "<20 U/mL", "U/mL"));
        tests.add(createTest("SPC027", "Anti-Endomysial Antibodies", "Celiac disease confirmation", cat, TestType.IMMUNOLOGY, new BigDecimal("999"), false, null, 72, "Negative", "titer"));
        tests.add(createTest("SPC028", "Anti-Gliadin Antibodies IgA/IgG", "Gluten sensitivity markers", cat, TestType.IMMUNOLOGY, new BigDecimal("899"), false, null, 48, "See detailed report", "U/mL"));
        tests.add(createTest("SPC029", "Celiac Disease Panel", "tTG, EMA, Gliadin antibodies", cat, TestType.IMMUNOLOGY, new BigDecimal("1999"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("SPC030", "Calprotectin, Fecal", "Intestinal inflammation marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("1499"), false, null, 72, "<50 mcg/g", "mcg/g"));
        tests.add(createTest("SPC031", "Lactoferrin, Fecal", "Bowel inflammation marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("999"), false, null, 48, "<7.3 mcg/g", "mcg/g"));
        tests.add(createTest("SPC032", "Pancreatic Elastase, Fecal", "Exocrine pancreatic function", cat, TestType.BIOCHEMISTRY, new BigDecimal("1299"), false, null, 72, ">200 mcg/g normal", "mcg/g"));
        tests.add(createTest("SPC033", "Fat, Fecal (72hr)", "Malabsorption assessment", cat, TestType.BIOCHEMISTRY, new BigDecimal("799"), false, null, 96, "<7 g/day", "g/day"));
        tests.add(createTest("SPC034", "Lactose Tolerance Test", "Lactase deficiency assessment", cat, TestType.BIOCHEMISTRY, new BigDecimal("499"), false, null, 4, ">20 mg/dL rise", "mg/dL"));
        tests.add(createTest("SPC035", "Xylose Absorption Test", "Small bowel absorption test", cat, TestType.BIOCHEMISTRY, new BigDecimal("699"), false, null, 6, ">25 mg/dL at 1hr", "mg/dL"));
        tests.add(createTest("SPC036", "ASCA (Anti-Saccharomyces)", "Crohn's disease marker", cat, TestType.IMMUNOLOGY, new BigDecimal("999"), false, null, 72, "Negative", "U/mL"));
        tests.add(createTest("SPC037", "pANCA (IBD)", "Ulcerative colitis marker", cat, TestType.IMMUNOLOGY, new BigDecimal("999"), false, null, 72, "Negative", "titer"));
        tests.add(createTest("SPC038", "IBD Differentiation Panel", "ASCA, pANCA for IBD typing", cat, TestType.IMMUNOLOGY, new BigDecimal("1999"), false, null, 96, "See detailed report", "multiple"));
        tests.add(createTest("SPC039", "Serum Tryptase", "Mast cell activation/mastocytosis", cat, TestType.BIOCHEMISTRY, new BigDecimal("999"), false, null, 48, "<11.4 ng/mL", "ng/mL"));
        tests.add(createTest("SPC040", "Histamine, Plasma", "Allergic reaction marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("899"), false, null, 48, "<10 nmol/L", "nmol/L"));

        // Pulmonary Function Related
        tests.add(createTest("SPC041", "Alpha-1 Antitrypsin Phenotype", "AAT genetic variants", cat, TestType.BIOCHEMISTRY, new BigDecimal("1499"), false, null, 120, "PiMM normal", "phenotype"));
        tests.add(createTest("SPC042", "Arterial Blood Gas (ABG)", "Blood oxygen and acid-base status", cat, TestType.BIOCHEMISTRY, new BigDecimal("599"), false, null, 1, "See detailed report", "multiple"));
        tests.add(createTest("SPC043", "Venous Blood Gas (VBG)", "Venous oxygen and CO2 assessment", cat, TestType.BIOCHEMISTRY, new BigDecimal("399"), false, null, 1, "See detailed report", "multiple"));
        tests.add(createTest("SPC044", "Carboxyhemoglobin", "Carbon monoxide poisoning assessment", cat, TestType.BIOCHEMISTRY, new BigDecimal("399"), false, null, 2, "<3% non-smoker", "%"));
        tests.add(createTest("SPC045", "Methemoglobin", "Methemoglobinemia assessment", cat, TestType.BIOCHEMISTRY, new BigDecimal("399"), false, null, 2, "<1%", "%"));

        // Bone and Mineral
        tests.add(createTest("SPC046", "Osteocalcin", "Bone formation marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("999"), false, null, 72, "See age/gender norms", "ng/mL"));
        tests.add(createTest("SPC047", "Bone Specific ALP", "Bone formation marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("899"), false, null, 48, "See age/gender norms", "U/L"));
        tests.add(createTest("SPC048", "P1NP (Procollagen I N-Propeptide)", "Bone formation marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("1199"), false, null, 72, "See age/gender norms", "ng/mL"));
        tests.add(createTest("SPC049", "CTX (C-Telopeptide)", "Bone resorption marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("1199"), false, null, 72, "See age/gender norms", "pg/mL"));
        tests.add(createTest("SPC050", "Bone Turnover Panel", "P1NP, CTX, Osteocalcin, Vitamin D", cat, TestType.BIOCHEMISTRY, new BigDecimal("2999"), false, null, 96, "See detailed report", "multiple"));

        // Cardiac Specialized
        tests.add(createTest("SPC051", "BNP (B-Type Natriuretic Peptide)", "Heart failure marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("1299"), false, null, 4, "<100 pg/mL", "pg/mL"));
        tests.add(createTest("SPC052", "Galectin-3", "Heart failure prognosis marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("1999"), false, null, 72, "<17.8 ng/mL", "ng/mL"));
        tests.add(createTest("SPC053", "ST2 (sST2)", "Cardiac remodeling marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("1999"), false, null, 72, "<35 ng/mL", "ng/mL"));
        tests.add(createTest("SPC054", "GDF-15", "Cardiac and metabolic stress marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("1499"), false, null, 72, "<1200 pg/mL", "pg/mL"));
        tests.add(createTest("SPC055", "Heart Failure Biomarker Panel", "BNP, ST2, Galectin-3", cat, TestType.BIOCHEMISTRY, new BigDecimal("4999"), false, null, 96, "See detailed report", "multiple"));

        // Oxidative Stress and Inflammation
        tests.add(createTest("SPC056", "Malondialdehyde (MDA)", "Lipid peroxidation marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("999"), false, null, 72, "See reference", "nmol/mL"));
        tests.add(createTest("SPC057", "8-OHdG", "DNA oxidative damage marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("1499"), false, null, 96, "See reference", "ng/mL"));
        tests.add(createTest("SPC058", "Glutathione (GSH)", "Antioxidant status marker", cat, TestType.BIOCHEMISTRY, new BigDecimal("999"), false, null, 48, "See reference", "µmol/L"));
        tests.add(createTest("SPC059", "Total Antioxidant Capacity", "Overall antioxidant status", cat, TestType.BIOCHEMISTRY, new BigDecimal("999"), false, null, 48, "See reference", "mmol/L"));
        tests.add(createTest("SPC060", "IL-6 (Interleukin-6)", "Pro-inflammatory cytokine", cat, TestType.IMMUNOLOGY, new BigDecimal("1499"), false, null, 72, "<7 pg/mL", "pg/mL"));
        tests.add(createTest("SPC061", "TNF-alpha", "Pro-inflammatory cytokine", cat, TestType.IMMUNOLOGY, new BigDecimal("1499"), false, null, 72, "<8.1 pg/mL", "pg/mL"));
        tests.add(createTest("SPC062", "IL-1 beta", "Inflammatory cytokine", cat, TestType.IMMUNOLOGY, new BigDecimal("1499"), false, null, 72, "<5 pg/mL", "pg/mL"));
        tests.add(createTest("SPC063", "Cytokine Panel (6 markers)", "Multiple inflammatory cytokines", cat, TestType.IMMUNOLOGY, new BigDecimal("4999"), false, null, 120, "See detailed report", "multiple"));
        tests.add(createTest("SPC064", "Oxidative Stress Panel", "MDA, GSH, TAC, 8-OHdG", cat, TestType.BIOCHEMISTRY, new BigDecimal("3999"), false, null, 120, "See detailed report", "multiple"));
        tests.add(createTest("SPC065", "Inflammation Panel Advanced", "hs-CRP, IL-6, TNF-alpha, Fibrinogen", cat, TestType.IMMUNOLOGY, new BigDecimal("3499"), false, null, 96, "See detailed report", "multiple"));

        // Lymphocyte Subsets
        tests.add(createTest("SPC066", "CD4 Count (Absolute)", "Helper T-cell count for HIV monitoring", cat, TestType.IMMUNOLOGY, new BigDecimal("1499"), false, null, 48, "500-1500 cells/mcL", "cells/mcL"));
        tests.add(createTest("SPC067", "CD8 Count", "Cytotoxic T-cell count", cat, TestType.IMMUNOLOGY, new BigDecimal("1299"), false, null, 48, "150-1000 cells/mcL", "cells/mcL"));
        tests.add(createTest("SPC068", "CD4/CD8 Ratio", "T-cell subset ratio", cat, TestType.IMMUNOLOGY, new BigDecimal("1799"), false, null, 48, "1.0-3.6", "ratio"));
        tests.add(createTest("SPC069", "Lymphocyte Subset Panel (Basic)", "CD3, CD4, CD8, CD19, CD56", cat, TestType.IMMUNOLOGY, new BigDecimal("3999"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("SPC070", "Lymphocyte Subset Panel (Extended)", "Full T, B, NK cell phenotyping", cat, TestType.IMMUNOLOGY, new BigDecimal("6999"), false, null, 120, "See detailed report", "multiple"));

        return tests;
    }

    // ==================== WELLNESS PACKAGES ====================

    private List<LabTest> createBasicHealthCheckups() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("WELLNESS");

        tests.add(createTest("WEL001", "Basic Health Checkup", "CBC, FBS, Lipid Profile, LFT, KFT, Urinalysis", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("1499"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("WEL002", "Essential Health Checkup", "Basic + Thyroid, HbA1c, Vitamin D, B12", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("2999"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("WEL003", "Complete Health Checkup", "Essential + Cardiac Markers, Iron Studies, Uric Acid", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("4999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("WEL004", "Premium Health Checkup", "Complete + Tumor Markers, Hormone Panel, ECG, X-Ray", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("7999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("WEL005", "Comprehensive Health Checkup", "Premium + Ultrasound Abdomen, TMT, 2D Echo", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("12999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("WEL006", "Annual Health Screening", "Full body checkup with imaging and cardiac assessment", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("9999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("WEL007", "Pre-Employment Health Check", "Standard health clearance for employment", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2499"), true, 12, 48, "Fit for duty", "qualitative"));
        tests.add(createTest("WEL008", "Pre-Marital Health Screening", "Blood group, Thalassemia, STD panel, Fertility basics", cat, TestType.HEALTH_CHECKUP, new BigDecimal("4999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("WEL009", "Pre-Operative Screening", "CBC, Coagulation, Metabolic Panel, ECG, Chest X-Ray", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3499"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("WEL010", "Insurance Health Checkup", "Standard health checkup for insurance purposes", cat, TestType.HEALTH_CHECKUP, new BigDecimal("1999"), true, 12, 48, "See detailed report", "multiple"));

        return tests;
    }

    private List<LabTest> createExecutiveHealthPackages() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("WELLNESS");

        tests.add(createTest("EXE001", "Executive Health Checkup (Male)", "Comprehensive screening for corporate executives", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("14999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("EXE002", "Executive Health Checkup (Female)", "Comprehensive screening with women-specific tests", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("16999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("EXE003", "CEO Health Package", "Ultra-comprehensive health assessment with all imaging", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("49999"), true, 12, 96, "See detailed report", "multiple"));
        tests.add(createTest("EXE004", "Platinum Health Assessment", "Most comprehensive checkup with genetic screening", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("99999"), true, 12, 168, "See detailed report", "multiple"));
        tests.add(createTest("EXE005", "Corporate Wellness Package", "Group health screening for organizations", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("EXE006", "Lifestyle Disease Panel", "Diabetes, hypertension, cardiac risk assessment", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("5999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("EXE007", "Stress Management Assessment", "Cortisol, thyroid, vitamins, lifestyle markers", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("4999"), true, 8, 48, "See detailed report", "multiple"));
        tests.add(createTest("EXE008", "IT Professional Health Package", "Eye strain, posture, stress-related tests", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("3999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("EXE009", "Frequent Traveler Health Check", "Travel-related immunity and fitness assessment", cat, TestType.HEALTH_CHECKUP, new BigDecimal("4999"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("EXE010", "Post-COVID Recovery Assessment", "Complete health assessment after COVID recovery", cat, TestType.HEALTH_CHECKUP, new BigDecimal("5999"), true, 12, 72, "See detailed report", "multiple"));

        return tests;
    }

    private List<LabTest> createWomensHealthTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("WELLNESS");

        tests.add(createTest("WMN001", "Women's Basic Health Package", "CBC, Thyroid, Vitamin D, B12, Iron, Urinalysis", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("2499"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("WMN002", "Women's Complete Health Package", "Basic + Hormone panel, Pap smear, Mammogram", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("7999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("WMN003", "Women's Premium Health Package", "Complete + Bone density, Ultrasound, Advanced lipids", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("14999"), true, 12, 96, "See detailed report", "multiple"));
        tests.add(createTest("WMN004", "Fertility Assessment Panel (Female)", "AMH, FSH, LH, Estradiol, Prolactin, Thyroid, USG", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("5999"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("WMN005", "PCOS Screening Package", "Hormones, glucose, insulin, lipids, ultrasound", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("4999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("WMN006", "Pregnancy Planning Package", "Pre-conception health assessment and immunity", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("WMN007", "Antenatal Screening (First Trimester)", "Complete first trimester pregnancy tests", cat, TestType.HEALTH_CHECKUP, new BigDecimal("4999"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("WMN008", "Antenatal Screening (Second Trimester)", "Mid-pregnancy health assessment", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3499"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("WMN009", "Antenatal Complete Package", "All pregnancy tests throughout trimesters", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("14999"), false, null, 168, "See detailed report", "multiple"));
        tests.add(createTest("WMN010", "Menopause Assessment Panel", "Hormone levels, bone density, cardiovascular risk", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("5999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("WMN011", "Breast Health Screening", "Mammography, breast ultrasound, tumor markers", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("4999"), false, null, 24, "See detailed report", "qualitative"));
        tests.add(createTest("WMN012", "Cervical Cancer Screening", "Pap smear, HPV test, colposcopy if needed", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("2999"), false, null, 96, "See detailed report", "qualitative"));
        tests.add(createTest("WMN013", "Osteoporosis Screening", "DEXA scan, calcium, vitamin D, bone markers", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("4499"), false, null, 24, "See detailed report", "T-score"));
        tests.add(createTest("WMN014", "Women Over 40 Package", "Age-appropriate comprehensive screening", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("9999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("WMN015", "Women Over 50 Package", "Extended screening including cancer markers", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("12999"), true, 12, 96, "See detailed report", "multiple"));

        return tests;
    }

    private List<LabTest> createMensHealthTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("WELLNESS");

        tests.add(createTest("MEN001", "Men's Basic Health Package", "CBC, Lipid, LFT, KFT, FBS, Thyroid, Urinalysis", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("2499"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("MEN002", "Men's Complete Health Package", "Basic + PSA, Testosterone, Vitamin D, B12, HbA1c", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("5999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("MEN003", "Men's Premium Health Package", "Complete + Cardiac markers, Ultrasound, ECG, TMT", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("12999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("MEN004", "Fertility Assessment Panel (Male)", "Semen analysis, hormones, infection screen, ultrasound", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("4999"), true, 3, 72, "See detailed report", "multiple"));
        tests.add(createTest("MEN005", "Prostate Health Screening", "PSA, free PSA, prostate ultrasound, urinalysis", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("2999"), false, null, 24, "See detailed report", "multiple"));
        tests.add(createTest("MEN006", "Testosterone Optimization Panel", "Total, Free Testosterone, SHBG, Estradiol, DHEA-S", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("3999"), true, 8, 48, "See detailed report", "multiple"));
        tests.add(createTest("MEN007", "Cardiac Risk Assessment (Male)", "Advanced lipids, hs-CRP, Homocysteine, CT Calcium Score", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("8999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("MEN008", "Men's Sexual Health Panel", "Hormones, PSA, glucose, lipids, infection screen", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("4999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("MEN009", "Athlete Health Assessment (Male)", "Fitness, nutrition, hormone, injury prevention", cat, TestType.HEALTH_CHECKUP, new BigDecimal("6999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("MEN010", "Men Over 40 Package", "Age-appropriate comprehensive screening with PSA", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("7999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("MEN011", "Men Over 50 Package", "Extended screening with cancer markers and cardiac", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("12999"), true, 12, 96, "See detailed report", "multiple"));
        tests.add(createTest("MEN012", "Hair Loss Assessment", "Hormone panel, iron, thyroid, scalp analysis", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("MEN013", "Bodybuilder Health Panel", "Liver, kidney, hormones, lipids for steroid users", cat, TestType.HEALTH_CHECKUP, new BigDecimal("4999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("MEN014", "Executive Male Health", "Comprehensive with stress and lifestyle assessment", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("14999"), true, 12, 96, "See detailed report", "multiple"));
        tests.add(createTest("MEN015", "Heart Health Screening (Male)", "ECG, Echo, TMT, advanced lipids, cardiac markers", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("7999"), true, 12, 48, "See detailed report", "multiple"));

        return tests;
    }

    private List<LabTest> createSeniorCitizenTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("WELLNESS");

        tests.add(createTest("SEN001", "Senior Citizen Basic Health Check (60+)", "Essential health screening for elderly", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("2999"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("SEN002", "Senior Citizen Complete Health Check", "Comprehensive screening with bone and cardiac", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("7999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("SEN003", "Senior Citizen Premium Health Check", "Full body checkup with all imaging", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("14999"), true, 12, 96, "See detailed report", "multiple"));
        tests.add(createTest("SEN004", "Arthritis and Joint Health Panel", "RA factor, Anti-CCP, uric acid, inflammatory markers", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2999"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("SEN005", "Memory and Cognitive Health Panel", "Vitamin B12, thyroid, metabolic, homocysteine", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3499"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("SEN006", "Diabetes Care Package (Elderly)", "HbA1c, lipid, kidney, eye, foot screening", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("4999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("SEN007", "Cardiac Care Package (Elderly)", "ECG, Echo, lipids, cardiac markers, chest X-ray", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("6999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("SEN008", "Vision Health Screening", "Eye checkup, glaucoma, cataract, retina assessment", cat, TestType.HEALTH_CHECKUP, new BigDecimal("1999"), false, null, 4, "See detailed report", "qualitative"));
        tests.add(createTest("SEN009", "Hearing Health Screening", "Audiometry, ear examination", cat, TestType.HEALTH_CHECKUP, new BigDecimal("999"), false, null, 2, "See detailed report", "dB"));
        tests.add(createTest("SEN010", "Fall Risk Assessment", "Balance, bone density, vision, medication review", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3999"), false, null, 48, "See detailed report", "qualitative"));
        tests.add(createTest("SEN011", "Cancer Screening (Senior)", "Age-appropriate cancer marker screening", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("4999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("SEN012", "Nutritional Deficiency Panel (Senior)", "Vitamins, minerals, protein status assessment", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("SEN013", "Caregiver Health Assessment", "Health check for family caregivers", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("SEN014", "Senior Citizen Wellness (Male 70+)", "Extended screening for older men", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("9999"), true, 12, 96, "See detailed report", "multiple"));
        tests.add(createTest("SEN015", "Senior Citizen Wellness (Female 70+)", "Extended screening for older women", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("9999"), true, 12, 96, "See detailed report", "multiple"));

        return tests;
    }

    private List<LabTest> createPreventiveScreenings() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("WELLNESS");

        tests.add(createTest("PRV001", "Cancer Screening Panel (Male)", "PSA, CEA, AFP, tumor markers comprehensive", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("4999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("PRV002", "Cancer Screening Panel (Female)", "CA125, CA15-3, CEA, Pap smear, mammogram", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("5999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("PRV003", "Colorectal Cancer Screening", "FIT test, colonoscopy if indicated, CEA", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("3999"), true, 12, 48, "See detailed report", "qualitative"));
        tests.add(createTest("PRV004", "Lung Cancer Screening", "Low-dose CT chest for high-risk individuals", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("4999"), false, null, 24, "See detailed report", "qualitative"));
        tests.add(createTest("PRV005", "Liver Cancer Surveillance", "AFP, ultrasound, liver function for HBV/HCV patients", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("3499"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("PRV006", "Skin Cancer Screening", "Dermatology examination, dermoscopy", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("1999"), false, null, 4, "See detailed report", "qualitative"));
        tests.add(createTest("PRV007", "Oral Cancer Screening", "Oral examination, biopsy if needed", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("999"), false, null, 4, "See detailed report", "qualitative"));
        tests.add(createTest("PRV008", "Cardiovascular Risk Assessment", "Framingham score, advanced lipids, hs-CRP, CT calcium", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("6999"), true, 12, 48, "See detailed report", "% risk"));
        tests.add(createTest("PRV009", "Stroke Risk Assessment", "Carotid doppler, lipids, homocysteine, coagulation", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("5999"), true, 12, 48, "See detailed report", "% risk"));
        tests.add(createTest("PRV010", "Diabetes Risk Assessment", "FBS, HbA1c, insulin, HOMA-IR, genetic markers", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("3999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("PRV011", "Metabolic Syndrome Screening", "Waist, BP, lipids, glucose, inflammatory markers", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("2999"), true, 12, 24, "See detailed report", "qualitative"));
        tests.add(createTest("PRV012", "Hepatitis Screening Panel", "HBsAg, Anti-HCV, Anti-HAV, liver function", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("2499"), false, null, 48, "See detailed report", "qualitative"));
        tests.add(createTest("PRV013", "STD Comprehensive Screening", "HIV, Hepatitis, Syphilis, Herpes, Chlamydia, Gonorrhea", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("4999"), false, null, 72, "See detailed report", "qualitative"));
        tests.add(createTest("PRV014", "Thyroid Disorder Screening", "TSH, T3, T4, antibodies, ultrasound", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("2999"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("PRV015", "Kidney Disease Screening", "eGFR, microalbumin, urinalysis, ultrasound", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("2999"), false, null, 24, "See detailed report", "multiple"));
        tests.add(createTest("PRV016", "Liver Health Screening", "LFT, hepatitis panel, ultrasound, FibroScan if needed", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("3999"), true, 10, 48, "See detailed report", "multiple"));
        tests.add(createTest("PRV017", "Autoimmune Disease Screening", "ANA, RF, CRP, ESR, complement levels", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("3999"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("PRV018", "Allergy Comprehensive Screening", "Total IgE, specific IgE panels (food and inhalants)", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("6999"), false, null, 96, "See detailed report", "kU/L"));
        tests.add(createTest("PRV019", "Vitamin and Mineral Assessment", "Complete nutritional status evaluation", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("4999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("PRV020", "Whole Body Health Screening", "Ultimate comprehensive health assessment", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("24999"), true, 12, 120, "See detailed report", "multiple"));

        // Additional Preventive Screenings
        tests.add(createTest("PRV021", "Bone Health Assessment", "DEXA scan, calcium, vitamin D, bone markers, parathyroid", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("5999"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("PRV022", "Sleep Disorder Screening", "Sleep questionnaire, pulse oximetry, referral for PSG", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("1999"), false, null, 24, "See detailed report", "qualitative"));
        tests.add(createTest("PRV023", "Gut Health Assessment", "Stool analysis, gut microbiome, inflammatory markers", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("4999"), false, null, 120, "See detailed report", "multiple"));
        tests.add(createTest("PRV024", "Mental Wellness Screening", "Psychological assessment, stress markers, neurotransmitters", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("3999"), false, null, 72, "See detailed report", "qualitative"));
        tests.add(createTest("PRV025", "Eye Health Screening", "Vision test, glaucoma, cataract, retinal examination", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("1999"), false, null, 4, "See detailed report", "qualitative"));
        tests.add(createTest("PRV026", "Dental Health Checkup", "Oral examination, X-ray, cleaning, gum assessment", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("1499"), false, null, 4, "See detailed report", "qualitative"));
        tests.add(createTest("PRV027", "Respiratory Health Screening", "Pulmonary function test, chest X-ray, SpO2", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("2999"), false, null, 24, "See detailed report", "multiple"));
        tests.add(createTest("PRV028", "Neurological Health Screening", "Cognitive assessment, nerve conduction, MRI brain", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("12999"), false, null, 96, "See detailed report", "multiple"));
        tests.add(createTest("PRV029", "Anti-Aging Assessment", "Hormones, antioxidants, telomere length, inflammation", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("14999"), true, 12, 168, "See detailed report", "multiple"));
        tests.add(createTest("PRV030", "Weight Management Assessment", "Metabolic rate, body composition, hormones, genetics", cat, TestType.PREVENTIVE_SCREENING, new BigDecimal("5999"), true, 12, 72, "See detailed report", "multiple"));

        // Occupation-specific Screenings
        tests.add(createTest("OCC001", "Driver Medical Fitness", "Vision, hearing, reflexes, drug screen, general health", cat, TestType.HEALTH_CHECKUP, new BigDecimal("1999"), true, 12, 24, "Fit to drive", "qualitative"));
        tests.add(createTest("OCC002", "Pilot Medical Examination", "Aviation medical standards assessment", cat, TestType.HEALTH_CHECKUP, new BigDecimal("4999"), true, 12, 48, "Fit to fly", "qualitative"));
        tests.add(createTest("OCC003", "Food Handler Certificate", "Stool culture, hepatitis, typhoid, health clearance", cat, TestType.HEALTH_CHECKUP, new BigDecimal("999"), false, null, 72, "Clear", "qualitative"));
        tests.add(createTest("OCC004", "Construction Worker Health Check", "Lung function, hearing, musculoskeletal, drug screen", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2499"), true, 12, 48, "Fit for work", "qualitative"));
        tests.add(createTest("OCC005", "Healthcare Worker Screening", "Hepatitis, TB, immunity status, blood-borne pathogens", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3499"), false, null, 72, "Clear", "qualitative"));
        tests.add(createTest("OCC006", "Offshore Worker Medical", "Comprehensive medical for remote work environments", cat, TestType.HEALTH_CHECKUP, new BigDecimal("5999"), true, 12, 96, "Fit for offshore", "qualitative"));
        tests.add(createTest("OCC007", "Merchant Navy Medical", "Maritime medical fitness examination", cat, TestType.HEALTH_CHECKUP, new BigDecimal("4999"), true, 12, 72, "Fit for sea duty", "qualitative"));
        tests.add(createTest("OCC008", "Mining Worker Health Check", "Respiratory, hearing, fitness for underground work", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3499"), true, 12, 48, "Fit for mining", "qualitative"));
        tests.add(createTest("OCC009", "Chemical Industry Health Check", "Exposure monitoring, organ function, toxicology", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3999"), true, 12, 72, "Clear", "qualitative"));
        tests.add(createTest("OCC010", "Teacher Health Certificate", "General health, TB status, communicable diseases", cat, TestType.HEALTH_CHECKUP, new BigDecimal("1499"), false, null, 48, "Clear", "qualitative"));

        // Age-specific Screenings
        tests.add(createTest("AGE001", "Adolescent Health Check (13-19)", "Growth, hormones, nutrition, mental health screening", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2499"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("AGE002", "Young Adult Screening (20-29)", "Baseline health, STD, fertility, lifestyle assessment", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("AGE003", "Middle Age Check (30-39)", "Cardiac risk, metabolic, cancer markers beginning", cat, TestType.HEALTH_CHECKUP, new BigDecimal("4999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("AGE004", "Pre-Senior Check (40-49)", "Comprehensive with colonoscopy indication", cat, TestType.HEALTH_CHECKUP, new BigDecimal("6999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("AGE005", "Senior Onset Check (50-59)", "Enhanced cancer screening, cardiac, cognitive", cat, TestType.HEALTH_CHECKUP, new BigDecimal("8999"), true, 12, 96, "See detailed report", "multiple"));
        tests.add(createTest("AGE006", "Senior Health Check (60-69)", "Geriatric assessment, fall risk, memory", cat, TestType.HEALTH_CHECKUP, new BigDecimal("9999"), true, 12, 96, "See detailed report", "multiple"));
        tests.add(createTest("AGE007", "Elderly Health Check (70+)", "Comprehensive geriatric evaluation", cat, TestType.HEALTH_CHECKUP, new BigDecimal("11999"), true, 12, 120, "See detailed report", "multiple"));
        tests.add(createTest("AGE008", "Pediatric Health Check (0-5)", "Growth, development, vaccination, nutrition", cat, TestType.HEALTH_CHECKUP, new BigDecimal("1999"), false, null, 24, "See detailed report", "multiple"));
        tests.add(createTest("AGE009", "Child Health Check (6-12)", "Growth, vision, hearing, school readiness", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2499"), false, null, 48, "See detailed report", "multiple"));
        tests.add(createTest("AGE010", "Newborn Screening Panel", "Metabolic disorders, hearing, cardiac defects", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2999"), false, null, 168, "See detailed report", "multiple"));

        // Sport and Fitness Screenings
        tests.add(createTest("FIT001", "Pre-Sports Participation Exam", "Cardiac clearance for sports activities", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3999"), true, 12, 48, "Fit for sports", "qualitative"));
        tests.add(createTest("FIT002", "Marathon Runner Assessment", "Cardiac stress test, metabolic, hydration status", cat, TestType.HEALTH_CHECKUP, new BigDecimal("5999"), true, 12, 72, "See detailed report", "multiple"));
        tests.add(createTest("FIT003", "Gym Fitness Assessment", "Body composition, metabolic rate, strength baseline", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2999"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("FIT004", "Swimmer Health Check", "ENT, skin, lung function, infection screen", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2499"), false, null, 48, "Fit for swimming", "qualitative"));
        tests.add(createTest("FIT005", "Yoga Practitioner Assessment", "Flexibility, respiratory, cardiovascular", cat, TestType.HEALTH_CHECKUP, new BigDecimal("1999"), false, null, 24, "See detailed report", "qualitative"));
        tests.add(createTest("FIT006", "Mountaineer Health Clearance", "High altitude fitness, cardiac, respiratory", cat, TestType.HEALTH_CHECKUP, new BigDecimal("6999"), true, 12, 72, "Fit for altitude", "qualitative"));
        tests.add(createTest("FIT007", "Scuba Diver Medical", "Pressure tolerance, ENT, cardiac, respiratory", cat, TestType.HEALTH_CHECKUP, new BigDecimal("4999"), true, 12, 48, "Fit for diving", "qualitative"));
        tests.add(createTest("FIT008", "Weight Training Assessment", "Hormone levels, cardiac, muscle/bone health", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("FIT009", "Cyclist Health Check", "Cardiac, respiratory, bone density, flexibility", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3499"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("FIT010", "Combat Sports Medical", "Neurological, cardiac, bone, blood screen", cat, TestType.HEALTH_CHECKUP, new BigDecimal("4999"), true, 12, 72, "Fit for combat sports", "qualitative"));

        // Travel Health
        tests.add(createTest("TRV001", "Pre-Travel Health Assessment", "Vaccination status, fitness for travel, prophylaxis", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2999"), false, null, 24, "Fit for travel", "qualitative"));
        tests.add(createTest("TRV002", "Tropical Travel Health Screen", "Malaria, yellow fever, typhoid, hepatitis immunity", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3999"), false, null, 72, "See detailed report", "multiple"));
        tests.add(createTest("TRV003", "Post-Travel Health Check", "Infection screening after tropical travel", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2999"), false, null, 72, "Clear", "qualitative"));
        tests.add(createTest("TRV004", "Hajj/Umrah Health Package", "Meningitis vaccine, respiratory, cardiac clearance", cat, TestType.HEALTH_CHECKUP, new BigDecimal("3499"), false, null, 48, "Fit for travel", "qualitative"));
        tests.add(createTest("TRV005", "Visa Medical Examination", "Country-specific health requirements", cat, TestType.HEALTH_CHECKUP, new BigDecimal("2499"), true, 12, 48, "Medically fit", "qualitative"));

        // Specialty Wellness
        tests.add(createTest("SPW001", "Detox Assessment Panel", "Liver, kidney function, toxin markers", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("3999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("SPW002", "Longevity Panel", "Telomere, inflammation, hormones, antioxidants", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("19999"), true, 12, 168, "See detailed report", "multiple"));
        tests.add(createTest("SPW003", "Biohacker Panel", "Advanced biomarkers for optimization", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("14999"), true, 12, 120, "See detailed report", "multiple"));
        tests.add(createTest("SPW004", "Vegan Health Check", "B12, iron, protein, bone, specific deficiencies", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("2999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("SPW005", "Keto Diet Assessment", "Ketone levels, lipids, kidney, electrolytes", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("2499"), true, 12, 24, "See detailed report", "multiple"));
        tests.add(createTest("SPW006", "Intermittent Fasting Health Check", "Metabolic markers, hormones, glucose regulation", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("2999"), true, 12, 48, "See detailed report", "multiple"));
        tests.add(createTest("SPW007", "Gut-Brain Axis Assessment", "Gut microbiome, neurotransmitters, inflammation", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("7999"), false, null, 168, "See detailed report", "multiple"));
        tests.add(createTest("SPW008", "Hormonal Balance Assessment", "Complete hormone panel with lifestyle analysis", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("5999"), true, 8, 72, "See detailed report", "multiple"));
        tests.add(createTest("SPW009", "Immune System Assessment", "Immunoglobulins, lymphocyte subsets, cytokines", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("6999"), false, null, 96, "See detailed report", "multiple"));
        tests.add(createTest("SPW010", "Energy and Fatigue Panel", "Thyroid, adrenal, mitochondrial function markers", cat, TestType.WELLNESS_PACKAGE, new BigDecimal("4999"), true, 8, 72, "See detailed report", "multiple"));

        return tests;
    }

    // ==================== STD PANEL TESTS ====================

    private List<LabTest> createSTDTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("STD");

        tests.add(createTest("STD001", "HIV 1 & 2 Antibody Test", "Screening for HIV infection using ELISA method", cat, TestType.SEROLOGY, new BigDecimal("599"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("STD002", "HIV RNA PCR (Viral Load)", "Quantitative HIV viral load measurement", cat, TestType.MOLECULAR, new BigDecimal("3999"), false, null, 72, "<20 copies/mL", "copies/mL"));
        tests.add(createTest("STD003", "HIV p24 Antigen", "Early detection of HIV infection", cat, TestType.SEROLOGY, new BigDecimal("999"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("STD004", "HIV Combo (4th Gen)", "Combined HIV antigen and antibody test", cat, TestType.SEROLOGY, new BigDecimal("799"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("STD005", "CD4 Count", "Immune status monitoring for HIV patients", cat, TestType.HEMATOLOGY, new BigDecimal("1499"), false, null, 24, "500-1500 cells/mcL", "cells/mcL"));
        tests.add(createTest("STD006", "CD4/CD8 Ratio", "Immune function assessment", cat, TestType.HEMATOLOGY, new BigDecimal("1999"), false, null, 24, "1.0-3.5", "ratio"));
        tests.add(createTest("STD007", "Hepatitis B Surface Antigen (HBsAg)", "Active Hepatitis B infection screening", cat, TestType.SEROLOGY, new BigDecimal("399"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("STD008", "Hepatitis B Surface Antibody (Anti-HBs)", "Immunity to Hepatitis B", cat, TestType.SEROLOGY, new BigDecimal("499"), false, null, 24, ">10 mIU/mL (immune)", "mIU/mL"));
        tests.add(createTest("STD009", "Hepatitis B Core Antibody (Anti-HBc)", "Past or present HBV infection marker", cat, TestType.SEROLOGY, new BigDecimal("499"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("STD010", "Hepatitis B e Antigen (HBeAg)", "Hepatitis B viral replication marker", cat, TestType.SEROLOGY, new BigDecimal("599"), false, null, 24, "Negative", "qualitative"));
        tests.add(createTest("STD011", "Hepatitis B DNA PCR", "Quantitative HBV viral load", cat, TestType.MOLECULAR, new BigDecimal("3499"), false, null, 72, "Undetectable", "IU/mL"));
        tests.add(createTest("STD012", "Hepatitis C Antibody (Anti-HCV)", "Hepatitis C screening test", cat, TestType.SEROLOGY, new BigDecimal("699"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("STD013", "Hepatitis C RNA PCR", "Quantitative HCV viral load", cat, TestType.MOLECULAR, new BigDecimal("4999"), false, null, 72, "Undetectable", "IU/mL"));
        tests.add(createTest("STD014", "HCV Genotype", "Hepatitis C virus genotyping for treatment", cat, TestType.MOLECULAR, new BigDecimal("5999"), false, null, 120, "See report", "type"));
        tests.add(createTest("STD015", "Syphilis VDRL", "Non-treponemal syphilis screening", cat, TestType.SEROLOGY, new BigDecimal("199"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("STD016", "Syphilis TPHA", "Treponemal syphilis confirmation", cat, TestType.SEROLOGY, new BigDecimal("399"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("STD017", "Syphilis RPR", "Rapid plasma reagin syphilis test", cat, TestType.SEROLOGY, new BigDecimal("249"), false, null, 24, "Non-reactive", "qualitative"));
        tests.add(createTest("STD018", "Syphilis FTA-ABS", "Fluorescent treponemal antibody confirmation", cat, TestType.SEROLOGY, new BigDecimal("799"), false, null, 48, "Non-reactive", "qualitative"));
        tests.add(createTest("STD019", "Herpes Simplex 1 IgG", "HSV-1 antibody (oral herpes marker)", cat, TestType.SEROLOGY, new BigDecimal("799"), false, null, 48, "<0.9 (negative)", "index"));
        tests.add(createTest("STD020", "Herpes Simplex 2 IgG", "HSV-2 antibody (genital herpes marker)", cat, TestType.SEROLOGY, new BigDecimal("799"), false, null, 48, "<0.9 (negative)", "index"));
        tests.add(createTest("STD021", "Herpes Simplex 1 & 2 IgM", "Acute herpes infection marker", cat, TestType.SEROLOGY, new BigDecimal("999"), false, null, 48, "Negative", "qualitative"));
        tests.add(createTest("STD022", "HSV PCR (Swab)", "Herpes virus DNA detection from lesion", cat, TestType.MOLECULAR, new BigDecimal("1999"), false, null, 72, "Not detected", "qualitative"));
        tests.add(createTest("STD023", "Chlamydia trachomatis PCR", "Chlamydia DNA detection (urine/swab)", cat, TestType.MOLECULAR, new BigDecimal("1299"), false, null, 48, "Not detected", "qualitative"));
        tests.add(createTest("STD024", "Neisseria gonorrhoeae PCR", "Gonorrhea DNA detection (urine/swab)", cat, TestType.MOLECULAR, new BigDecimal("1299"), false, null, 48, "Not detected", "qualitative"));
        tests.add(createTest("STD025", "Chlamydia & Gonorrhea Combo PCR", "Combined CT/NG molecular test", cat, TestType.MOLECULAR, new BigDecimal("1999"), false, null, 48, "Not detected", "qualitative"));
        tests.add(createTest("STD026", "HPV DNA Test", "Human papillomavirus detection", cat, TestType.MOLECULAR, new BigDecimal("1999"), false, null, 72, "HPV DNA not detected", "qualitative"));
        tests.add(createTest("STD027", "HPV Genotyping (High Risk)", "Detection of high-risk HPV types 16, 18, etc.", cat, TestType.MOLECULAR, new BigDecimal("2999"), false, null, 96, "See report", "type"));
        tests.add(createTest("STD028", "Trichomonas vaginalis PCR", "Trichomoniasis molecular test", cat, TestType.MOLECULAR, new BigDecimal("1499"), false, null, 48, "Not detected", "qualitative"));
        tests.add(createTest("STD029", "Mycoplasma genitalium PCR", "M. genitalium DNA detection", cat, TestType.MOLECULAR, new BigDecimal("1699"), false, null, 72, "Not detected", "qualitative"));
        tests.add(createTest("STD030", "Ureaplasma PCR", "Ureaplasma urealyticum/parvum detection", cat, TestType.MOLECULAR, new BigDecimal("1699"), false, null, 72, "Not detected", "qualitative"));

        return tests;
    }

    // ==================== PRENATAL TESTS ====================

    private List<LabTest> createPrenatalTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("PRENATAL");

        tests.add(createTest("PRE001", "Beta HCG (Quantitative)", "Pregnancy hormone level for dating and monitoring", cat, TestType.SEROLOGY, new BigDecimal("499"), false, null, 4, "Varies by gestational age", "mIU/mL"));
        tests.add(createTest("PRE002", "Beta HCG (Qualitative)", "Pregnancy test (yes/no)", cat, TestType.SEROLOGY, new BigDecimal("199"), false, null, 2, "Positive/Negative", "qualitative"));
        tests.add(createTest("PRE003", "First Trimester Screening", "NT scan + PAPP-A + Free Beta HCG", cat, TestType.PRENATAL, new BigDecimal("3999"), false, null, 72, "Low risk <1:250", "risk ratio"));
        tests.add(createTest("PRE004", "PAPP-A (Pregnancy-Associated Plasma Protein A)", "First trimester screening marker", cat, TestType.SEROLOGY, new BigDecimal("999"), false, null, 48, "0.5-2.0 MoM", "MoM"));
        tests.add(createTest("PRE005", "Free Beta HCG", "Prenatal screening marker", cat, TestType.SEROLOGY, new BigDecimal("799"), false, null, 24, "0.5-2.0 MoM", "MoM"));
        tests.add(createTest("PRE006", "Nuchal Translucency (NT) Scan", "Ultrasound marker for chromosomal abnormalities", cat, TestType.ULTRASOUND, new BigDecimal("2499"), false, null, 2, "<3.5 mm", "mm"));
        tests.add(createTest("PRE007", "Double Marker Test", "Second trimester Down syndrome screening", cat, TestType.PRENATAL, new BigDecimal("1999"), false, null, 72, "Low risk", "risk ratio"));
        tests.add(createTest("PRE008", "Triple Marker Test", "AFP, HCG, Estriol for prenatal screening", cat, TestType.PRENATAL, new BigDecimal("2499"), false, null, 72, "Low risk", "risk ratio"));
        tests.add(createTest("PRE009", "Quadruple Marker Test", "Triple + Inhibin A for comprehensive screening", cat, TestType.PRENATAL, new BigDecimal("3499"), false, null, 72, "Low risk", "risk ratio"));
        tests.add(createTest("PRE010", "Alpha Fetoprotein (AFP)", "Neural tube defect marker", cat, TestType.SEROLOGY, new BigDecimal("799"), false, null, 48, "0.5-2.5 MoM", "MoM"));
        tests.add(createTest("PRE011", "Unconjugated Estriol (uE3)", "Prenatal screening marker", cat, TestType.SEROLOGY, new BigDecimal("699"), false, null, 48, "0.5-2.0 MoM", "MoM"));
        tests.add(createTest("PRE012", "Inhibin A", "Prenatal Down syndrome marker", cat, TestType.SEROLOGY, new BigDecimal("999"), false, null, 48, "0.5-2.0 MoM", "MoM"));
        tests.add(createTest("PRE013", "NIPT (Non-Invasive Prenatal Test)", "Cell-free DNA screening for chromosomal abnormalities", cat, TestType.GENETIC, new BigDecimal("14999"), false, null, 168, "Low risk for T21, T18, T13", "qualitative"));
        tests.add(createTest("PRE014", "NIPT Extended Panel", "NIPT + sex chromosomes + microdeletions", cat, TestType.GENETIC, new BigDecimal("19999"), false, null, 168, "Low risk all panels", "qualitative"));
        tests.add(createTest("PRE015", "Amniocentesis (Karyotype)", "Fetal chromosome analysis from amniotic fluid", cat, TestType.GENETIC, new BigDecimal("9999"), false, null, 336, "46,XX or 46,XY normal", "karyotype"));
        tests.add(createTest("PRE016", "CVS (Chorionic Villus Sampling)", "First trimester chromosome analysis", cat, TestType.GENETIC, new BigDecimal("12999"), false, null, 336, "Normal karyotype", "karyotype"));
        tests.add(createTest("PRE017", "Fetal Anomaly Scan (Level 2)", "Detailed anatomy ultrasound at 18-22 weeks", cat, TestType.ULTRASOUND, new BigDecimal("3999"), false, null, 2, "No anomalies detected", "qualitative"));
        tests.add(createTest("PRE018", "Fetal Echocardiography", "Detailed fetal heart ultrasound", cat, TestType.ULTRASOUND, new BigDecimal("4999"), false, null, 2, "Normal cardiac anatomy", "qualitative"));
        tests.add(createTest("PRE019", "Doppler Velocimetry (Umbilical)", "Blood flow to fetus assessment", cat, TestType.ULTRASOUND, new BigDecimal("1999"), false, null, 2, "Normal PI/RI", "index"));
        tests.add(createTest("PRE020", "Biophysical Profile (BPP)", "Fetal wellbeing assessment (8 parameters)", cat, TestType.ULTRASOUND, new BigDecimal("2499"), false, null, 2, "8/8", "score"));
        tests.add(createTest("PRE021", "Non-Stress Test (NST)", "Fetal heart rate monitoring", cat, TestType.PRENATAL, new BigDecimal("999"), false, null, 1, "Reactive", "qualitative"));
        tests.add(createTest("PRE022", "Contraction Stress Test", "Fetal response to contractions", cat, TestType.PRENATAL, new BigDecimal("1499"), false, null, 2, "Negative", "qualitative"));
        tests.add(createTest("PRE023", "Glucose Challenge Test (GCT)", "Gestational diabetes screening", cat, TestType.BIOCHEMISTRY, new BigDecimal("299"), false, null, 4, "<140 mg/dL", "mg/dL"));
        tests.add(createTest("PRE024", "GTT (75g) Pregnancy", "Gestational diabetes diagnosis", cat, TestType.BIOCHEMISTRY, new BigDecimal("599"), true, 10, 4, "FBS<92, 1hr<180, 2hr<153", "mg/dL"));
        tests.add(createTest("PRE025", "Group B Strep (GBS) Culture", "Vaginal/rectal swab at 35-37 weeks", cat, TestType.CULTURE, new BigDecimal("799"), false, null, 72, "Negative", "qualitative"));
        tests.add(createTest("PRE026", "TORCH Panel", "Toxo, Rubella, CMV, Herpes screening", cat, TestType.SEROLOGY, new BigDecimal("3999"), false, null, 72, "IgG positive (immune), IgM negative", "qualitative"));
        tests.add(createTest("PRE027", "Toxoplasma IgG & IgM", "Toxoplasmosis screening in pregnancy", cat, TestType.SEROLOGY, new BigDecimal("999"), false, null, 48, "IgG+/IgM- (past immunity)", "qualitative"));
        tests.add(createTest("PRE028", "Rubella IgG", "Rubella immunity check", cat, TestType.SEROLOGY, new BigDecimal("599"), false, null, 24, ">10 IU/mL (immune)", "IU/mL"));
        tests.add(createTest("PRE029", "CMV IgG & IgM", "Cytomegalovirus screening", cat, TestType.SEROLOGY, new BigDecimal("999"), false, null, 48, "IgG+/IgM- (past)", "qualitative"));
        tests.add(createTest("PRE030", "Parvovirus B19 IgG & IgM", "Fifth disease screening in pregnancy", cat, TestType.SEROLOGY, new BigDecimal("1299"), false, null, 72, "IgG+/IgM- (immune)", "qualitative"));

        return tests;
    }

    // ==================== IMMUNOLOGY TESTS ====================

    private List<LabTest> createImmunologyTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("AUTOIMMUNE");

        tests.add(createTest("IMM001", "Immunoglobulin G (IgG)", "Primary antibody for immune protection", cat, TestType.IMMUNOLOGY, new BigDecimal("599"), false, null, 24, "700-1600 mg/dL", "mg/dL"));
        tests.add(createTest("IMM002", "Immunoglobulin A (IgA)", "Mucosal immunity antibody", cat, TestType.IMMUNOLOGY, new BigDecimal("599"), false, null, 24, "70-400 mg/dL", "mg/dL"));
        tests.add(createTest("IMM003", "Immunoglobulin M (IgM)", "Primary immune response antibody", cat, TestType.IMMUNOLOGY, new BigDecimal("599"), false, null, 24, "40-230 mg/dL", "mg/dL"));
        tests.add(createTest("IMM004", "Immunoglobulin E (Total IgE)", "Allergy and parasitic infection marker", cat, TestType.IMMUNOLOGY, new BigDecimal("799"), false, null, 24, "<100 IU/mL", "IU/mL"));
        tests.add(createTest("IMM005", "IgG Subclasses (1,2,3,4)", "Detailed IgG component analysis", cat, TestType.IMMUNOLOGY, new BigDecimal("2999"), false, null, 72, "See detailed report", "mg/dL"));
        tests.add(createTest("IMM006", "Complement C3", "Complement system component", cat, TestType.IMMUNOLOGY, new BigDecimal("499"), false, null, 24, "90-180 mg/dL", "mg/dL"));
        tests.add(createTest("IMM007", "Complement C4", "Complement cascade protein", cat, TestType.IMMUNOLOGY, new BigDecimal("499"), false, null, 24, "10-40 mg/dL", "mg/dL"));
        tests.add(createTest("IMM008", "CH50 (Total Hemolytic Complement)", "Overall complement function", cat, TestType.IMMUNOLOGY, new BigDecimal("999"), false, null, 48, "31-60 U/mL", "U/mL"));
        tests.add(createTest("IMM009", "Lymphocyte Subset Panel (T, B, NK)", "Detailed immune cell analysis", cat, TestType.IMMUNOLOGY, new BigDecimal("3999"), false, null, 48, "See detailed report", "cells/mcL"));
        tests.add(createTest("IMM010", "NK Cell Activity (CD56+)", "Natural killer cell function", cat, TestType.IMMUNOLOGY, new BigDecimal("2499"), false, null, 72, "100-400 cells/mcL", "cells/mcL"));
        tests.add(createTest("IMM011", "T Cell Proliferation Test", "T lymphocyte function assessment", cat, TestType.IMMUNOLOGY, new BigDecimal("3999"), false, null, 96, "Normal stimulation index", "index"));
        tests.add(createTest("IMM012", "B Cell Count (CD19+)", "B lymphocyte quantification", cat, TestType.IMMUNOLOGY, new BigDecimal("1499"), false, null, 48, "100-500 cells/mcL", "cells/mcL"));
        tests.add(createTest("IMM013", "Cytokine Panel (IL-1, IL-6, TNF-a)", "Inflammatory cytokine levels", cat, TestType.IMMUNOLOGY, new BigDecimal("4999"), false, null, 96, "See detailed report", "pg/mL"));
        tests.add(createTest("IMM014", "Interleukin-2 Receptor (sIL-2R)", "T cell activation marker", cat, TestType.IMMUNOLOGY, new BigDecimal("1999"), false, null, 72, "223-710 U/mL", "U/mL"));
        tests.add(createTest("IMM015", "Interleukin-6 (IL-6)", "Pro-inflammatory cytokine", cat, TestType.IMMUNOLOGY, new BigDecimal("1299"), false, null, 48, "<7 pg/mL", "pg/mL"));
        tests.add(createTest("IMM016", "Tumor Necrosis Factor Alpha (TNF-a)", "Inflammatory cytokine marker", cat, TestType.IMMUNOLOGY, new BigDecimal("1499"), false, null, 72, "<8.1 pg/mL", "pg/mL"));
        tests.add(createTest("IMM017", "Interferon Gamma Release Assay (IGRA)", "TB infection detection", cat, TestType.IMMUNOLOGY, new BigDecimal("2499"), false, null, 72, "Negative", "qualitative"));
        tests.add(createTest("IMM018", "Mannose-Binding Lectin (MBL)", "Innate immunity protein", cat, TestType.IMMUNOLOGY, new BigDecimal("1499"), false, null, 72, ">500 ng/mL", "ng/mL"));
        tests.add(createTest("IMM019", "Serum Protein Electrophoresis (SPEP)", "Protein fraction analysis", cat, TestType.IMMUNOLOGY, new BigDecimal("799"), false, null, 48, "Normal pattern", "qualitative"));
        tests.add(createTest("IMM020", "Immunofixation Electrophoresis (IFE)", "Monoclonal protein detection", cat, TestType.IMMUNOLOGY, new BigDecimal("1499"), false, null, 72, "No monoclonal band", "qualitative"));
        tests.add(createTest("IMM021", "Serum Free Light Chains", "Kappa and Lambda light chain ratio", cat, TestType.IMMUNOLOGY, new BigDecimal("2499"), false, null, 48, "Kappa/Lambda 0.26-1.65", "ratio"));
        tests.add(createTest("IMM022", "Beta-2 Microglobulin", "Tumor marker and kidney/immune marker", cat, TestType.IMMUNOLOGY, new BigDecimal("999"), false, null, 48, "<2.5 mg/L", "mg/L"));
        tests.add(createTest("IMM023", "Cryoglobulins", "Cold-precipitating immunoglobulins", cat, TestType.IMMUNOLOGY, new BigDecimal("1299"), false, null, 168, "Negative", "qualitative"));
        tests.add(createTest("IMM024", "C1 Esterase Inhibitor (Quantitative)", "Hereditary angioedema marker", cat, TestType.IMMUNOLOGY, new BigDecimal("1499"), false, null, 72, "21-39 mg/dL", "mg/dL"));
        tests.add(createTest("IMM025", "C1 Esterase Inhibitor (Functional)", "HAE functional assessment", cat, TestType.IMMUNOLOGY, new BigDecimal("1999"), false, null, 96, ">67% activity", "%"));
        tests.add(createTest("IMM026", "Plasma Cell Analysis", "Bone marrow plasma cell quantification", cat, TestType.IMMUNOLOGY, new BigDecimal("2999"), false, null, 72, "<5%", "%"));
        tests.add(createTest("IMM027", "Lymphocyte Transformation Test", "Immune cell response to antigens", cat, TestType.IMMUNOLOGY, new BigDecimal("4999"), false, null, 120, "Normal response", "index"));
        tests.add(createTest("IMM028", "Neutrophil Function Test", "Phagocyte oxidative burst assay", cat, TestType.IMMUNOLOGY, new BigDecimal("2999"), false, null, 72, "Normal function", "qualitative"));
        tests.add(createTest("IMM029", "Vaccine Response Panel", "Antibody response to vaccinations", cat, TestType.IMMUNOLOGY, new BigDecimal("3999"), false, null, 96, "Adequate response", "qualitative"));
        tests.add(createTest("IMM030", "Primary Immunodeficiency Panel", "Comprehensive PID workup", cat, TestType.IMMUNOLOGY, new BigDecimal("9999"), false, null, 168, "See detailed report", "multiple"));

        return tests;
    }

    // ==================== ELECTROPHYSIOLOGY TESTS ====================

    private List<LabTest> createElectrophysiologyTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("CARDIAC");

        tests.add(createTest("EPS001", "ECG (Electrocardiogram) - 12 Lead", "Basic heart rhythm and electrical activity", cat, TestType.CARDIAC_STRESS, new BigDecimal("399"), false, null, 1, "Normal sinus rhythm", "qualitative"));
        tests.add(createTest("EPS002", "ECG with Interpretation", "12-lead ECG with cardiologist review", cat, TestType.CARDIAC_STRESS, new BigDecimal("599"), false, null, 4, "Normal", "qualitative"));
        tests.add(createTest("EPS003", "Holter Monitor (24-Hour)", "Continuous ECG recording for 24 hours", cat, TestType.CARDIAC_STRESS, new BigDecimal("2999"), false, null, 48, "See detailed report", "qualitative"));
        tests.add(createTest("EPS004", "Holter Monitor (48-Hour)", "Extended continuous ECG monitoring", cat, TestType.CARDIAC_STRESS, new BigDecimal("3999"), false, null, 72, "See detailed report", "qualitative"));
        tests.add(createTest("EPS005", "Holter Monitor (7-Day)", "Week-long cardiac rhythm monitoring", cat, TestType.CARDIAC_STRESS, new BigDecimal("5999"), false, null, 168, "See detailed report", "qualitative"));
        tests.add(createTest("EPS006", "Event Monitor (30-Day)", "Patient-activated ECG recording", cat, TestType.CARDIAC_STRESS, new BigDecimal("7999"), false, null, 720, "See detailed report", "qualitative"));
        tests.add(createTest("EPS007", "Treadmill Stress Test (TMT)", "Exercise ECG for cardiac assessment", cat, TestType.CARDIAC_STRESS, new BigDecimal("2499"), true, 4, 4, "Negative for ischemia", "qualitative"));
        tests.add(createTest("EPS008", "Stress Echocardiography", "Cardiac ultrasound during stress", cat, TestType.CARDIAC_STRESS, new BigDecimal("5999"), true, 4, 24, "Normal wall motion", "qualitative"));
        tests.add(createTest("EPS009", "Dobutamine Stress Echo", "Pharmacological stress cardiac ultrasound", cat, TestType.CARDIAC_STRESS, new BigDecimal("6999"), true, 4, 24, "Normal response", "qualitative"));
        tests.add(createTest("EPS010", "Nuclear Stress Test (SPECT)", "Myocardial perfusion imaging with stress", cat, TestType.CARDIAC_STRESS, new BigDecimal("14999"), true, 4, 48, "Normal perfusion", "qualitative"));
        tests.add(createTest("EPS011", "PET Myocardial Perfusion", "Advanced cardiac PET imaging", cat, TestType.PET_SCAN, new BigDecimal("24999"), true, 6, 48, "Normal perfusion", "qualitative"));
        tests.add(createTest("EPS012", "Cardiac MRI", "Detailed heart structure and function imaging", cat, TestType.MRI, new BigDecimal("14999"), false, null, 48, "Normal cardiac morphology", "qualitative"));
        tests.add(createTest("EPS013", "CT Coronary Angiography", "Non-invasive coronary artery visualization", cat, TestType.CT_SCAN, new BigDecimal("12999"), true, 4, 24, "No significant stenosis", "qualitative"));
        tests.add(createTest("EPS014", "CT Calcium Score", "Coronary artery calcification assessment", cat, TestType.CT_SCAN, new BigDecimal("4999"), false, null, 24, "Score 0 (no calcium)", "Agatston units"));
        tests.add(createTest("EPS015", "Signal-Averaged ECG", "Late potentials detection for arrhythmia risk", cat, TestType.CARDIAC_STRESS, new BigDecimal("1999"), false, null, 4, "No late potentials", "qualitative"));
        tests.add(createTest("EPS016", "Tilt Table Test", "Evaluation of syncope/fainting", cat, TestType.CARDIAC_STRESS, new BigDecimal("3999"), true, 8, 4, "Negative", "qualitative"));
        tests.add(createTest("EPS017", "Ambulatory Blood Pressure Monitor", "24-hour blood pressure recording", cat, TestType.CARDIAC_STRESS, new BigDecimal("1999"), false, null, 48, "See detailed report", "mmHg"));
        tests.add(createTest("EPS018", "Heart Rate Variability Analysis", "Autonomic nervous system assessment", cat, TestType.CARDIAC_STRESS, new BigDecimal("1499"), false, null, 24, "Normal HRV", "ms"));
        tests.add(createTest("EPS019", "QT Dispersion Analysis", "Risk of ventricular arrhythmia", cat, TestType.CARDIAC_STRESS, new BigDecimal("999"), false, null, 4, "<65 ms", "ms"));
        tests.add(createTest("EPS020", "Cardiac Electrophysiology Study", "Invasive heart rhythm evaluation", cat, TestType.CARDIAC_STRESS, new BigDecimal("49999"), true, 8, 24, "See detailed report", "qualitative"));

        return tests;
    }

    // ==================== RESPIRATORY TESTS ====================

    private List<LabTest> createRespiratoryTests() {
        List<LabTest> tests = new ArrayList<>();
        TestCategory cat = categoryMap.get("SPECIALIZED");

        tests.add(createTest("RES001", "Spirometry (Basic PFT)", "Lung function test measuring FEV1, FVC", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("999"), false, null, 2, "FEV1/FVC >70%", "L"));
        tests.add(createTest("RES002", "Complete Pulmonary Function Test", "Full lung volumes, diffusion capacity", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("2999"), false, null, 4, "See detailed report", "L"));
        tests.add(createTest("RES003", "Bronchodilator Response Test", "Spirometry before and after bronchodilator", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("1499"), false, null, 4, ">12% improvement diagnostic", "%"));
        tests.add(createTest("RES004", "Methacholine Challenge Test", "Airway hyperresponsiveness for asthma", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("2499"), false, null, 4, "PC20 >16 mg/mL (normal)", "mg/mL"));
        tests.add(createTest("RES005", "Diffusion Capacity (DLCO)", "Gas exchange efficiency", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("1499"), false, null, 4, ">80% predicted", "%"));
        tests.add(createTest("RES006", "Lung Volumes by Plethysmography", "Complete lung volume measurement", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("1999"), false, null, 4, "TLC, RV normal", "L"));
        tests.add(createTest("RES007", "Maximum Voluntary Ventilation", "Respiratory muscle endurance", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("999"), false, null, 2, ">80% predicted", "L/min"));
        tests.add(createTest("RES008", "Respiratory Muscle Strength (MIP/MEP)", "Inspiratory and expiratory muscle power", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("1499"), false, null, 2, "MIP >60, MEP >80 cmH2O", "cmH2O"));
        tests.add(createTest("RES009", "Pulse Oximetry (SpO2)", "Non-invasive oxygen saturation", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("99"), false, null, 1, ">95%", "%"));
        tests.add(createTest("RES010", "Arterial Blood Gas (ABG)", "Blood oxygen, CO2, pH analysis", cat, TestType.BIOCHEMISTRY, new BigDecimal("799"), false, null, 1, "pH 7.35-7.45, PaO2 >80", "mmHg"));
        tests.add(createTest("RES011", "6-Minute Walk Test", "Exercise capacity assessment", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("999"), false, null, 2, ">400 meters", "meters"));
        tests.add(createTest("RES012", "Cardiopulmonary Exercise Test (CPET)", "Integrated heart-lung exercise evaluation", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("5999"), true, 4, 24, "See detailed report", "mL/kg/min"));
        tests.add(createTest("RES013", "Fractional Exhaled Nitric Oxide (FeNO)", "Airway inflammation marker for asthma", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("999"), false, null, 1, "<25 ppb normal", "ppb"));
        tests.add(createTest("RES014", "Exhaled Breath Condensate Analysis", "Airway inflammation markers", cat, TestType.PULMONARY_FUNCTION, new BigDecimal("1999"), false, null, 24, "See detailed report", "qualitative"));
        tests.add(createTest("RES015", "Sleep Study (Polysomnography)", "Comprehensive overnight sleep analysis", cat, TestType.SLEEP_STUDY, new BigDecimal("9999"), false, null, 168, "AHI <5 normal", "events/hr"));
        tests.add(createTest("RES016", "Home Sleep Apnea Test", "Portable sleep apnea screening", cat, TestType.SLEEP_STUDY, new BigDecimal("4999"), false, null, 72, "AHI <5 normal", "events/hr"));
        tests.add(createTest("RES017", "CPAP Titration Study", "Optimal CPAP pressure determination", cat, TestType.SLEEP_STUDY, new BigDecimal("7999"), false, null, 168, "Optimal pressure determined", "cmH2O"));
        tests.add(createTest("RES018", "Multiple Sleep Latency Test (MSLT)", "Daytime sleepiness evaluation", cat, TestType.SLEEP_STUDY, new BigDecimal("6999"), false, null, 168, "Mean latency >8 min normal", "minutes"));
        tests.add(createTest("RES019", "Maintenance of Wakefulness Test", "Ability to stay awake assessment", cat, TestType.SLEEP_STUDY, new BigDecimal("5999"), false, null, 168, "Mean latency >40 min", "minutes"));
        tests.add(createTest("RES020", "Bronchoscopy with BAL", "Airway visualization and lavage", cat, TestType.ENDOSCOPY, new BigDecimal("14999"), true, 6, 72, "Normal airways", "qualitative"));
        tests.add(createTest("RES021", "Induced Sputum Analysis", "Airway inflammation cell count", cat, TestType.CYTOLOGY, new BigDecimal("1499"), false, null, 48, "<3% eosinophils normal", "%"));
        tests.add(createTest("RES022", "Chest X-Ray (PA View)", "Basic lung imaging", cat, TestType.XRAY, new BigDecimal("399"), false, null, 2, "No active lung disease", "qualitative"));
        tests.add(createTest("RES023", "Chest X-Ray (PA & Lateral)", "Two-view chest radiograph", cat, TestType.XRAY, new BigDecimal("599"), false, null, 2, "Clear lung fields", "qualitative"));
        tests.add(createTest("RES024", "High-Resolution CT Chest (HRCT)", "Detailed lung parenchyma imaging", cat, TestType.CT_SCAN, new BigDecimal("5999"), false, null, 24, "No interstitial disease", "qualitative"));
        tests.add(createTest("RES025", "CT Pulmonary Angiography", "Pulmonary embolism detection", cat, TestType.CT_SCAN, new BigDecimal("8999"), false, null, 24, "No pulmonary embolism", "qualitative"));

        return tests;
    }
}

package com.healthcare.labtestbooking.config;

import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.enums.*;
import com.healthcare.labtestbooking.repository.TestPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class PackageDataInitializer {

    private final TestPackageRepository testPackageRepository;
    private int packageCounter = 0;

    @Bean
    @Order(2)
    @Profile("!test")
    public CommandLineRunner initializePackageData() {
        return args -> {
            if (testPackageRepository.count() < 50) {
                log.info("Initializing comprehensive test package data...");
                insertAllPackages();
                log.info("Successfully inserted {} test packages", packageCounter);
            } else {
                log.info("Test packages already exist, skipping initialization");
            }
        };
    }

    @Transactional
    public void insertAllPackages() {
        List<TestPackage> allPackages = new ArrayList<>();

        // Age-Based Packages
        allPackages.addAll(createPediatricPackages());
        allPackages.addAll(createYoungAdultPackages());
        allPackages.addAll(createMiddleAgePackages());
        allPackages.addAll(createSeniorPackages());

        // Gender-Based Packages
        allPackages.addAll(createWomensHealthPackages());
        allPackages.addAll(createMensHealthPackages());

        // Profession-Based Packages
        allPackages.addAll(createProfessionPackages());

        // Disease-Specific Packages
        allPackages.addAll(createDiseaseManagementPackages());

        // Wellness & Lifestyle Packages
        allPackages.addAll(createWellnessPackages());

        // Corporate Packages
        allPackages.addAll(createCorporatePackages());

        // Family Packages
        allPackages.addAll(createFamilyPackages());

        // Preventive Packages
        allPackages.addAll(createPreventivePackages());

        testPackageRepository.saveAll(allPackages);
        packageCounter = allPackages.size();
    }

    // ==================== AGE-BASED PACKAGES ====================

    private List<TestPackage> createPediatricPackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("PED-GOLD-001", "Pediatric Gold Health Check (0-18)",
            "Comprehensive health screening for children and teenagers with 20 essential tests",
            PackageType.AGE_BASED, PackageTier.GOLD, AgeGroup.PEDIATRIC, Gender.ALL,
            new BigDecimal("5000"), new BigDecimal("6500"), 20, 24,
            Arrays.asList("CBC with Differential", "Metabolic Panel", "Thyroid Profile", "Iron Studies",
                "Vitamin D", "Vitamin B12", "Liver Function", "Kidney Function", "Blood Sugar",
                "Lipid Profile", "Urinalysis", "Stool Examination", "Growth Hormone", "Calcium",
                "Phosphorus", "Alkaline Phosphatase", "Blood Group", "Hemoglobin Electrophoresis",
                "G6PD", "Immunoglobulin Panel"),
            Arrays.asList("Complete health assessment", "Growth monitoring", "Nutritional deficiency check",
                "Early disease detection", "Free doctor consultation"),
            true, false, 1));

        packages.add(createPackage("PED-SILVER-001", "Pediatric Silver Health Check (0-18)",
            "Essential health screening for children with 12 important tests",
            PackageType.AGE_BASED, PackageTier.SILVER, AgeGroup.PEDIATRIC, Gender.ALL,
            new BigDecimal("3000"), new BigDecimal("3900"), 12, 12,
            Arrays.asList("CBC", "Blood Group", "Liver Function", "Kidney Function", "Blood Sugar",
                "Urinalysis", "Stool Examination", "Vitamin D", "Calcium", "Iron Studies",
                "Thyroid TSH", "Hemoglobin"),
            Arrays.asList("Essential health check", "Nutritional assessment", "Report within 12 hours"),
            true, false, 2));

        packages.add(createPackage("PED-BASIC-001", "Pediatric Basic Health Check (0-18)",
            "Basic health screening for children with 5 fundamental tests",
            PackageType.AGE_BASED, PackageTier.BASIC, AgeGroup.PEDIATRIC, Gender.ALL,
            new BigDecimal("1500"), new BigDecimal("1800"), 5, 6,
            Arrays.asList("CBC", "Blood Group", "Urinalysis", "Blood Sugar", "Hemoglobin"),
            Arrays.asList("Quick health check", "School admission ready", "Same day reports"),
            false, false, 3));

        return packages;
    }

    private List<TestPackage> createYoungAdultPackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("YA-GOLD-001", "Young Adult Gold Health Check (18-40)",
            "Comprehensive health screening for young adults with 35 tests covering all body systems",
            PackageType.AGE_BASED, PackageTier.GOLD, AgeGroup.YOUNG_ADULT, Gender.ALL,
            new BigDecimal("8000"), new BigDecimal("11500"), 35, 48,
            Arrays.asList("CBC with Differential", "Complete Metabolic Panel", "Lipid Profile Advanced",
                "Liver Function Complete", "Kidney Function Complete", "Thyroid Profile", "HbA1c",
                "Fasting Insulin", "Vitamin D", "Vitamin B12", "Iron Studies", "Calcium", "Magnesium",
                "Zinc", "Homocysteine", "hs-CRP", "Testosterone", "Cortisol", "DHEA-S", "Prolactin",
                "FSH", "LH", "Estradiol", "Progesterone", "Urinalysis", "Urine Microalbumin",
                "Hepatitis B", "Hepatitis C", "HIV", "VDRL", "Blood Group", "ESR", "Uric Acid",
                "Phosphorus", "Total Protein"),
            Arrays.asList("Complete body checkup", "Hormone assessment", "STD screening included",
                "Lifestyle disease detection", "Free dietician consultation"),
            true, true, 1));

        packages.add(createPackage("YA-SILVER-001", "Young Adult Silver Health Check (18-40)",
            "Essential health screening with 20 important tests",
            PackageType.AGE_BASED, PackageTier.SILVER, AgeGroup.YOUNG_ADULT, Gender.ALL,
            new BigDecimal("5000"), new BigDecimal("6500"), 20, 24,
            Arrays.asList("CBC", "Lipid Profile", "Liver Function", "Kidney Function", "Thyroid TSH",
                "Blood Sugar Fasting", "HbA1c", "Vitamin D", "Vitamin B12", "Iron Studies",
                "Urinalysis", "Uric Acid", "Calcium", "ESR", "Blood Group", "Hepatitis B",
                "Creatinine", "BUN", "Total Cholesterol", "Triglycerides"),
            Arrays.asList("Essential health monitoring", "Metabolic screening", "Quick turnaround"),
            true, false, 2));

        packages.add(createPackage("YA-BASIC-001", "Young Adult Basic Health Check (18-40)",
            "Basic health screening with 10 fundamental tests",
            PackageType.AGE_BASED, PackageTier.BASIC, AgeGroup.YOUNG_ADULT, Gender.ALL,
            new BigDecimal("2500"), new BigDecimal("3000"), 10, 12,
            Arrays.asList("CBC", "Blood Group", "Lipid Profile", "Blood Sugar", "Liver Function",
                "Kidney Function", "Urinalysis", "TSH", "HbA1c", "Uric Acid"),
            Arrays.asList("Quick health check", "Affordable pricing", "Same day reports"),
            false, false, 3));

        return packages;
    }

    private List<TestPackage> createMiddleAgePackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("MA-GOLD-001", "Middle Age Gold Health Check (40-60)",
            "Comprehensive executive health screening with 50 tests including cardiac and cancer markers",
            PackageType.AGE_BASED, PackageTier.GOLD, AgeGroup.MIDDLE_AGE, Gender.ALL,
            new BigDecimal("12000"), new BigDecimal("18000"), 50, 72,
            Arrays.asList("CBC with Differential", "Complete Metabolic Panel", "Advanced Lipid Profile",
                "Liver Function Complete", "Kidney Function Complete", "Thyroid Complete", "HbA1c",
                "Fasting Insulin", "HOMA-IR", "Vitamin D", "Vitamin B12", "Iron Studies",
                "Homocysteine", "hs-CRP", "Lp(a)", "ApoA1", "ApoB", "Fibrinogen",
                "Troponin T", "NT-proBNP", "ECG", "PSA/CA-125", "CEA", "AFP",
                "CA 19-9", "Testosterone/Estradiol", "Cortisol", "DHEA-S", "IGF-1",
                "Parathyroid Hormone", "Osteocalcin", "Calcium", "Phosphorus", "Magnesium",
                "Zinc", "Copper", "Selenium", "Urinalysis Complete", "Urine Microalbumin",
                "24-hr Urine Protein", "Hepatitis Panel", "Thyroid Antibodies", "ANA",
                "Rheumatoid Factor", "Uric Acid", "ESR", "Blood Group", "HLA B27", "Folate"),
            Arrays.asList("Executive health checkup", "Cardiac risk assessment", "Cancer screening",
                "Bone health evaluation", "Hormone optimization", "Free cardiologist consultation"),
            true, true, 1));

        packages.add(createPackage("MA-SILVER-001", "Middle Age Silver Health Check (40-60)",
            "Comprehensive health screening with 25 essential tests",
            PackageType.AGE_BASED, PackageTier.SILVER, AgeGroup.MIDDLE_AGE, Gender.ALL,
            new BigDecimal("7000"), new BigDecimal("9500"), 25, 48,
            Arrays.asList("CBC", "Lipid Profile", "Liver Function", "Kidney Function",
                "Thyroid Profile", "HbA1c", "Fasting Sugar", "Vitamin D", "Vitamin B12",
                "Iron Studies", "Homocysteine", "hs-CRP", "PSA/CA-125", "CEA",
                "Calcium", "Urinalysis", "Urine Microalbumin", "Uric Acid", "ESR",
                "Blood Pressure Check", "ECG", "Hepatitis B", "Creatinine", "BUN", "Cholesterol"),
            Arrays.asList("Comprehensive screening", "Early detection focus", "Cost effective"),
            true, false, 2));

        packages.add(createPackage("MA-BASIC-001", "Middle Age Basic Health Check (40-60)",
            "Essential health screening with 12 important tests",
            PackageType.AGE_BASED, PackageTier.BASIC, AgeGroup.MIDDLE_AGE, Gender.ALL,
            new BigDecimal("3500"), new BigDecimal("4500"), 12, 24,
            Arrays.asList("CBC", "Lipid Profile", "Liver Function", "Kidney Function",
                "Blood Sugar", "HbA1c", "TSH", "Urinalysis", "Uric Acid", "ECG",
                "Creatinine", "Blood Pressure"),
            Arrays.asList("Quick health assessment", "Affordable", "Essential coverage"),
            false, false, 3));

        return packages;
    }

    private List<TestPackage> createSeniorPackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("SR-GOLD-001", "Senior Gold Health Check (60+)",
            "Comprehensive geriatric health screening with 60 tests including bone density and cognitive assessment",
            PackageType.AGE_BASED, PackageTier.PLATINUM, AgeGroup.SENIOR, Gender.ALL,
            new BigDecimal("15000"), new BigDecimal("22000"), 60, 96,
            Arrays.asList("CBC with Differential", "Complete Metabolic Panel", "Advanced Lipid Profile",
                "Liver Function Complete", "Kidney Function Complete", "Thyroid Complete with Antibodies",
                "HbA1c", "Fasting Insulin", "HOMA-IR", "C-Peptide", "Vitamin D", "Vitamin B12",
                "Folate", "Iron Studies", "Ferritin", "Homocysteine", "hs-CRP", "Lp(a)",
                "ApoA1", "ApoB", "Fibrinogen", "D-Dimer", "Troponin T", "NT-proBNP", "BNP",
                "ECG", "2D Echo", "PSA/CA-125", "CEA", "AFP", "CA 19-9", "CA 15-3",
                "β2-Microglobulin", "Testosterone/Estradiol", "Cortisol", "DHEA-S", "IGF-1",
                "Parathyroid Hormone", "Osteocalcin", "CTX", "P1NP", "DEXA Scan",
                "Calcium", "Phosphorus", "Magnesium", "Zinc", "Urinalysis Complete",
                "Urine Microalbumin", "24-hr Urine Creatinine", "Hepatitis Panel",
                "ANA", "Rheumatoid Factor", "Anti-CCP", "Uric Acid", "ESR", "CRP",
                "Procalcitonin", "Memory Assessment", "Vision Check", "Hearing Test"),
            Arrays.asList("Complete geriatric assessment", "Bone density evaluation", "Cardiac panel",
                "Cancer marker screening", "Cognitive assessment", "Fall risk evaluation",
                "Free geriatrician consultation", "Home sample collection"),
            true, true, 1));

        packages.add(createPackage("SR-SILVER-001", "Senior Silver Health Check (60+)",
            "Essential senior health screening with 30 important tests",
            PackageType.AGE_BASED, PackageTier.GOLD, AgeGroup.SENIOR, Gender.ALL,
            new BigDecimal("9000"), new BigDecimal("12500"), 30, 72,
            Arrays.asList("CBC", "Lipid Profile", "Liver Function", "Kidney Function",
                "Thyroid Profile", "HbA1c", "Fasting Sugar", "Vitamin D", "Vitamin B12",
                "Iron Studies", "Calcium", "Homocysteine", "hs-CRP", "PSA/CA-125",
                "CEA", "Troponin T", "NT-proBNP", "ECG", "Urinalysis", "Uric Acid",
                "ESR", "Parathyroid", "Creatinine", "BUN", "Albumin", "Phosphorus",
                "Magnesium", "Blood Pressure", "Blood Group", "Prothrombin Time"),
            Arrays.asList("Comprehensive senior screening", "Cardiac focus", "Bone health"),
            true, false, 2));

        packages.add(createPackage("SR-BASIC-001", "Senior Basic Health Check (60+)",
            "Basic senior health screening with 15 essential tests",
            PackageType.AGE_BASED, PackageTier.SILVER, AgeGroup.SENIOR, Gender.ALL,
            new BigDecimal("4500"), new BigDecimal("6000"), 15, 24,
            Arrays.asList("CBC", "Lipid Profile", "Liver Function", "Kidney Function",
                "Blood Sugar", "HbA1c", "TSH", "Calcium", "Vitamin D", "Urinalysis",
                "ECG", "Uric Acid", "ESR", "Creatinine", "Blood Pressure"),
            Arrays.asList("Essential senior checkup", "Affordable", "Quick results"),
            false, false, 3));

        return packages;
    }

    // ==================== GENDER-BASED PACKAGES ====================

    private List<TestPackage> createWomensHealthPackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("WOM-GOLD-001", "Women's Gold Health Package",
            "Comprehensive women's health screening with 40 tests including hormonal and reproductive health",
            PackageType.GENDER_BASED, PackageTier.GOLD, AgeGroup.ALL, Gender.FEMALE,
            new BigDecimal("10000"), new BigDecimal("14000"), 40, 72,
            Arrays.asList("CBC with Differential", "Complete Metabolic Panel", "Lipid Profile",
                "Liver Function", "Kidney Function", "Thyroid Complete with Antibodies",
                "FSH", "LH", "Estradiol", "Progesterone", "Prolactin", "AMH", "DHEA-S",
                "Testosterone", "CA-125", "CA 15-3", "HE4", "CEA", "AFP",
                "Pap Smear", "HPV DNA", "Breast Ultrasound", "Pelvic Ultrasound",
                "Vitamin D", "Vitamin B12", "Iron Studies", "Ferritin", "Calcium",
                "Bone Density Risk Assessment", "Homocysteine", "hs-CRP", "HbA1c",
                "Fasting Insulin", "Urinalysis", "Urine Culture", "Thyroid Antibodies",
                "ANA", "Rubella IgG", "Mammogram (40+)", "BRCA Risk Assessment"),
            Arrays.asList("Complete women's health evaluation", "Hormonal balance check",
                "Cancer screening", "Fertility assessment", "Bone health",
                "Free gynecologist consultation"),
            true, true, 1));

        packages.add(createPackage("WOM-SILVER-001", "Women's Silver Health Package",
            "Essential women's health screening with 20 important tests",
            PackageType.GENDER_BASED, PackageTier.SILVER, AgeGroup.ALL, Gender.FEMALE,
            new BigDecimal("6000"), new BigDecimal("8000"), 20, 48,
            Arrays.asList("CBC", "Lipid Profile", "Liver Function", "Kidney Function",
                "Thyroid Profile", "FSH", "LH", "Estradiol", "Prolactin",
                "CA-125", "Vitamin D", "Vitamin B12", "Iron Studies", "Calcium",
                "HbA1c", "Urinalysis", "Pap Smear", "Pelvic Ultrasound", "Hemoglobin",
                "Blood Sugar"),
            Arrays.asList("Essential women's screening", "Hormone check", "Cancer awareness"),
            true, false, 2));

        packages.add(createPackage("WOM-PREG-001", "Pregnancy Screening Package",
            "Essential pregnancy screening with 8 important tests for expecting mothers",
            PackageType.GENDER_BASED, PackageTier.BASIC, AgeGroup.ALL, Gender.FEMALE,
            new BigDecimal("3000"), new BigDecimal("4000"), 8, 24,
            Arrays.asList("Beta hCG", "CBC", "Blood Group with Rh", "Rubella IgG",
                "HIV", "HBsAg", "VDRL", "Urinalysis"),
            Arrays.asList("Pregnancy confirmation", "Infection screening", "Blood compatibility"),
            false, true, 3));

        packages.add(createPackage("WOM-FERT-001", "Female Fertility Assessment",
            "Comprehensive fertility evaluation for women planning pregnancy",
            PackageType.GENDER_BASED, PackageTier.GOLD, AgeGroup.YOUNG_ADULT, Gender.FEMALE,
            new BigDecimal("8000"), new BigDecimal("11000"), 25, 72,
            Arrays.asList("FSH", "LH", "Estradiol", "Progesterone", "AMH", "Prolactin",
                "TSH", "Free T4", "Testosterone", "DHEA-S", "Fasting Insulin", "HOMA-IR",
                "CBC", "Blood Group", "HIV", "HBsAg", "VDRL", "Rubella IgG", "CMV IgG",
                "Toxoplasma IgG", "Pelvic Ultrasound", "Antral Follicle Count",
                "Vitamin D", "Iron Studies", "Karyotype"),
            Arrays.asList("Complete fertility workup", "Ovarian reserve assessment",
                "Infection screening", "Genetic screening", "Free fertility consultation"),
            true, true, 4));

        packages.add(createPackage("WOM-PCOS-001", "PCOS Assessment Package",
            "Specialized screening for Polycystic Ovary Syndrome",
            PackageType.GENDER_BASED, PackageTier.SILVER, AgeGroup.ALL, Gender.FEMALE,
            new BigDecimal("4500"), new BigDecimal("6000"), 15, 48,
            Arrays.asList("FSH", "LH", "LH/FSH Ratio", "Testosterone", "Free Testosterone",
                "DHEA-S", "Prolactin", "TSH", "Fasting Insulin", "HOMA-IR", "HbA1c",
                "Lipid Profile", "17-OH Progesterone", "AMH", "Pelvic Ultrasound"),
            Arrays.asList("PCOS diagnosis", "Insulin resistance check", "Hormone analysis"),
            true, false, 5));

        packages.add(createPackage("WOM-MENO-001", "Menopause Health Package",
            "Health screening for perimenopausal and menopausal women",
            PackageType.GENDER_BASED, PackageTier.SILVER, AgeGroup.MIDDLE_AGE, Gender.FEMALE,
            new BigDecimal("5500"), new BigDecimal("7500"), 18, 48,
            Arrays.asList("FSH", "LH", "Estradiol", "Progesterone", "Testosterone",
                "TSH", "Free T4", "Vitamin D", "Calcium", "Phosphorus", "Magnesium",
                "Bone Density Assessment", "Lipid Profile", "HbA1c", "CBC",
                "Liver Function", "Kidney Function", "hs-CRP"),
            Arrays.asList("Menopause assessment", "Bone health", "Cardiovascular risk"),
            true, false, 6));

        return packages;
    }

    private List<TestPackage> createMensHealthPackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("MEN-GOLD-001", "Men's Gold Health Package",
            "Comprehensive men's health screening with 40 tests including prostate and testosterone assessment",
            PackageType.GENDER_BASED, PackageTier.GOLD, AgeGroup.ALL, Gender.MALE,
            new BigDecimal("10000"), new BigDecimal("14000"), 40, 72,
            Arrays.asList("CBC with Differential", "Complete Metabolic Panel", "Advanced Lipid Profile",
                "Liver Function Complete", "Kidney Function Complete", "Thyroid Profile",
                "Total Testosterone", "Free Testosterone", "SHBG", "Estradiol", "LH", "FSH",
                "Prolactin", "DHEA-S", "Cortisol", "IGF-1", "PSA Total", "Free PSA",
                "PSA Ratio", "CEA", "AFP", "Vitamin D", "Vitamin B12", "Iron Studies",
                "Homocysteine", "hs-CRP", "Lp(a)", "Troponin T", "NT-proBNP", "ECG",
                "HbA1c", "Fasting Insulin", "Urinalysis", "Urine Microalbumin",
                "Prostate Ultrasound", "Abdominal Ultrasound", "Hepatitis Panel",
                "Blood Group", "Stress Assessment", "Body Composition"),
            Arrays.asList("Complete men's health evaluation", "Prostate screening",
                "Testosterone optimization", "Cardiac assessment", "Cancer markers",
                "Free urologist consultation"),
            true, true, 1));

        packages.add(createPackage("MEN-SILVER-001", "Men's Silver Health Package",
            "Essential men's health screening with 20 important tests",
            PackageType.GENDER_BASED, PackageTier.SILVER, AgeGroup.ALL, Gender.MALE,
            new BigDecimal("6000"), new BigDecimal("8000"), 20, 48,
            Arrays.asList("CBC", "Lipid Profile", "Liver Function", "Kidney Function",
                "Thyroid TSH", "Total Testosterone", "Free Testosterone", "PSA",
                "Vitamin D", "Vitamin B12", "Iron Studies", "HbA1c", "Blood Sugar",
                "Urinalysis", "Uric Acid", "ECG", "Creatinine", "Cholesterol",
                "Triglycerides", "Blood Pressure"),
            Arrays.asList("Essential men's screening", "Prostate check", "Hormone assessment"),
            true, false, 2));

        packages.add(createPackage("MEN-CARD-001", "Men's Cardiac Risk Package",
            "Focused cardiac screening for men with 15 heart-specific tests",
            PackageType.GENDER_BASED, PackageTier.SILVER, AgeGroup.ALL, Gender.MALE,
            new BigDecimal("5000"), new BigDecimal("7000"), 15, 24,
            Arrays.asList("Troponin T", "Troponin I", "CK-MB", "NT-proBNP", "BNP",
                "Advanced Lipid Profile", "Lp(a)", "ApoA1", "ApoB", "Homocysteine",
                "hs-CRP", "Fibrinogen", "D-Dimer", "ECG", "Blood Pressure Monitoring"),
            Arrays.asList("Comprehensive cardiac risk", "Heart attack risk assessment",
                "Cholesterol deep dive"),
            true, true, 3));

        packages.add(createPackage("MEN-FERT-001", "Male Fertility Assessment",
            "Comprehensive fertility evaluation for men",
            PackageType.GENDER_BASED, PackageTier.GOLD, AgeGroup.YOUNG_ADULT, Gender.MALE,
            new BigDecimal("6000"), new BigDecimal("8000"), 20, 72,
            Arrays.asList("Semen Analysis Complete", "Sperm DNA Fragmentation", "Sperm Morphology",
                "Total Testosterone", "Free Testosterone", "LH", "FSH", "Prolactin",
                "Estradiol", "TSH", "Fasting Insulin", "CBC", "Blood Group", "HIV",
                "HBsAg", "VDRL", "Scrotal Ultrasound", "Vitamin D", "Zinc", "Folate"),
            Arrays.asList("Complete fertility workup", "Sperm quality analysis",
                "Hormone balance", "Infection screening", "Free fertility consultation"),
            true, true, 4));

        packages.add(createPackage("MEN-TEST-001", "Testosterone Optimization Panel",
            "Specialized testosterone and hormone assessment for men",
            PackageType.GENDER_BASED, PackageTier.SILVER, AgeGroup.ALL, Gender.MALE,
            new BigDecimal("4500"), new BigDecimal("6000"), 12, 48,
            Arrays.asList("Total Testosterone", "Free Testosterone", "Bioavailable Testosterone",
                "SHBG", "Albumin", "LH", "FSH", "Estradiol", "DHEA-S", "Cortisol",
                "Prolactin", "PSA"),
            Arrays.asList("Testosterone level assessment", "Hormone balance check",
                "Treatment planning support"),
            true, false, 5));

        return packages;
    }

    // ==================== PROFESSION-BASED PACKAGES ====================

    private List<TestPackage> createProfessionPackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("PROF-IT-001", "IT Professional Health Package",
            "Health screening designed for IT professionals addressing eye strain, stress, and sedentary lifestyle",
            PackageType.PROFESSION_BASED, PackageTier.SILVER, AgeGroup.YOUNG_ADULT, Gender.ALL,
            new BigDecimal("7000"), new BigDecimal("9000"), 22, 48,
            Arrays.asList("CBC", "Lipid Profile", "Liver Function", "Kidney Function", "Blood Sugar",
                "HbA1c", "Thyroid TSH", "Vitamin D", "Vitamin B12", "Eye Examination",
                "Visual Acuity", "Cortisol", "DHEA-S", "Homocysteine", "hs-CRP",
                "Calcium", "Magnesium", "Urinalysis", "Uric Acid", "ESR",
                "Stress Assessment", "Cervical Spine Check"),
            Arrays.asList("Eye strain assessment", "Stress hormone check", "Vitamin deficiency",
                "Sedentary lifestyle impact", "Free ergonomic consultation"),
            true, true, 1));
        packages.get(packages.size()-1).setProfessionApplicable("IT,Software,Technology,Developer,Engineer");

        packages.add(createPackage("PROF-CON-001", "Construction Worker Health Package",
            "Health screening for construction workers focusing on respiratory and toxic exposure",
            PackageType.PROFESSION_BASED, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("6000"), new BigDecimal("8000"), 18, 48,
            Arrays.asList("CBC", "Liver Function", "Kidney Function", "Pulmonary Function Test",
                "Chest X-Ray", "Blood Lead Level", "Audiometry", "Vision Test",
                "Respiratory Panel", "Blood Sugar", "Urinalysis", "Calcium", "Vitamin D",
                "ECG", "Musculoskeletal Assessment", "Heavy Metals Panel",
                "Blood Pressure", "Lung Health Assessment"),
            Arrays.asList("Respiratory health check", "Toxic exposure screening",
                "Hearing conservation", "Physical fitness assessment"),
            true, false, 2));
        packages.get(packages.size()-1).setProfessionApplicable("Construction,Builder,Laborer,Mason");

        packages.add(createPackage("PROF-DOC-001", "Healthcare Worker Health Package",
            "Health screening for doctors, nurses, and healthcare professionals",
            PackageType.PROFESSION_BASED, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("8000"), new BigDecimal("11000"), 25, 72,
            Arrays.asList("CBC", "Liver Function", "Kidney Function", "Hepatitis B Panel",
                "Hepatitis C", "HIV", "TB Screening", "Varicella IgG", "Measles IgG",
                "Mumps IgG", "Rubella IgG", "Tetanus Antibody", "Influenza Vaccine Status",
                "Thyroid TSH", "Blood Sugar", "Lipid Profile", "Vitamin D", "Vitamin B12",
                "Needle Stick Injury Panel", "Blood Group", "Urinalysis", "Stress Assessment",
                "Immunity Panel", "Hepatitis B Antibody", "PPD/Mantoux Test"),
            Arrays.asList("Blood-borne pathogen screening", "Immunity verification",
                "Occupational hazard assessment", "Stress evaluation"),
            true, true, 3));
        packages.get(packages.size()-1).setProfessionApplicable("Doctor,Nurse,Healthcare,Medical,Hospital");

        packages.add(createPackage("PROF-ATH-001", "Athlete & Fitness Health Package",
            "Performance-focused health screening for athletes and fitness enthusiasts",
            PackageType.PROFESSION_BASED, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("9000"), new BigDecimal("12000"), 28, 72,
            Arrays.asList("CBC with Differential", "Iron Studies Complete", "Ferritin",
                "Vitamin D", "Vitamin B12", "Magnesium", "Zinc", "Copper", "Selenium",
                "Electrolytes Panel", "CK Total", "CK-MB", "LDH", "Myoglobin",
                "Testosterone", "Cortisol", "IGF-1", "Growth Hormone", "Thyroid Profile",
                "Lipid Profile", "Liver Function", "Kidney Function", "HbA1c",
                "Lactate Threshold Test", "VO2 Max Assessment", "Body Composition",
                "ECG", "Cardiac Stress Test"),
            Arrays.asList("Performance optimization", "Muscle recovery assessment",
                "Injury prevention", "Hormone balance", "Cardiac clearance for sports"),
            true, true, 4));
        packages.get(packages.size()-1).setProfessionApplicable("Athlete,Sports,Fitness,Gym,Trainer");

        packages.add(createPackage("PROF-EXEC-001", "Corporate Executive Health Package",
            "Premium health screening for corporate executives with stress and lifestyle assessment",
            PackageType.PROFESSION_BASED, PackageTier.PLATINUM, AgeGroup.MIDDLE_AGE, Gender.ALL,
            new BigDecimal("12000"), new BigDecimal("17000"), 45, 96,
            Arrays.asList("CBC with Differential", "Complete Metabolic Panel", "Advanced Lipid Profile",
                "Liver Function Complete", "Kidney Function Complete", "Thyroid Complete",
                "HbA1c", "Fasting Insulin", "HOMA-IR", "Vitamin D", "Vitamin B12", "Iron Studies",
                "Homocysteine", "hs-CRP", "Lp(a)", "Cortisol", "DHEA-S", "Testosterone/Estradiol",
                "Troponin T", "NT-proBNP", "ECG", "TMT", "2D Echo", "Carotid Doppler",
                "PSA/CA-125", "CEA", "AFP", "Urinalysis", "Microalbumin", "Stress Assessment",
                "Sleep Quality Assessment", "Executive Cognitive Screen", "Body Composition",
                "Abdominal Ultrasound", "Chest X-Ray", "Vision Test", "Hearing Test",
                "Bone Density Screen", "Dietary Assessment", "Lifestyle Risk Score",
                "Mental Wellness Screen", "Full Body MRI", "Genetic Risk Assessment"),
            Arrays.asList("Executive wellness evaluation", "Stress management assessment",
                "Cardiac comprehensive", "Cancer screening", "Lifestyle optimization",
                "Free executive health consultation", "Priority reporting"),
            true, true, 5));
        packages.get(packages.size()-1).setProfessionApplicable("Executive,CEO,Director,Manager,Corporate");

        packages.add(createPackage("PROF-DRIV-001", "Professional Driver Health Package",
            "Health screening for commercial drivers and transport professionals",
            PackageType.PROFESSION_BASED, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("4000"), new BigDecimal("5500"), 15, 24,
            Arrays.asList("CBC", "Blood Sugar", "HbA1c", "Vision Test", "Color Vision",
                "Hearing Test", "Blood Pressure", "ECG", "Liver Function", "Kidney Function",
                "Drug Screen 10-Panel", "Epilepsy Screening", "Diabetes Check",
                "Reflexes Assessment", "General Physical Exam"),
            Arrays.asList("Driving fitness certification", "Vision and hearing check",
                "Drug screening", "Medical fitness certificate"),
            true, false, 6));
        packages.get(packages.size()-1).setProfessionApplicable("Driver,Transport,Logistics,Truck,Bus");

        packages.add(createPackage("PROF-PILOT-001", "Aviation Medical Package",
            "Comprehensive medical examination for pilots and aviation personnel",
            PackageType.PROFESSION_BASED, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("15000"), new BigDecimal("20000"), 35, 72,
            Arrays.asList("CBC", "Complete Metabolic Panel", "Lipid Profile", "Liver Function",
                "Kidney Function", "Thyroid Profile", "HbA1c", "Color Vision", "Visual Acuity",
                "Field of Vision", "Audiometry", "ECG", "TMT", "2D Echo", "Chest X-Ray",
                "EEG", "Neurological Exam", "Psychiatric Evaluation", "Blood Pressure",
                "Pulmonary Function", "Balance Assessment", "Drug Screen", "Alcohol Panel",
                "HIV", "Hepatitis Panel", "Urinalysis", "Uric Acid", "Calcium", "Vitamin D",
                "Cognitive Assessment", "Reaction Time Test", "Sleep Apnea Screen",
                "General Physical", "Dental Check", "BMI Assessment"),
            Arrays.asList("Aviation medical certification", "Neurological assessment",
                "Cardiac clearance", "Vision and hearing certification"),
            true, true, 7));
        packages.get(packages.size()-1).setProfessionApplicable("Pilot,Aviation,Airline,Flight");

        return packages;
    }

    // ==================== DISEASE-SPECIFIC PACKAGES ====================

    private List<TestPackage> createDiseaseManagementPackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("DIS-DIAB-001", "Diabetes Management Package",
            "Comprehensive diabetes monitoring and complication screening",
            PackageType.DISEASE_SPECIFIC, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("4000"), new BigDecimal("5500"), 18, 24,
            Arrays.asList("Fasting Blood Sugar", "Post Prandial Blood Sugar", "HbA1c",
                "Fasting Insulin", "C-Peptide", "HOMA-IR", "Lipid Profile", "Kidney Function",
                "Urine Microalbumin", "Urinalysis", "Liver Function", "Fundus Examination",
                "Foot Examination", "Blood Pressure", "ECG", "Vitamin B12", "Magnesium", "Zinc"),
            Arrays.asList("Glycemic control assessment", "Complication screening",
                "Nerve and eye check", "Kidney protection monitoring"),
            true, true, 1));
        packages.get(packages.size()-1).setHealthCondition("Diabetes,Prediabetes,Insulin Resistance");

        packages.add(createPackage("DIS-CARD-001", "Heart Disease Management Package",
            "Comprehensive cardiac monitoring for heart disease patients",
            PackageType.DISEASE_SPECIFIC, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("6000"), new BigDecimal("8500"), 22, 48,
            Arrays.asList("Troponin T", "Troponin I", "CK-MB", "NT-proBNP", "BNP",
                "Advanced Lipid Profile", "Lp(a)", "ApoA1", "ApoB", "Homocysteine",
                "hs-CRP", "Fibrinogen", "D-Dimer", "ECG", "2D Echo", "TMT",
                "Blood Pressure Monitoring", "HbA1c", "Kidney Function", "Liver Function",
                "Electrolytes", "Magnesium"),
            Arrays.asList("Cardiac function monitoring", "Risk factor control",
                "Medication effectiveness check", "Complication prevention"),
            true, true, 2));
        packages.get(packages.size()-1).setHealthCondition("Heart Disease,CAD,Heart Failure,Arrhythmia");

        packages.add(createPackage("DIS-THYR-001", "Thyroid Management Package",
            "Complete thyroid function monitoring and antibody assessment",
            PackageType.DISEASE_SPECIFIC, PackageTier.BASIC, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("3000"), new BigDecimal("4000"), 10, 24,
            Arrays.asList("TSH", "Free T3", "Free T4", "Total T3", "Total T4",
                "Anti-TPO", "Anti-Thyroglobulin", "Thyroglobulin", "Calcium", "Vitamin D"),
            Arrays.asList("Complete thyroid assessment", "Antibody screening",
                "Medication dose optimization"),
            true, true, 3));
        packages.get(packages.size()-1).setHealthCondition("Thyroid,Hypothyroid,Hyperthyroid,Hashimoto");

        packages.add(createPackage("DIS-LIV-001", "Liver Disease Management Package",
            "Comprehensive liver function and viral hepatitis monitoring",
            PackageType.DISEASE_SPECIFIC, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("5000"), new BigDecimal("7000"), 20, 48,
            Arrays.asList("Liver Function Complete", "GGT", "Albumin", "Total Protein",
                "Prothrombin Time", "INR", "Hepatitis B Panel", "HBV DNA", "Hepatitis C",
                "HCV RNA", "AFP", "Liver Ultrasound", "FibroScan", "Iron Studies",
                "Ferritin", "Copper", "Ceruloplasmin", "ANA", "AMA", "ASMA"),
            Arrays.asList("Liver function monitoring", "Viral load assessment",
                "Fibrosis staging", "Cancer surveillance"),
            true, false, 4));
        packages.get(packages.size()-1).setHealthCondition("Liver Disease,Hepatitis,Cirrhosis,Fatty Liver");

        packages.add(createPackage("DIS-KID-001", "Kidney Disease Management Package",
            "Comprehensive kidney function and proteinuria monitoring",
            PackageType.DISEASE_SPECIFIC, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("5000"), new BigDecimal("6500"), 18, 48,
            Arrays.asList("Creatinine", "BUN", "eGFR", "Cystatin C", "Electrolytes",
                "Calcium", "Phosphorus", "Parathyroid Hormone", "Vitamin D", "Uric Acid",
                "Urinalysis", "Urine Microalbumin", "24-Hour Urine Protein", "Urine Creatinine",
                "ACR", "CBC", "Iron Studies", "Kidney Ultrasound"),
            Arrays.asList("Kidney function tracking", "Electrolyte balance",
                "Anemia monitoring", "Bone health assessment"),
            true, false, 5));
        packages.get(packages.size()-1).setHealthCondition("Kidney Disease,CKD,Nephropathy,Dialysis");

        packages.add(createPackage("DIS-CANC-001", "Cancer Screening Package",
            "Comprehensive tumor marker and cancer risk assessment",
            PackageType.DISEASE_SPECIFIC, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("8000"), new BigDecimal("11000"), 25, 72,
            Arrays.asList("CBC with Differential", "ESR", "LDH", "PSA/CA-125", "CEA", "AFP",
                "CA 19-9", "CA 15-3", "β-HCG", "NSE", "SCC", "Cyfra 21-1",
                "Chromogranin A", "Calcitonin", "β2-Microglobulin", "Free Light Chains",
                "Protein Electrophoresis", "Peripheral Smear", "Ultrasound Abdomen",
                "Chest X-Ray", "Mammogram/PSA Ultrasound", "Stool Occult Blood",
                "Urinalysis", "Liver Function", "Kidney Function"),
            Arrays.asList("Multi-organ cancer screening", "Tumor marker panel",
                "Early detection focus", "Oncologist consultation available"),
            true, true, 6));
        packages.get(packages.size()-1).setHealthCondition("Cancer Risk,Family History Cancer,Cancer Surveillance");

        packages.add(createPackage("DIS-ARTH-001", "Arthritis Management Package",
            "Comprehensive rheumatological assessment and monitoring",
            PackageType.DISEASE_SPECIFIC, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("5500"), new BigDecimal("7500"), 18, 72,
            Arrays.asList("CBC", "ESR", "CRP", "Rheumatoid Factor", "Anti-CCP",
                "ANA", "Anti-dsDNA", "Complement C3", "Complement C4", "Uric Acid",
                "Calcium", "Vitamin D", "Vitamin B12", "HLA B27", "Joint X-Ray",
                "Liver Function", "Kidney Function", "Urinalysis"),
            Arrays.asList("Inflammation monitoring", "Autoimmune assessment",
                "Joint health tracking", "Medication safety check"),
            true, false, 7));
        packages.get(packages.size()-1).setHealthCondition("Arthritis,Rheumatoid,Gout,Autoimmune");

        packages.add(createPackage("DIS-RESP-001", "Respiratory Disease Package",
            "Comprehensive pulmonary function and respiratory health assessment",
            PackageType.DISEASE_SPECIFIC, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("5000"), new BigDecimal("7000"), 15, 48,
            Arrays.asList("CBC", "ESR", "CRP", "IgE Total", "Pulmonary Function Test",
                "Chest X-Ray", "Sputum Culture", "Sputum AFB", "ABG", "SpO2",
                "Alpha-1 Antitrypsin", "D-Dimer", "NT-proBNP", "Procalcitonin", "6MWT"),
            Arrays.asList("Lung function assessment", "Infection screening",
                "COPD/Asthma monitoring", "Oxygen status check"),
            true, false, 8));
        packages.get(packages.size()-1).setHealthCondition("Asthma,COPD,Respiratory,Lung Disease");

        return packages;
    }

    // ==================== WELLNESS & LIFESTYLE PACKAGES ====================

    private List<TestPackage> createWellnessPackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("WEL-COMP-001", "Complete Health Checkup",
            "Comprehensive annual health assessment with 30 essential tests",
            PackageType.WELLNESS, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("5000"), new BigDecimal("7000"), 30, 48,
            Arrays.asList("CBC with Differential", "Lipid Profile", "Liver Function",
                "Kidney Function", "Thyroid TSH", "HbA1c", "Fasting Blood Sugar",
                "Vitamin D", "Vitamin B12", "Iron Studies", "Calcium", "Uric Acid",
                "Urinalysis", "Stool Examination", "ECG", "Chest X-Ray",
                "Ultrasound Abdomen", "Blood Group", "ESR", "CRP", "Homocysteine",
                "Hepatitis B", "Blood Pressure", "BMI Assessment", "Vision Test",
                "PSA/Pap Smear", "Creatinine", "Albumin", "Total Protein", "Electrolytes"),
            Arrays.asList("Complete body checkup", "Annual health monitoring",
                "All vital organ assessment", "Free doctor consultation"),
            true, true, 1));

        packages.add(createPackage("WEL-PRE-001", "Pre-Marital Health Checkup",
            "Essential health screening for couples planning marriage",
            PackageType.WELLNESS, PackageTier.SILVER, AgeGroup.YOUNG_ADULT, Gender.ALL,
            new BigDecimal("4000"), new BigDecimal("5500"), 15, 48,
            Arrays.asList("CBC", "Blood Group with Rh", "HIV", "Hepatitis B", "Hepatitis C",
                "VDRL", "Thalassemia Screening", "Hemoglobin Electrophoresis", "G6PD",
                "Rubella IgG", "Thyroid TSH", "Blood Sugar", "Fertility Hormone Panel",
                "Genetic Counseling", "Complete Physical"),
            Arrays.asList("Compatibility screening", "Genetic disease risk",
                "Fertility baseline", "Infection screening"),
            true, true, 2));

        packages.add(createPackage("WEL-PREOP-001", "Pre-Operative Checkup",
            "Essential screening before surgical procedures",
            PackageType.WELLNESS, PackageTier.BASIC, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("3500"), new BigDecimal("4500"), 12, 12,
            Arrays.asList("CBC", "Blood Group with Rh", "Prothrombin Time", "APTT",
                "Bleeding Time", "Clotting Time", "Blood Sugar", "Kidney Function",
                "Liver Function", "ECG", "Chest X-Ray", "HIV", "HBsAg"),
            Arrays.asList("Surgical fitness assessment", "Bleeding risk check",
                "Anesthesia clearance", "Urgent reporting available"),
            true, false, 3));

        packages.add(createPackage("WEL-FIT-001", "Fitness Assessment Package",
            "Health screening for fitness enthusiasts and gym members",
            PackageType.WELLNESS, PackageTier.BASIC, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("3000"), new BigDecimal("4000"), 12, 24,
            Arrays.asList("CBC", "Lipid Profile", "Blood Sugar", "Electrolytes",
                "CK Total", "LDH", "Iron Studies", "Vitamin D", "Vitamin B12",
                "Thyroid TSH", "Body Composition", "VO2 Max Estimate"),
            Arrays.asList("Exercise readiness assessment", "Muscle recovery markers",
                "Energy metabolism check", "Nutrition gaps identification"),
            true, false, 4));

        packages.add(createPackage("WEL-ANN-001", "Annual Health Checkup Premium",
            "Comprehensive yearly health evaluation with imaging",
            PackageType.WELLNESS, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("6000"), new BigDecimal("8500"), 35, 72,
            Arrays.asList("CBC with Differential", "Complete Metabolic Panel", "Lipid Profile",
                "Liver Function Complete", "Kidney Function Complete", "Thyroid Profile",
                "HbA1c", "Vitamin D", "Vitamin B12", "Iron Studies", "Calcium", "Magnesium",
                "Homocysteine", "hs-CRP", "Urinalysis", "Stool Analysis", "ECG", "Chest X-Ray",
                "Ultrasound Abdomen", "Ultrasound Thyroid", "Hepatitis B", "Hepatitis C",
                "Blood Group", "ESR", "Uric Acid", "PSA/CA-125", "BMI", "Blood Pressure",
                "Vision Test", "Dental Check", "Hearing Test", "Lung Function",
                "Stress Assessment", "Dietary Assessment", "Physical Examination"),
            Arrays.asList("Comprehensive annual screening", "All imaging included",
                "Cancer marker screening", "Lifestyle assessment", "Priority appointment"),
            true, true, 5));

        packages.add(createPackage("WEL-FAST-001", "Intermittent Fasting Health Check",
            "Health monitoring for intermittent fasting practitioners",
            PackageType.WELLNESS, PackageTier.BASIC, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("2500"), new BigDecimal("3500"), 12, 24,
            Arrays.asList("Fasting Blood Sugar", "Fasting Insulin", "HOMA-IR", "HbA1c",
                "Lipid Profile", "Liver Function", "Kidney Function", "Electrolytes",
                "Ketones", "Uric Acid", "Thyroid TSH", "Cortisol"),
            Arrays.asList("Metabolic adaptation check", "Insulin sensitivity assessment",
                "Ketosis monitoring", "Electrolyte balance"),
            true, false, 6));

        packages.add(createPackage("WEL-VEGAN-001", "Vegan/Vegetarian Health Check",
            "Essential screening for plant-based diet followers",
            PackageType.WELLNESS, PackageTier.BASIC, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("3000"), new BigDecimal("4000"), 15, 24,
            Arrays.asList("CBC", "Vitamin B12", "Iron Studies", "Ferritin", "Folate",
                "Vitamin D", "Calcium", "Zinc", "Omega-3 Index", "Protein Total",
                "Albumin", "Thyroid TSH", "Homocysteine", "Iodine", "Selenium"),
            Arrays.asList("Plant-based nutrition assessment", "B12 and iron focus",
                "Protein adequacy check", "Micronutrient screening"),
            true, false, 7));

        packages.add(createPackage("WEL-STRESS-001", "Stress & Burnout Assessment",
            "Comprehensive stress hormone and wellness evaluation",
            PackageType.WELLNESS, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("4500"), new BigDecimal("6000"), 15, 48,
            Arrays.asList("Cortisol Morning", "Cortisol Evening", "DHEA-S", "Testosterone",
                "Thyroid Profile", "Vitamin D", "Vitamin B12", "Magnesium", "Zinc",
                "Blood Sugar", "Lipid Profile", "hs-CRP", "Homocysteine",
                "Sleep Quality Assessment", "Mental Wellness Screen"),
            Arrays.asList("Stress hormone analysis", "Adrenal function check",
                "Burnout risk assessment", "Recovery recommendations"),
            true, true, 8));

        return packages;
    }

    // ==================== CORPORATE PACKAGES ====================

    private List<TestPackage> createCorporatePackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("CORP-BASIC-001", "Corporate Basic Health Check",
            "Entry-level health screening for employees",
            PackageType.CORPORATE, PackageTier.BASIC, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("1500"), new BigDecimal("2000"), 8, 12,
            Arrays.asList("CBC", "Blood Sugar", "Lipid Profile", "Liver Function",
                "Kidney Function", "Urinalysis", "Blood Pressure", "BMI"),
            Arrays.asList("Quick employee screening", "Essential parameters",
                "Budget-friendly", "Same day results"),
            true, false, 1));

        packages.add(createPackage("CORP-STAND-001", "Corporate Standard Health Check",
            "Standard annual health screening for corporate employees",
            PackageType.CORPORATE, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("3500"), new BigDecimal("4500"), 20, 24,
            Arrays.asList("CBC", "Lipid Profile", "Liver Function", "Kidney Function",
                "Thyroid TSH", "Blood Sugar", "HbA1c", "Vitamin D", "Vitamin B12",
                "ECG", "Urinalysis", "Vision Test", "Blood Pressure", "BMI",
                "Uric Acid", "Calcium", "ESR", "Creatinine", "Cholesterol", "Triglycerides"),
            Arrays.asList("Standard corporate package", "Annual employee wellness",
                "ECG included", "Camp facility available"),
            true, true, 2));

        packages.add(createPackage("CORP-EXEC-001", "Corporate Executive Health Check",
            "Premium health screening for senior management",
            PackageType.CORPORATE, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("8000"), new BigDecimal("11000"), 40, 48,
            Arrays.asList("CBC with Differential", "Complete Metabolic Panel", "Advanced Lipid Profile",
                "Liver Function Complete", "Kidney Function Complete", "Thyroid Complete",
                "HbA1c", "Vitamin D", "Vitamin B12", "Iron Studies", "Homocysteine", "hs-CRP",
                "PSA/CA-125", "CEA", "Troponin T", "NT-proBNP", "ECG", "TMT", "2D Echo",
                "Ultrasound Abdomen", "Chest X-Ray", "Urinalysis", "Uric Acid", "Calcium",
                "Magnesium", "Vision Test", "Hearing Test", "Dental Check", "DEXA Screen",
                "Stress Assessment", "Blood Pressure Monitor", "Body Composition",
                "Cortisol", "DHEA-S", "Hepatitis Panel", "Blood Group",
                "Lifestyle Risk Assessment", "Dietary Consultation", "Executive Summary"),
            Arrays.asList("Executive-level screening", "Cardiac comprehensive", "Cancer markers",
                "Same-day consultation", "Priority scheduling", "Personal health advisor"),
            true, true, 3));

        packages.add(createPackage("CORP-CAMP-001", "Corporate Health Camp Package",
            "Bulk health screening package for corporate health camps",
            PackageType.CORPORATE, PackageTier.BASIC, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("999"), new BigDecimal("1500"), 6, 24,
            Arrays.asList("Blood Sugar Random", "Blood Pressure", "BMI", "Hemoglobin",
                "Basic Eye Check", "Dental Screening"),
            Arrays.asList("Quick screening", "High volume capable", "On-site facility",
                "Instant results for basic tests"),
            false, false, 4));

        return packages;
    }

    // ==================== FAMILY PACKAGES ====================

    private List<TestPackage> createFamilyPackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("FAM-COMP-001", "Family Complete Health Package (4 Members)",
            "Comprehensive health screening for a family of 4",
            PackageType.FAMILY, PackageTier.PLATINUM, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("18000"), new BigDecimal("28000"), 80, 72,
            Arrays.asList("4x CBC", "4x Lipid Profile", "4x Liver Function", "4x Kidney Function",
                "4x Blood Sugar", "4x Thyroid TSH", "4x Urinalysis", "4x Vitamin D",
                "4x Vitamin B12", "4x Iron Studies", "4x Blood Group", "4x ECG",
                "2x Adult Comprehensive", "2x Pediatric/Adult Basic",
                "Family Genetic Screening", "Shared Report Dashboard",
                "Family Health Consultation", "4x Blood Pressure", "4x BMI"),
            Arrays.asList("Whole family covered", "45% savings vs individual",
                "Shared appointment scheduling", "Family health report",
                "Free family consultation"),
            true, true, 1));

        packages.add(createPackage("FAM-BASIC-001", "Family Basic Health Package (4 Members)",
            "Essential health screening for families",
            PackageType.FAMILY, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("8000"), new BigDecimal("12000"), 40, 48,
            Arrays.asList("4x CBC", "4x Blood Sugar", "4x Lipid Profile", "4x Liver Function",
                "4x Kidney Function", "4x Urinalysis", "4x Blood Group", "4x Hemoglobin",
                "4x Blood Pressure", "4x BMI"),
            Arrays.asList("Family coverage", "35% savings", "Flexible scheduling"),
            true, false, 2));

        packages.add(createPackage("FAM-COUPLE-001", "Couple Health Package",
            "Health screening package for couples",
            PackageType.FAMILY, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("6000"), new BigDecimal("8000"), 30, 48,
            Arrays.asList("2x CBC", "2x Lipid Profile", "2x Liver Function", "2x Kidney Function",
                "2x Thyroid Profile", "2x Blood Sugar", "2x HbA1c", "2x Vitamin D",
                "2x Vitamin B12", "2x Urinalysis", "2x ECG", "2x Blood Group",
                "2x Iron Studies", "2x Blood Pressure", "2x BMI"),
            Arrays.asList("Couples discount", "Joint appointment available",
                "Combined health report option"),
            true, true, 3));

        packages.add(createPackage("FAM-SENIOR-001", "Senior Parents Health Package (2 Members)",
            "Specialized health screening for elderly parents",
            PackageType.FAMILY, PackageTier.GOLD, AgeGroup.SENIOR, Gender.ALL,
            new BigDecimal("14000"), new BigDecimal("20000"), 50, 72,
            Arrays.asList("2x CBC", "2x Complete Metabolic Panel", "2x Lipid Profile",
                "2x Thyroid Complete", "2x HbA1c", "2x Vitamin D", "2x Vitamin B12",
                "2x Iron Studies", "2x Calcium", "2x Bone Density Screen",
                "2x Cardiac Panel", "2x ECG", "2x 2D Echo", "2x Kidney Function",
                "2x Liver Function", "2x PSA/CA-125", "2x Urinalysis",
                "2x Vision Check", "2x Hearing Test", "2x Memory Assessment",
                "2x Fall Risk Assessment", "2x Blood Pressure", "2x Blood Group",
                "Geriatrician Consultation", "Home Collection Available"),
            Arrays.asList("Senior-focused screening", "Bone and heart health",
                "Cognitive assessment", "Home sample collection"),
            true, true, 4));

        return packages;
    }

    // ==================== PREVENTIVE PACKAGES ====================

    private List<TestPackage> createPreventivePackages() {
        List<TestPackage> packages = new ArrayList<>();

        packages.add(createPackage("PREV-HEART-001", "Heart Attack Prevention Package",
            "Comprehensive cardiac risk assessment and prevention",
            PackageType.PREVENTIVE, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("7000"), new BigDecimal("10000"), 25, 48,
            Arrays.asList("Advanced Lipid Profile", "Lp(a)", "ApoA1", "ApoB", "ApoB/ApoA1 Ratio",
                "sdLDL", "ox-LDL", "Homocysteine", "hs-CRP", "Fibrinogen", "D-Dimer",
                "Troponin T", "NT-proBNP", "Uric Acid", "HbA1c", "Fasting Insulin",
                "ECG", "TMT", "2D Echo", "Carotid Doppler", "CT Calcium Score",
                "Blood Pressure 24hr", "Body Composition", "Stress Assessment", "Cardiac CT"),
            Arrays.asList("10-year heart risk calculation", "Comprehensive cardiac imaging",
                "Advanced lipid analysis", "Lifestyle modification plan"),
            true, true, 1));

        packages.add(createPackage("PREV-STROKE-001", "Stroke Prevention Package",
            "Brain and vascular health screening for stroke prevention",
            PackageType.PREVENTIVE, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("8000"), new BigDecimal("11000"), 22, 72,
            Arrays.asList("Lipid Profile", "Homocysteine", "hs-CRP", "Fibrinogen", "D-Dimer",
                "Prothrombin Time", "APTT", "Protein C", "Protein S", "Antithrombin III",
                "Factor V Leiden", "Lipoprotein(a)", "HbA1c", "Blood Pressure 24hr",
                "ECG", "Carotid Doppler", "Transcranial Doppler", "MRI Brain",
                "MRA Brain Vessels", "2D Echo", "Blood Viscosity", "Platelet Function"),
            Arrays.asList("Stroke risk assessment", "Brain vascular imaging",
                "Clotting disorder screening", "Neurologist consultation"),
            true, true, 2));

        packages.add(createPackage("PREV-DIAB-001", "Diabetes Prevention Package",
            "Pre-diabetes screening and diabetes risk assessment",
            PackageType.PREVENTIVE, PackageTier.SILVER, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("3500"), new BigDecimal("4800"), 15, 24,
            Arrays.asList("Fasting Blood Sugar", "HbA1c", "Fasting Insulin", "HOMA-IR",
                "C-Peptide", "75g OGTT (2-hour)", "Lipid Profile", "Liver Function",
                "Kidney Function", "Uric Acid", "Body Composition", "Vitamin D",
                "Magnesium", "Chromium", "Albumin/Creatinine Ratio"),
            Arrays.asList("Pre-diabetes detection", "Insulin resistance assessment",
                "Metabolic syndrome screening", "Dietary intervention plan"),
            true, true, 3));

        packages.add(createPackage("PREV-OSTEO-001", "Osteoporosis Prevention Package",
            "Bone health assessment and fracture risk evaluation",
            PackageType.PREVENTIVE, PackageTier.SILVER, AgeGroup.MIDDLE_AGE, Gender.ALL,
            new BigDecimal("4500"), new BigDecimal("6000"), 15, 48,
            Arrays.asList("DEXA Bone Density", "Calcium", "Phosphorus", "Magnesium",
                "Vitamin D", "Vitamin K", "Parathyroid Hormone", "Osteocalcin",
                "CTX (Bone Resorption)", "P1NP (Bone Formation)", "Alkaline Phosphatase",
                "Total Protein", "Albumin", "Thyroid TSH", "Testosterone/Estradiol"),
            Arrays.asList("DEXA scan included", "Bone turnover markers",
                "Fracture risk calculation", "Bone health plan"),
            true, false, 4));

        packages.add(createPackage("PREV-LUNG-001", "Lung Cancer Screening Package",
            "Early lung cancer detection for high-risk individuals",
            PackageType.PREVENTIVE, PackageTier.GOLD, AgeGroup.ALL, Gender.ALL,
            new BigDecimal("6000"), new BigDecimal("8000"), 12, 48,
            Arrays.asList("Low-Dose CT Chest", "Pulmonary Function Test", "NSE", "Cyfra 21-1",
                "Pro-GRP", "SCC", "CEA", "Sputum Cytology", "Chest X-Ray", "SpO2",
                "Smoking Risk Assessment", "Spirometry"),
            Arrays.asList("Early detection CT scan", "Tumor marker screening",
                "Smoker-focused assessment", "Pulmonologist consultation"),
            true, true, 5));

        packages.add(createPackage("PREV-COL-001", "Colorectal Cancer Prevention Package",
            "Colon cancer screening and prevention",
            PackageType.PREVENTIVE, PackageTier.SILVER, AgeGroup.MIDDLE_AGE, Gender.ALL,
            new BigDecimal("4000"), new BigDecimal("5500"), 10, 72,
            Arrays.asList("FIT (Fecal Immunochemical)", "Stool DNA Test", "CEA", "CA 19-9",
                "CBC", "Iron Studies", "Liver Function", "Abdominal Ultrasound",
                "Colonoscopy Prep (if indicated)", "Diet Risk Assessment"),
            Arrays.asList("Non-invasive stool tests", "Colonoscopy referral if needed",
                "Family history assessment", "Diet modification plan"),
            true, false, 6));

        packages.add(createPackage("PREV-ALZH-001", "Cognitive Health & Alzheimer's Prevention",
            "Brain health assessment and dementia risk screening",
            PackageType.PREVENTIVE, PackageTier.GOLD, AgeGroup.SENIOR, Gender.ALL,
            new BigDecimal("12000"), new BigDecimal("16000"), 20, 96,
            Arrays.asList("Cognitive Assessment Battery", "Memory Testing", "MRI Brain",
                "Vitamin B12", "Folate", "Homocysteine", "Thyroid Profile", "HbA1c",
                "Lipid Profile", "Vitamin D", "ApoE Genotype", "Beta-Amyloid Markers",
                "Tau Protein", "Inflammatory Markers", "Heavy Metals",
                "Sleep Quality Assessment", "Depression Screening",
                "Cardiovascular Risk", "Carotid Doppler", "Neuropsychological Evaluation"),
            Arrays.asList("Comprehensive cognitive testing", "Brain MRI included",
                "Genetic risk assessment", "Neurologist consultation",
                "Brain health optimization plan"),
            true, true, 7));

        return packages;
    }

    // ==================== HELPER METHODS ====================

    private TestPackage createPackage(String code, String name, String description,
            PackageType type, PackageTier tier, AgeGroup ageGroup, Gender gender,
            BigDecimal discountedPrice, BigDecimal totalPrice, int totalTests,
            int turnaroundHours, List<String> includedTests, List<String> benefits,
            boolean homeCollection, boolean isPopular, int displayOrder) {

        BigDecimal savingsAmount = totalPrice.subtract(discountedPrice);
        BigDecimal discountPercentage = savingsAmount
                .multiply(new BigDecimal("100"))
                .divide(totalPrice, 2, RoundingMode.HALF_UP);

        return TestPackage.builder()
                .packageCode(code)
                .packageName(name)
                .description(description)
                .packageType(type)
                .packageTier(tier)
                .ageGroup(ageGroup)
                .genderApplicable(gender)
                .totalTests(totalTests)
                .basePrice(totalPrice)
                .totalPrice(totalPrice)
                .discountedPrice(discountedPrice)
                .discountPercentage(discountPercentage)
                .savingsAmount(savingsAmount)
                .turnaroundHours(turnaroundHours)
                .includedTestNames(new ArrayList<>(includedTests))
                .benefits(new ArrayList<>(benefits))
                .preparations(new ArrayList<>())
                .homeCollectionAvailable(homeCollection)
                .homeCollectionCharges(homeCollection ? new BigDecimal("150") : BigDecimal.ZERO)
                .fastingRequired(tier == PackageTier.GOLD || tier == PackageTier.PLATINUM)
                .fastingHours(tier == PackageTier.GOLD || tier == PackageTier.PLATINUM ? 10 : null)
                .isActive(true)
                .isPopular(isPopular)
                .isRecommended(isPopular)
                .displayOrder(displayOrder)
                .badgeText(isPopular ? "Most Popular" : (savingsAmount.compareTo(new BigDecimal("2000")) > 0 ? "Best Value" : null))
                .build();
    }
}

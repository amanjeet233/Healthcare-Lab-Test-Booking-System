package com.healthcare.labtestbooking.config;

import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.enums.PackageTier;
import com.healthcare.labtestbooking.entity.enums.PackageType;
import com.healthcare.labtestbooking.repository.TestPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class HealthPackagesDataLoader implements CommandLineRunner {

    private final TestPackageRepository testPackageRepository;

    @Override
    public void run(String... args) {
        if (testPackageRepository.count() > 50) {
            log.info("Health Packages already seeded.");
            return;
        }

        log.info("Starting seed for 136 Health Packages...");
        
        seedMensPackages();
        seedWomensPackages();
        seedCouplePackages();
        seedChildPackages();
        seedSeniorMenPackages();
        seedSeniorWomenPackages();
        seedVitaminPackages();
        
        log.info("Finished seeding Health Packages.");
    }

    private void seedMensPackages() {
        createPackage("M1", "Men's Basic Silver Package", PackageType.MEN, PackageTier.SILVER, 
            999, 48, 8, true, 0, false, false, "Young healthy individuals", 
            Arrays.asList("CBC", "FBS", "Lipid Profile", "LFT", "RFT", "Urine Routine", "TSH"), 7);
            
        createPackage("M9", "Men's Health Gold Package", PackageType.MEN, PackageTier.GOLD, 
            2499, 48, 8, true, 1, true, false, "Adults with lifestyle risks", 
            Arrays.asList("CBC", "Lipid Profile", "LFT", "RFT", "Thyroid", "Vitamins", "PSA", "ECG", "Chest X-Ray"), 25);
            
        createPackage("M17", "Men's Complete Platinum Package", PackageType.MEN, PackageTier.PLATINUM, 
            4999, 72, 8, true, 2, true, false, "Executive health", 
            Arrays.asList("All Gold tests", "Vitamin Panel", "Minerals", "Tumor Markers", "Cardiac Markers", "USG Abdomen"), 50);

        createPackage("M21", "Men's Ultimate Advanced Package", PackageType.MEN, PackageTier.ADVANCED, 
            8999, 96, 8, true, 3, true, true, "Preventive healthcare", 
            Arrays.asList("All Platinum tests", "Whole Body MRI Screening", "Genetic Testing", "Cardiac CT"), 80);
            
        // Mock generation for the remaining Men's packages up to 25 to fulfill quota dynamically
        for(int i=2; i<=8; i++) {
             createPackage("M"+i, "Men's Silver Variation " + i, PackageType.MEN, PackageTier.SILVER, 1200+i*50, 48, 8, true, 0, false, false, "Standard Screening", Arrays.asList("Basic Screening Panel"), 12+i);
        }
        for(int i=10; i<=16; i++) {
             createPackage("M"+i, "Men's Gold Variation " + i, PackageType.MEN, PackageTier.GOLD, 2500+i*50, 48, 8, true, 1, true, false, "Premium Screening", Arrays.asList("Premium Screening Panel"), 30+i);
        }
        for(int i=18; i<=20; i++) {
             createPackage("M"+i, "Men's Platinum Variation " + i, PackageType.MEN, PackageTier.PLATINUM, 5000+i*50, 72, 8, true, 2, true, false, "Executive Screening", Arrays.asList("Executive Screening Panel"), 50+i);
        }
        for(int i=22; i<=25; i++) {
             createPackage("M"+i, "Men's Advanced Variation " + i, PackageType.MEN, PackageTier.ADVANCED, 8000+i*50, 96, 8, true, 3, true, true, "Ultimate Screening", Arrays.asList("Ultimate Screening Panel"), 80+i);
        }
    }

    private void seedWomensPackages() {
        createPackage("W1", "Women's Basic Silver Package", PackageType.WOMEN, PackageTier.SILVER, 
            999, 48, 8, true, 0, false, false, "Young healthy individuals", Arrays.asList("CBC", "FBS", "Lipid Profile", "LFT", "RFT", "Urine Routine", "TSH"), 7);
        for(int i=2; i<=8; i++) createPackage("W"+i, "Women's Silver Variation " + i, PackageType.WOMEN, PackageTier.SILVER, 1200, 48, 8, true, 0, false, false, "Standard", Arrays.asList("Panel"), 15);
        for(int i=9; i<=16; i++) createPackage("W"+i, "Women's Gold Variation " + i, PackageType.WOMEN, PackageTier.GOLD, 2500, 48, 8, true, 1, true, false, "Premium", Arrays.asList("Panel"), 35);
        for(int i=17; i<=22; i++) createPackage("W"+i, "Women's Platinum Variation " + i, PackageType.WOMEN, PackageTier.PLATINUM, 5500, 72, 8, true, 2, true, false, "Executive", Arrays.asList("Panel"), 60);
        for(int i=23; i<=28; i++) createPackage("W"+i, "Women's Advanced Variation " + i, PackageType.WOMEN, PackageTier.ADVANCED, 8500, 96, 8, true, 3, true, true, "Ultimate", Arrays.asList("Panel"), 90);
    }

    private void seedCouplePackages() {
        for(int i=1; i<=5; i++) createPackage("C"+i, "Couple Silver Package " + i, PackageType.COUPLE, PackageTier.SILVER, 2999, 48, 8, true, 0, false, false, "Couples", Arrays.asList("Panel"), 30);
        for(int i=6; i<=9; i++) createPackage("C"+i, "Couple Gold Package " + i, PackageType.COUPLE, PackageTier.GOLD, 5999, 48, 8, true, 1, true, false, "Couples", Arrays.asList("Panel"), 60);
        for(int i=10; i<=12; i++) createPackage("C"+i, "Couple Platinum " + i, PackageType.COUPLE, PackageTier.PLATINUM, 8999, 72, 8, true, 2, true, false, "Couples", Arrays.asList("Panel"), 100);
        for(int i=13; i<=15; i++) createPackage("C"+i, "Couple Advanced " + i, PackageType.COUPLE, PackageTier.ADVANCED, 12999, 96, 8, true, 3, true, true, "Couples", Arrays.asList("Panel"), 150);
    }
    
    private void seedChildPackages() {
        for(int i=1; i<=6; i++) createPackage("CH"+i, "Child Silver Package " + i, PackageType.CHILD, PackageTier.SILVER, 799, 24, 0, false, 0, false, false, "Children", Arrays.asList("Panel"), 10);
        for(int i=7; i<=12; i++) createPackage("CH"+i, "Child Gold Package " + i, PackageType.CHILD, PackageTier.GOLD, 1999, 48, 0, false, 1, false, false, "Children", Arrays.asList("Panel"), 20);
        for(int i=13; i<=15; i++) createPackage("CH"+i, "Child Platinum " + i, PackageType.CHILD, PackageTier.PLATINUM, 3999, 48, 0, false, 2, true, true, "Children", Arrays.asList("Panel"), 40);
        for(int i=16; i<=18; i++) createPackage("CH"+i, "Child Advanced " + i, PackageType.CHILD, PackageTier.ADVANCED, 5999, 72, 0, false, 3, true, true, "Children", Arrays.asList("Panel"), 60);
    }

    private void seedSeniorMenPackages() {
        for(int i=1; i<=7; i++) createPackage("SM"+i, "Senior Men Silver " + i, PackageType.SENIOR_MEN, PackageTier.SILVER, 1499, 48, 8, true, 0, false, false, "Seniors", Arrays.asList("Panel"), 20);
        for(int i=8; i<=10; i++) createPackage("SM"+i, "Senior Men Gold " + i, PackageType.SENIOR_MEN, PackageTier.GOLD, 3499, 48, 8, true, 1, true, false, "Seniors", Arrays.asList("Panel"), 40);
        for(int i=11; i<=13; i++) createPackage("SM"+i, "Senior Men Platinum " + i, PackageType.SENIOR_MEN, PackageTier.PLATINUM, 5999, 72, 8, true, 2, true, false, "Seniors", Arrays.asList("Panel"), 60);
        for(int i=14; i<=15; i++) createPackage("SM"+i, "Senior Men Advanced " + i, PackageType.SENIOR_MEN, PackageTier.ADVANCED, 8999, 96, 8, true, 3, true, true, "Seniors", Arrays.asList("Panel"), 80);
    }

    private void seedSeniorWomenPackages() {
        for(int i=1; i<=7; i++) createPackage("SW"+i, "Senior Women Silver " + i, PackageType.SENIOR_WOMEN, PackageTier.SILVER, 1499, 48, 8, true, 0, false, false, "Seniors", Arrays.asList("Panel"), 20);
        for(int i=8; i<=11; i++) createPackage("SW"+i, "Senior Women Gold " + i, PackageType.SENIOR_WOMEN, PackageTier.GOLD, 3499, 48, 8, true, 1, true, false, "Seniors", Arrays.asList("Panel"), 40);
        for(int i=12; i<=14; i++) createPackage("SW"+i, "Senior Women Platinum " + i, PackageType.SENIOR_WOMEN, PackageTier.PLATINUM, 5999, 72, 8, true, 2, true, false, "Seniors", Arrays.asList("Panel"), 60);
        for(int i=15; i<=15; i++) createPackage("SW"+i, "Senior Women Advanced " + i, PackageType.SENIOR_WOMEN, PackageTier.ADVANCED, 8999, 96, 8, true, 3, true, true, "Seniors", Arrays.asList("Panel"), 80);
    }

    private void seedVitaminPackages() {
        for(int i=1; i<=6; i++) createPackage("V"+i, "Vitamin Silver " + i, PackageType.VITAMINS, PackageTier.SILVER, 999, 48, 8, true, 0, false, false, "Everyone", Arrays.asList("Vitamins"), 10);
        for(int i=7; i<=12; i++) createPackage("V"+i, "Vitamin Gold " + i, PackageType.VITAMINS, PackageTier.GOLD, 1999, 48, 8, true, 1, false, false, "Everyone", Arrays.asList("Vitamins"), 20);
        for(int i=13; i<=16; i++) createPackage("V"+i, "Vitamin Platinum " + i, PackageType.VITAMINS, PackageTier.PLATINUM, 3999, 48, 8, true, 2, false, false, "Dietary Risks", Arrays.asList("Vitamins"), 40);
        for(int i=17; i<=20; i++) createPackage("V"+i, "Vitamin Advanced " + i, PackageType.VITAMINS, PackageTier.ADVANCED, 5999, 72, 8, true, 3, false, true, "Therapeutic Need", Arrays.asList("Vitamins", "Genetics"), 60);
    }

    private void createPackage(String code, String name, PackageType type, PackageTier tier, int price, 
                               int turnaroundHours, int fastingHours, boolean fastingRequired, 
                               int consults, boolean imaging, boolean genetic, String bestFor, 
                               List<String> tests, int totalTestsCount) {
                               
        TestPackage pack = TestPackage.builder()
                .packageCode(code)
                .packageName(name)
                .packageType(type)
                .packageTier(tier)
                .basePrice(new BigDecimal(price * 1.5))
                .totalPrice(new BigDecimal(price * 1.5))
                .discountedPrice(new BigDecimal(price))
                .turnaroundHours(turnaroundHours)
                .fastingRequired(fastingRequired)
                .fastingHours(fastingHours)
                .doctorConsultations(consults)
                .imagingIncluded(imaging)
                .geneticTesting(genetic)
                .bestFor(bestFor)
                .includedTestNames(tests)
                .totalTests(totalTestsCount)
                .features(Arrays.asList("Home Sample Collection", "Smart Report via App", "NABL Accredited LAB"))
                .isPopular(code.equals("M9") || code.equals("V7") || code.equals("W9"))
                .isActive(true)
                .badgeText(tier.getDisplayName())
                .build();
                
        testPackageRepository.save(pack);
    }
}

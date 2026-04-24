package com.healthcare.labtestbooking.seed;

import com.healthcare.labtestbooking.entity.LabTest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class TestsSeedData {

    public static List<LabTest> generateTestsData() {
        List<LabTest> tests = new ArrayList<>();
        
        String[] categories = {
            "Blood Studies", "Hospital Health Check", "Pregnancy", "Allergy", "Fever",
            "Men's Health", "Women's Health", "Heart", "Diabetes", "Kidney", "Senior Citizen",
            "Fever and Infection", "Vitamin", "Covid 19", "Hepatitis Screening",
            "Reproductive & Fertility", "Full Body Checkup", "Hormone Screening",
            "Joint Pain", "PCOD Screening", "Weight Management"
        };
        
        String[] prefixes = {"Complete", "Advanced", "Basic", "Comprehensive", "Premier", "Routine", "Standard", "Essential", "Primary", "Preventive"};
        String[] baseNames = {"Blood Count", "Lipid Profile", "Liver Function", "Kidney Panel", "Thyroid Test", "Vitamin Group", "Iron Studies", "Allergy Panel", "Diabetic Profile", "Cardiac Risk Assessement"};
        String[] suffixes = {"Screening", "Checkup", "Evaluation", "Assessment", "Test", "Panel", "Profile", "Analysis", "Study", "Scan"};
        
        // Let's generate 500 tests exactly
        int count = 1;
        
        for (int i = 0; i < 500; i++) {
            String prefix = prefixes[i % prefixes.length];
            String baseName = baseNames[(i / prefixes.length) % baseNames.length];
            String suffix = suffixes[(i / (prefixes.length * baseNames.length)) % suffixes.length];
            String category = categories[i % categories.length];
            
            // Generate realistic names
            String name = prefix + " " + baseName + " " + suffix + (i >= prefixes.length * baseNames.length * suffixes.length ? " V" + count : "");
            String slug = name.toLowerCase().replaceAll("[^a-z0-9]", "-") + "-" + count;
            
            // Prices between 100 and 5000
            int basePrice = 300 + (Math.abs(name.hashCode()) % 4700);
            BigDecimal originalPrice = new BigDecimal(basePrice);
            // 60% discount exactly
            BigDecimal discountedPrice = originalPrice.multiply(new BigDecimal(0.40)).setScale(2, java.math.RoundingMode.HALF_UP);
            int discountPercent = 60;
            
            LabTest test = new LabTest();
            test.setTestCode(slug);
            test.setTestName(name);
            test.setCategoryName(category);
            test.setIsPackage((i % 7) == 0);
            test.setOriginalPrice(originalPrice);
            test.setDiscountedPrice(discountedPrice);
            test.setDiscountPercent(discountPercent);
            test.setParametersCount(5 + (i % 65)); // 5 to 70 parameters
            test.setDescription("Top recommended test for checking " + baseName + ". Includes comprehensive parameters for " + category + " checkups. Designed to give you an accurate assessment.");
            test.setRecommendedFor((i % 2 == 0) ? "Males & Females" : "All Age Groups");
            test.setIsTopBooked(i < 50 || i % 15 == 0);
            test.setIsTopDeal(i % 12 == 0);
            test.setFastingRequired(i % 3 == 0);
            test.setFastingHours(test.getFastingRequired() ? 10 : 0);
            test.setReportTimeHours(12 + (i % 36)); // 12 to 48 hours
            
            // Random reliable unsplash image URLs
            String[] images = {
                "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1628348068571-0857ef51de2f?auto=format&fit=crop&q=80&w=400",
                "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=400"
            };
            test.setIconUrl(images[i % images.length]);
            
            test.setIsActive(true);
            test.setTagsJson("[]");
            test.setSubTestsJson("[]");
            
            tests.add(test);
            count++;
        }
        
        return tests;
    }
}
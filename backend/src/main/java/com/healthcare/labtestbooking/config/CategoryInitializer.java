package com.healthcare.labtestbooking.config;

import com.healthcare.labtestbooking.entity.TestCategory;
import com.healthcare.labtestbooking.repository.TestCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1) // Run before DataInitializer
public class CategoryInitializer implements CommandLineRunner {

    private final TestCategoryRepository testCategoryRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("========== CATEGORY INITIALIZER STARTED ==========");
        
        if (testCategoryRepository.count() == 0) {
            log.info("Initializing test categories...");
            
            List<TestCategory> categories = Arrays.asList(
                createTestCategory("Blood Tests", "Complete blood count, glucose, lipid profile etc.", 1),
                createTestCategory("Thyroid Tests", "TSH, T3, T4 and related thyroid function tests", 2),
                createTestCategory("Liver Tests", "Liver function tests including enzymes and proteins", 3),
                createTestCategory("Kidney Tests", "Kidney function tests including creatinine, BUN", 4),
                createTestCategory("Cardiac Tests", "Heart-related tests including lipid profile, cardiac enzymes", 5),
                createTestCategory("Urinalysis", "Urine analysis and related tests", 6),
                createTestCategory("Infectious Disease", "Tests for various infectious diseases", 7),
                createTestCategory("Tumor Markers", "Cancer screening and monitoring tests", 8)
            );
            
            testCategoryRepository.saveAll(categories);
            log.info("✓ Added {} test categories", categories.size());
        } else {
            log.info("✓ Test categories already exist (count: {})", testCategoryRepository.count());
        }
        
        log.info("========== CATEGORY INITIALIZER COMPLETED ==========");
    }
    
    private TestCategory createTestCategory(String name, String description, Integer order) {
        TestCategory category = new TestCategory();
        category.setCategoryName(name);
        category.setDescription(description);
        category.setDisplayOrder(order);
        category.setIsActive(true);
        return category;
    }
}

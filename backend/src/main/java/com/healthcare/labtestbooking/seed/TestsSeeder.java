package com.healthcare.labtestbooking.seed;

import com.healthcare.labtestbooking.config.TestParametersDataLoader;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Seeds 88 lab tests into the database on application startup
 * Checks if tests already exist to avoid duplicates
 * Also triggers loading of test parameters after seeding
 */
@Configuration
@Slf4j
@RequiredArgsConstructor
public class TestsSeeder {

    private final LabTestRepository labTestRepository;
    private final TestParametersDataLoader testParametersDataLoader;

    @Bean
    public CommandLineRunner loadTests() {
        return args -> {
            log.info("🔍 Checking if lab tests need to be seeded...");
            
            // Check if tests already exist
            long existingCount = labTestRepository.count();
            
            if (existingCount >= 500) {
                log.info("✅ Lab tests already seeded ({} tests found). Skipping seed.", existingCount);
                return;
            }
            
            try {
                log.info("📚 Starting lab tests seed operation (Current count: {})...", existingCount);
                
                // Generate test data (500 tests)
                List<LabTest> allGeneratedTests = TestsSeedData.generateTestsData();
                
                // Filter out tests that already exist by slug to avoid Unique Constraint violation
                List<LabTest> newTests = allGeneratedTests.stream()
                    .filter(t -> !labTestRepository.existsByTestCode(t.getTestCode()))
                    .toList();
                
                if (!newTests.isEmpty()) {
                    log.info("Saving {} new tests to reach 500+", newTests.size());
                    labTestRepository.saveAll(newTests);
                    log.info("✅ Successfully seeded {} new lab tests!", newTests.size());
                } else {
                    log.info("No new tests were unique. Count remains at {}.", labTestRepository.count());
                }
                
                // Log category breakdown
                logCategoryBreakdown();
                
                // NOW load test parameters after tests are seeded
                log.info("⏳ Loading test parameters...");
                testParametersDataLoader.loadParametersForTests();
                
            } catch (Exception e) {
                log.error("❌ Error seeding lab tests", e);
            }
        };
    }

    private void logCategoryBreakdown() {
        try {
            log.info("\n========== LAB TESTS BY CATEGORY ==========");
            log.info("BLOOD Tests: {}", labTestRepository.countByCategory("BLOOD"));
            log.info("URINE Tests: {}", labTestRepository.countByCategory("URINE"));
            log.info("IMAGING Tests: {}", labTestRepository.countByCategory("IMAGING"));
            log.info("PATHOLOGY Tests: {}", labTestRepository.countByCategory("PATHOLOGY"));
            log.info("==========================================\n");
        } catch (Exception e) {
            log.debug("Could not log category breakdown", e);
        }
    }
}

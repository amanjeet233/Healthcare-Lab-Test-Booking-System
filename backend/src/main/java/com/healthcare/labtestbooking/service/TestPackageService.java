package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.*;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.TestPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TestPackageService {

    private final TestPackageRepository testPackageRepository;
    private final LabTestRepository labTestRepository;

    // Pricing constants
    private static final BigDecimal INDIVIDUAL_TEST_DISCOUNT = new BigDecimal("0.00");
    private static final BigDecimal MULTI_TEST_DISCOUNT = new BigDecimal("10.00");     // 2-5 tests
    private static final BigDecimal PACKAGE_DISCOUNT = new BigDecimal("20.00");         // 6-15 tests
    private static final BigDecimal GOLD_PACKAGE_DISCOUNT = new BigDecimal("30.00");    // 16-30 tests
    private static final BigDecimal PLATINUM_DISCOUNT = new BigDecimal("35.00");        // 31-50 tests
    private static final BigDecimal DIAMOND_DISCOUNT = new BigDecimal("40.00");         // 50+ tests
    private static final BigDecimal BUNDLE_EXTRA_DISCOUNT = new BigDecimal("5.00");     // Multiple packages

    // ==================== CRUD Operations ====================

    @Transactional
    public TestPackage savePackage(TestPackage testPackage) {
        log.info("Saving test package: {}", testPackage.getPackageName());
        calculateAndSetPricing(testPackage);
        return testPackageRepository.save(testPackage);
    }

    public Optional<TestPackage> getPackageById(Long id) {
        return testPackageRepository.findById(id);
    }

    public Optional<TestPackage> getPackageByCode(String code) {
        return testPackageRepository.findByPackageCode(code);
    }

    public List<TestPackage> getAllPackages() {
        return testPackageRepository.findAll();
    }

    @Cacheable(value = "packages")
    public List<TestPackage> getActivePackages() {
        return testPackageRepository.findByIsActiveTrue();
    }

    public Page<TestPackage> getActivePackages(Pageable pageable) {
        return testPackageRepository.findAll(pageable);
    }

    @Transactional
    public void deletePackage(Long id) {
        log.info("Deleting test package with id: {}", id);
        testPackageRepository.deleteById(id);
    }

    // ==================== Package Filtering ====================

    @Cacheable(value = "packages", key = "'type_' + #type")
    public List<TestPackage> getPackagesByType(PackageType type) {
        return testPackageRepository.findByPackageTypeAndIsActiveTrueOrderByDisplayOrderAsc(type);
    }

    @Cacheable(value = "packages", key = "'type_page_' + #type + '_' + #pageable.pageNumber")
    public Page<TestPackage> getPackagesByType(PackageType type, Pageable pageable) {
        return testPackageRepository.findByPackageTypeAndIsActiveTrue(type, pageable);
    }

    @Cacheable(value = "packages", key = "'tier_' + #tier")
    public List<TestPackage> getPackagesByTier(PackageTier tier) {
        return testPackageRepository.findByPackageTierAndIsActiveTrueOrderByDiscountedPriceAsc(tier);
    }

    public List<TestPackage> getPackagesByAge(int age) {
        AgeGroup ageGroup = AgeGroup.fromAge(age);
        return testPackageRepository.findByAgeGroupIncludingAll(ageGroup);
    }

    public List<TestPackage> getTopPackagesByAge(int age, int limit) {
        return getPackagesByAge(age).stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<TestPackage> getPackagesByGender(Gender gender) {
        return testPackageRepository.findByGenderIncludingAll(gender);
    }

    public List<TestPackage> getPackagesByProfession(String profession) {
        return testPackageRepository.findByProfessionContaining(profession);
    }

    public List<TestPackage> getPackagesByHealthCondition(String condition) {
        return testPackageRepository.findByHealthConditionContaining(condition);
    }

    @Cacheable(value = "packages", key = "'popular'")
    public List<TestPackage> getPopularPackages() {
        return testPackageRepository.findByIsPopularTrueAndIsActiveTrueOrderByDisplayOrderAsc();
    }

    public List<TestPackage> getRecommendedPackages() {
        return testPackageRepository.findByIsRecommendedTrueAndIsActiveTrueOrderByDisplayOrderAsc();
    }

    public Page<TestPackage> searchPackages(String keyword, Pageable pageable) {
        return testPackageRepository.searchPackages(keyword, pageable);
    }

    @Cacheable(value = "packages", key = "T(java.util.Objects).hash(#type, #tier, #ageGroup, #gender, #minPrice, #maxPrice, #pageable.pageNumber, #pageable.pageSize)")
    public Page<TestPackage> filterPackages(PackageType type, PackageTier tier, AgeGroup ageGroup,
                                            Gender gender, BigDecimal minPrice, BigDecimal maxPrice,
                                            Pageable pageable) {
        return testPackageRepository.findByFilters(type, tier, ageGroup, gender, minPrice, maxPrice, pageable);
    }

    public List<TestPackage> getPackagesByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return testPackageRepository.findByPriceRange(minPrice, maxPrice);
    }

    public List<TestPackage> getTopSavingPackages(int limit) {
        return testPackageRepository.findTopSavingPackages(PageRequest.of(0, limit));
    }

    @Cacheable(value = "packages", key = "'best_deals'")
    public List<TestPackage> getBestDeals() {
        return testPackageRepository.findTopSavingPackages(PageRequest.of(0, 8));
    }

    // ==================== Smart Recommendations ====================

    public List<TestPackage> getRecommendedPackages(User user) {
        List<TestPackage> recommendations = new ArrayList<>();

        // Get age-based recommendations
        if (user.getDateOfBirth() != null) {
            int age = Period.between(user.getDateOfBirth(), LocalDate.now()).getYears();
            recommendations.addAll(getTopPackagesByAge(age, 2));
        }

        // Get gender-based recommendations
        if (user.getGender() != null) {
            recommendations.addAll(
                getPackagesByGender(user.getGender()).stream()
                    .limit(2)
                    .toList()
            );
        }

        // Add popular packages
        recommendations.addAll(
            getPopularPackages().stream()
                .limit(2)
                .toList()
        );

        // Remove duplicates and limit
        return recommendations.stream()
                .distinct()
                .limit(5)
                .collect(Collectors.toList());
    }

    public TestPackage getBestValuePackage(List<Long> testIds) {
        if (testIds == null || testIds.isEmpty()) {
            return null;
        }

        // Find all packages
        List<TestPackage> allPackages = getActivePackages();

        // Find packages that include most of the selected tests
        return allPackages.stream()
                .filter(pkg -> pkg.getTests() != null)
                .max(Comparator.comparingDouble(pkg -> {
                    long matchingTests = pkg.getTests().stream()
                            .filter(test -> testIds.contains(test.getId()))
                            .count();
                    // Score based on matching tests and value
                    double coverage = (double) matchingTests / testIds.size();
                    double discount = pkg.getDiscountPercentage() != null ?
                            pkg.getDiscountPercentage().doubleValue() : 0;
                    return coverage * 100 + discount;
                }))
                .orElse(null);
    }

    // ==================== Dynamic Pricing ====================

    public BigDecimal calculateDynamicPrice(List<Long> testIds) {
        if (testIds == null || testIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<LabTest> tests = labTestRepository.findAllById(testIds);
        BigDecimal totalPrice = tests.stream()
                .map(LabTest::getPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountPercentage = calculateDiscountPercentage(tests.size());
        return applyDiscount(totalPrice, discountPercentage);
    }

    public BigDecimal calculateDiscountPercentage(int numberOfTests) {
        if (numberOfTests >= 50) return DIAMOND_DISCOUNT;
        if (numberOfTests >= 30) return PLATINUM_DISCOUNT;
        if (numberOfTests >= 16) return GOLD_PACKAGE_DISCOUNT;
        if (numberOfTests >= 6) return PACKAGE_DISCOUNT;
        if (numberOfTests >= 2) return MULTI_TEST_DISCOUNT;
        return INDIVIDUAL_TEST_DISCOUNT;
    }

    public BigDecimal applyDiscount(BigDecimal basePrice, BigDecimal discountPercentage) {
        if (basePrice == null || discountPercentage == null) {
            return basePrice;
        }
        BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                discountPercentage.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
        );
        return basePrice.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP);
    }

    public PackageTier determineTierFromTestCount(int testCount) {
        return PackageTier.fromTestCount(testCount);
    }

    @Transactional
    public void calculateAndSetPricing(TestPackage testPackage) {
        if (testPackage.getTests() != null && !testPackage.getTests().isEmpty()) {
            // Calculate base price from individual tests
            BigDecimal basePrice = testPackage.getTests().stream()
                    .map(LabTest::getPrice)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            testPackage.setBasePrice(basePrice);
            testPackage.setTotalPrice(basePrice);
            testPackage.setTotalTests(testPackage.getTests().size());

            // Determine tier and discount
            if (testPackage.getPackageTier() == null) {
                testPackage.setPackageTier(determineTierFromTestCount(testPackage.getTests().size()));
            }

            BigDecimal discountPercent = testPackage.getPackageTier().getDiscountPercentage();
            testPackage.setDiscountPercentage(discountPercent);

            // Calculate discounted price
            BigDecimal discountedPrice = applyDiscount(basePrice, discountPercent);
            testPackage.setDiscountedPrice(discountedPrice);

            // Calculate savings
            testPackage.setSavingsAmount(basePrice.subtract(discountedPrice));
        }
    }

    // ==================== Savings Calculation ====================

    public Map<String, Object> getPackageSavings(List<Long> testIds) {
        Map<String, Object> result = new HashMap<>();

        if (testIds == null || testIds.isEmpty()) {
            result.put("individualTotal", BigDecimal.ZERO);
            result.put("packagePrice", BigDecimal.ZERO);
            result.put("savings", BigDecimal.ZERO);
            result.put("savingsPercentage", BigDecimal.ZERO);
            return result;
        }

        List<LabTest> tests = labTestRepository.findAllById(testIds);

        // Individual total
        BigDecimal individualTotal = tests.stream()
                .map(LabTest::getPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Package price with discount
        BigDecimal discountPercentage = calculateDiscountPercentage(tests.size());
        BigDecimal packagePrice = applyDiscount(individualTotal, discountPercentage);

        // Savings
        BigDecimal savings = individualTotal.subtract(packagePrice);
        BigDecimal savingsPercentage = discountPercentage;

        result.put("testCount", tests.size());
        result.put("individualTotal", individualTotal);
        result.put("packagePrice", packagePrice);
        result.put("savings", savings);
        result.put("savingsPercentage", savingsPercentage);
        result.put("tier", determineTierFromTestCount(tests.size()).getDisplayName());

        return result;
    }

    public Map<String, Object> compareTestsWithPackages(List<Long> testIds) {
        Map<String, Object> comparison = new HashMap<>();

        if (testIds == null || testIds.isEmpty()) {
            return comparison;
        }

        List<LabTest> selectedTests = labTestRepository.findAllById(testIds);
        BigDecimal individualTotal = selectedTests.stream()
                .map(LabTest::getPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        comparison.put("selectedTests", selectedTests.size());
        comparison.put("individualTotal", individualTotal);

        // Find matching packages
        List<Map<String, Object>> matchingPackages = new ArrayList<>();
        List<TestPackage> allPackages = getActivePackages();

        for (TestPackage pkg : allPackages) {
            if (pkg.getTests() == null || pkg.getTests().isEmpty()) continue;

            Set<Long> packageTestIds = pkg.getTests().stream()
                    .map(LabTest::getId)
                    .collect(Collectors.toSet());

            long matchingCount = testIds.stream()
                    .filter(packageTestIds::contains)
                    .count();

            if (matchingCount > 0) {
                Map<String, Object> pkgInfo = new HashMap<>();
                pkgInfo.put("packageId", pkg.getId());
                pkgInfo.put("packageName", pkg.getPackageName());
                pkgInfo.put("packagePrice", pkg.getDiscountedPrice());
                pkgInfo.put("totalTests", pkg.getTotalTests());
                pkgInfo.put("matchingTests", matchingCount);
                pkgInfo.put("coverage", (matchingCount * 100.0) / testIds.size());
                pkgInfo.put("extraTests", packageTestIds.size() - matchingCount);

                BigDecimal potentialSavings = individualTotal.subtract(
                        pkg.getDiscountedPrice() != null ? pkg.getDiscountedPrice() : pkg.getTotalPrice()
                );
                pkgInfo.put("potentialSavings", potentialSavings);
                pkgInfo.put("isRecommended", matchingCount >= testIds.size() * 0.5);

                matchingPackages.add(pkgInfo);
            }
        }

        // Sort by potential savings
        matchingPackages.sort((a, b) -> {
            BigDecimal savingsA = (BigDecimal) a.get("potentialSavings");
            BigDecimal savingsB = (BigDecimal) b.get("potentialSavings");
            return savingsB.compareTo(savingsA);
        });

        comparison.put("matchingPackages", matchingPackages);
        comparison.put("bestPackage", matchingPackages.isEmpty() ? null : matchingPackages.get(0));

        return comparison;
    }

    // ==================== Bundle Pricing ====================

    public Map<String, Object> calculateBundlePrice(List<Long> packageIds) {
        Map<String, Object> result = new HashMap<>();

        if (packageIds == null || packageIds.isEmpty()) {
            result.put("totalPrice", BigDecimal.ZERO);
            result.put("bundlePrice", BigDecimal.ZERO);
            result.put("extraDiscount", BigDecimal.ZERO);
            return result;
        }

        List<TestPackage> packages = testPackageRepository.findAllById(packageIds);

        // Sum of individual package prices
        BigDecimal totalPrice = packages.stream()
                .map(pkg -> pkg.getDiscountedPrice() != null ? pkg.getDiscountedPrice() : pkg.getTotalPrice())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Apply bundle discount (5-10% extra)
        BigDecimal extraDiscountPercent = packages.size() >= 3 ?
                new BigDecimal("10") : BUNDLE_EXTRA_DISCOUNT;
        BigDecimal bundlePrice = applyDiscount(totalPrice, extraDiscountPercent);

        // Total tests in bundle
        int totalTests = packages.stream()
                .mapToInt(pkg -> pkg.getTotalTests() != null ? pkg.getTotalTests() : 0)
                .sum();

        result.put("packages", packages.size());
        result.put("totalTests", totalTests);
        result.put("individualTotal", totalPrice);
        result.put("bundlePrice", bundlePrice);
        result.put("extraDiscount", extraDiscountPercent);
        result.put("totalSavings", totalPrice.subtract(bundlePrice));

        return result;
    }

    // ==================== Analytics ====================

    public Map<String, Object> getPackageStatistics() {
        Map<String, Object> stats = new HashMap<>();

        List<TestPackage> allPackages = getActivePackages();

        stats.put("totalPackages", allPackages.size());
        stats.put("averagePrice", allPackages.stream()
                .map(TestPackage::getDiscountedPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(Math.max(1, allPackages.size())), 2, RoundingMode.HALF_UP));

        // Count by type
        Map<PackageType, Long> countByType = allPackages.stream()
                .filter(p -> p.getPackageType() != null)
                .collect(Collectors.groupingBy(TestPackage::getPackageType, Collectors.counting()));
        stats.put("countByType", countByType);

        // Count by tier
        Map<PackageTier, Long> countByTier = allPackages.stream()
                .filter(p -> p.getPackageTier() != null)
                .collect(Collectors.groupingBy(TestPackage::getPackageTier, Collectors.counting()));
        stats.put("countByTier", countByTier);

        // Popular packages count
        stats.put("popularPackagesCount", allPackages.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsPopular()))
                .count());

        return stats;
    }
}

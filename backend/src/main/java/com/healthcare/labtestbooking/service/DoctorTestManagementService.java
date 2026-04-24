package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.DoctorTestRequest.*;
import com.healthcare.labtestbooking.dto.DoctorTestResponse.*;
import com.healthcare.labtestbooking.entity.*;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.exception.*;
import com.healthcare.labtestbooking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DoctorTestManagementService {

    private final LabTestRepository labTestRepository;
    private final TestCategoryRepository testCategoryRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    // ==================== CRUD Operations ====================

    public TestDetails createTest(CreateTest request, UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);

        // Check if test code already exists
        if (labTestRepository.existsByTestCode(request.getTestCode())) {
            throw new BadRequestException("Test code already exists: " + request.getTestCode());
        }

        TestCategory category = null;
        if (request.getCategoryId() != null) {
            category = testCategoryRepository.findById(Objects.requireNonNull(request.getCategoryId(), "Category ID must not be null"))
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        LabTest test = LabTest.builder()
                .testCode(request.getTestCode())
                .testName(request.getTestName())
                .description(request.getDescription())
                .category(category)
                .testType(request.getTestType())
                .methodology(request.getMethodology())
                .unit(request.getUnit())
                .price(request.getPrice())
                .fastingRequired(request.getFastingRequired())
                .fastingHours(request.getFastingHours())
                .reportTimeHours(request.getReportTimeHours())
                .normalRangeText(request.getNormalRangeText())
                .normalRangeMin(request.getNormalRangeMin())
                .normalRangeMax(request.getNormalRangeMax())
                .criticalLow(request.getCriticalLow())
                .criticalHigh(request.getCriticalHigh())
                .pediatricRange(request.getPediatricRange())
                .maleRange(request.getMaleRange())
                .femaleRange(request.getFemaleRange())
                .isActive(request.getIsActive())
                .build();

        LabTest saved = labTestRepository.save(test);
        log.info("Test created by user {}: {}", user.getId(), saved.getTestCode());

        return mapToTestDetails(saved);
    }

    public TestDetails updateTest(Long testId, UpdateTest request, UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);

        LabTest test = labTestRepository.findById(Objects.requireNonNull(testId, "Test ID must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with ID: " + testId));

        // Update fields if provided
        if (request.getTestName() != null) test.setTestName(request.getTestName());
        if (request.getDescription() != null) test.setDescription(request.getDescription());
        if (request.getCategoryId() != null) {
            TestCategory category = testCategoryRepository.findById(Objects.requireNonNull(request.getCategoryId(), "Category ID must not be null"))
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            test.setCategory(category);
        }
        if (request.getTestType() != null) test.setTestType(request.getTestType());
        if (request.getMethodology() != null) test.setMethodology(request.getMethodology());
        if (request.getUnit() != null) test.setUnit(request.getUnit());
        if (request.getPrice() != null) test.setPrice(request.getPrice());
        if (request.getFastingRequired() != null) test.setFastingRequired(request.getFastingRequired());
        if (request.getFastingHours() != null) test.setFastingHours(request.getFastingHours());
        if (request.getReportTimeHours() != null) test.setReportTimeHours(request.getReportTimeHours());
        if (request.getNormalRangeText() != null) test.setNormalRangeText(request.getNormalRangeText());
        if (request.getNormalRangeMin() != null) test.setNormalRangeMin(request.getNormalRangeMin());
        if (request.getNormalRangeMax() != null) test.setNormalRangeMax(request.getNormalRangeMax());
        if (request.getCriticalLow() != null) test.setCriticalLow(request.getCriticalLow());
        if (request.getCriticalHigh() != null) test.setCriticalHigh(request.getCriticalHigh());
        if (request.getPediatricRange() != null) test.setPediatricRange(request.getPediatricRange());
        if (request.getMaleRange() != null) test.setMaleRange(request.getMaleRange());
        if (request.getFemaleRange() != null) test.setFemaleRange(request.getFemaleRange());
        if (request.getIsActive() != null) test.setIsActive(request.getIsActive());

        LabTest updated = labTestRepository.save(test);
        log.info("Test updated by user {}: {}", user.getId(), updated.getTestCode());

        return mapToTestDetails(updated);
    }

    public void deleteTest(Long testId, UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);

        LabTest test = labTestRepository.findById(Objects.requireNonNull(testId, "Test ID must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with ID: " + testId));

        // Soft delete - mark as inactive
        test.setIsActive(false);
        labTestRepository.save(test);

        log.info("Test soft-deleted by user {}: {}", user.getId(), test.getTestCode());
    }

    public void permanentDeleteTest(Long testId, UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);

        LabTest test = labTestRepository.findById(Objects.requireNonNull(testId, "Test ID must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with ID: " + testId));

        // Check if test has bookings
        long bookingCount = bookingRepository.countByTestId(testId);
        if (bookingCount > 0) {
            throw new BadRequestException("Cannot delete test with existing bookings. Use soft delete instead.");
        }

        labTestRepository.delete(Objects.requireNonNull(test, "LabTest must not be null"));
        log.info("Test permanently deleted by user {}: {}", user.getId(), test.getTestCode());
    }

    // ==================== Retrieve Tests ====================

    public TestDetails getTestById(Long testId) {
        LabTest test = labTestRepository.findById(Objects.requireNonNull(testId, "Test ID must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with ID: " + testId));
        return mapToTestDetails(test);
    }

    public Page<TestListItem> getAllTests(TestFilter filter, Pageable pageable) {
        // Build sort
        Sort sort = Sort.by(
                filter.getSortDirection() != null && filter.getSortDirection().equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC : Sort.Direction.ASC,
                filter.getSortBy() != null ? filter.getSortBy() : "testName"
        );

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<LabTest> tests = labTestRepository.findAll(sortedPageable);

        return tests.map(this::mapToTestListItem);
    }

    public List<TestListItem> getActiveTests() {
        List<LabTest> tests = labTestRepository.findByIsActiveTrue();
        return tests.stream()
                .map(this::mapToTestListItem)
                .collect(Collectors.toList());
    }

    public List<TestListItem> getTestsByCategory(Long categoryId) {
        // Note: New schema uses category names as strings, not IDs
        // This method is kept for backward compatibility
        // Convert categoryId to approximate categoryName if needed, or return all active tests
        List<LabTest> tests = labTestRepository.findByIsActiveTrue();
        return tests.stream()
                .map(this::mapToTestListItem)
                .collect(Collectors.toList());
    }
    
    public List<TestListItem> getTestsByCategoryName(String categoryName) {
        List<LabTest> tests = labTestRepository.findByCategoryNameAndIsActiveTrueQuery(categoryName);
        return tests.stream()
                .map(this::mapToTestListItem)
                .collect(Collectors.toList());
    }

    // ==================== Price Comparison ====================

    public List<PriceComparison> getPriceComparison(Long testId, UserDetails userDetails) {
        LabTest test = labTestRepository.findById(Objects.requireNonNull(testId, "Test ID must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));

        // Find all tests with similar name
        List<LabTest> similarTests = labTestRepository.findByTestNameContainingIgnoreCaseAndIsActiveTrue(test.getTestName());

        BigDecimal yourPrice = test.getPrice();

        return similarTests.stream()
                .map(t -> {
                    BigDecimal priceDiff = t.getPrice().subtract(yourPrice);
                    String diffText;
                    if (priceDiff.compareTo(BigDecimal.ZERO) > 0) {
                        diffText = "₹" + priceDiff.abs() + " higher";
                    } else if (priceDiff.compareTo(BigDecimal.ZERO) < 0) {
                        diffText = "₹" + priceDiff.abs() + " lower";
                    } else {
                        diffText = "Same price";
                    }

                    return PriceComparison.builder()
                            .labName("Lab " + t.getId()) // In real app, get from lab partner
                            .price(t.getPrice())
                            .labRating(4.5) // In real app, get from ratings
                            .reportTimeHours(t.getReportTimeHours())
                            .isYourLab(t.getId().equals(testId))
                            .priceDifference(priceDiff)
                            .priceDifferenceText(diffText)
                            .build();
                })
                .sorted(Comparator.comparing(PriceComparison::getPrice))
                .collect(Collectors.toList());
    }

    // ==================== Analytics ====================

    public TestAnalytics getTestAnalytics(Long testId, UserDetails userDetails) {
        LabTest test = labTestRepository.findById(Objects.requireNonNull(testId, "Test ID must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Test not found"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thisMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime lastMonthStart = thisMonthStart.minusMonths(1);
        LocalDateTime lastMonthEnd = thisMonthStart.minusSeconds(1);

        // Get booking counts
        long totalBookings = bookingRepository.countByTestId(testId);
        long bookingsThisMonth = bookingRepository.countByTestIdAndCreatedAtBetween(
                testId, thisMonthStart, now);
        long bookingsLastMonth = bookingRepository.countByTestIdAndCreatedAtBetween(
                testId, lastMonthStart, lastMonthEnd);

        // Calculate growth
        double bookingGrowth = bookingsLastMonth > 0
                ? ((double) (bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
                : bookingsThisMonth > 0 ? 100 : 0;

        String trend = bookingGrowth > 5 ? "UP" : (bookingGrowth < -5 ? "DOWN" : "STABLE");

        // Calculate revenue
        BigDecimal totalRevenue = test.getPrice().multiply(BigDecimal.valueOf(totalBookings));
        BigDecimal revenueThisMonth = test.getPrice().multiply(BigDecimal.valueOf(bookingsThisMonth));
        BigDecimal revenueLastMonth = test.getPrice().multiply(BigDecimal.valueOf(bookingsLastMonth));

        double revenueGrowth = revenueLastMonth.compareTo(BigDecimal.ZERO) > 0
                ? revenueThisMonth.subtract(revenueLastMonth)
                        .divide(revenueLastMonth, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue()
                : revenueThisMonth.compareTo(BigDecimal.ZERO) > 0 ? 100 : 0;

        // Monthly trend (last 6 months)
        List<MonthlyData> monthlyTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0);
            LocalDateTime monthEnd = i == 0 ? now : monthStart.plusMonths(1).minusSeconds(1);

            long monthBookings = bookingRepository.countByTestIdAndCreatedAtBetween(
                    testId, monthStart, monthEnd);
            BigDecimal monthRevenue = test.getPrice().multiply(BigDecimal.valueOf(monthBookings));

            monthlyTrend.add(MonthlyData.builder()
                    .month(monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")))
                    .bookings(monthBookings)
                    .revenue(monthRevenue)
                    .build());
        }

        // Price position in market
        List<LabTest> similarTests = labTestRepository.findByTestNameContainingIgnoreCaseAndIsActiveTrue(test.getTestName());
        BigDecimal avgMarketPrice = similarTests.stream()
                .map(LabTest::getPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(1, similarTests.size())), 2, RoundingMode.HALF_UP);

        int priceRank = (int) similarTests.stream()
                .filter(t -> t.getPrice().compareTo(test.getPrice()) < 0)
                .count() + 1;

        String pricePosition;
        if (test.getPrice().compareTo(avgMarketPrice.multiply(new BigDecimal("0.95"))) < 0) {
            pricePosition = "BELOW_MARKET";
        } else if (test.getPrice().compareTo(avgMarketPrice.multiply(new BigDecimal("1.05"))) > 0) {
            pricePosition = "ABOVE_MARKET";
        } else {
            pricePosition = "AT_MARKET";
        }

        return TestAnalytics.builder()
                .testId(test.getId())
                .testName(test.getTestName())
                .testCode(test.getTestCode())
                .totalBookings(totalBookings)
                .bookingsThisMonth(bookingsThisMonth)
                .bookingsLastMonth(bookingsLastMonth)
                .bookingGrowthPercentage(Math.round(bookingGrowth * 100.0) / 100.0)
                .bookingTrend(trend)
                .totalRevenue(totalRevenue)
                .revenueThisMonth(revenueThisMonth)
                .revenueLastMonth(revenueLastMonth)
                .revenueGrowthPercentage(Math.round(revenueGrowth * 100.0) / 100.0)
                .averageRating(4.5) // In real app, calculate from reviews
                .totalReviews(0L)
                .averageTurnaroundHours(test.getReportTimeHours())
                .marketPriceRank(priceRank)
                .averageMarketPrice(avgMarketPrice)
                .yourPrice(test.getPrice())
                .pricePosition(pricePosition)
                .monthlyTrend(monthlyTrend)
                .build();
    }

    public DashboardStats getDashboardStats(UserDetails userDetails) {
        List<LabTest> allTests = labTestRepository.findAll();

        long totalTests = allTests.size();
        long activeTests = allTests.stream().filter(t -> Boolean.TRUE.equals(t.getIsActive())).count();
        long inactiveTests = totalTests - activeTests;

        LocalDateTime thisMonthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);

        // Get booking stats
        long totalBookingsThisMonth = bookingRepository.countByCreatedAtAfter(thisMonthStart);
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.BOOKED);
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);

        // Calculate revenue
        BigDecimal totalRevenueThisMonth = allTests.stream()
                .map(test -> {
                    long bookings = bookingRepository.countByTestIdAndCreatedAtBetween(
                            test.getId(), thisMonthStart, LocalDateTime.now());
                    return test.getPrice().multiply(BigDecimal.valueOf(bookings));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Top performing tests
        List<TopTest> topTests = allTests.stream()
                .map(test -> {
                    long bookings = bookingRepository.countByTestIdAndCreatedAtBetween(
                            test.getId(), thisMonthStart, LocalDateTime.now());
                    return TopTest.builder()
                            .testId(test.getId())
                            .testName(test.getTestName())
                            .bookings(bookings)
                            .revenue(test.getPrice().multiply(BigDecimal.valueOf(bookings)))
                            .build();
                })
                .sorted(Comparator.comparingLong(TopTest::getBookings).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // Category breakdown
        List<TestCategory> categories = testCategoryRepository.findAll();
        List<CategoryStats> categoryStats = categories.stream()
                .map(cat -> {
                    List<LabTest> catTests = allTests.stream()
                            .filter(t -> t.getCategory() != null && t.getCategory().getId().equals(cat.getId()))
                            .collect(Collectors.toList());

                    long catBookings = catTests.stream()
                            .mapToLong(t -> bookingRepository.countByTestId(t.getId()))
                            .sum();

                    BigDecimal catRevenue = catTests.stream()
                            .map(t -> t.getPrice().multiply(BigDecimal.valueOf(
                                    bookingRepository.countByTestId(t.getId()))))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return CategoryStats.builder()
                            .categoryId(cat.getId())
                            .categoryName(cat.getCategoryName())
                            .testCount((long) catTests.size())
                            .bookingsCount(catBookings)
                            .revenue(catRevenue)
                            .build();
                })
                .sorted(Comparator.comparingLong(CategoryStats::getBookingsCount).reversed())
                .collect(Collectors.toList());

        return DashboardStats.builder()
                .totalTests(totalTests)
                .activeTests(activeTests)
                .inactiveTests(inactiveTests)
                .totalBookingsThisMonth(totalBookingsThisMonth)
                .totalRevenueThisMonth(totalRevenueThisMonth)
                .pendingBookings(pendingBookings)
                .completedBookings(completedBookings)
                .topPerformingTests(topTests)
                .categoryBreakdown(categoryStats)
                .build();
    }

    // ==================== Bulk Operations ====================

    public BulkUpdateResult bulkUpdatePrice(BulkUpdatePrice request, UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);

        int updated = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (Long testId : request.getTestIds()) {
            try {
                LabTest test = labTestRepository.findById(Objects.requireNonNull(testId, "Test ID must not be null")).orElse(null);
                if (test == null) {
                    errors.add("Test not found: " + testId);
                    failed++;
                    continue;
                }

                BigDecimal newPrice = calculateNewPrice(test.getPrice(), request);
                test.setPrice(newPrice);
                labTestRepository.save(Objects.requireNonNull(test, "LabTest must not be null"));
                updated++;
            } catch (Exception e) {
                errors.add("Error updating test " + testId + ": " + e.getMessage());
                failed++;
            }
        }

        log.info("Bulk price update by user {}: {} updated, {} failed",
                user.getId(), updated, failed);

        return BulkUpdateResult.builder()
                .totalTests(request.getTestIds().size())
                .updatedTests(updated)
                .failedTests(failed)
                .errors(errors)
                .build();
    }

    public BulkUpdateResult bulkToggleActive(List<Long> testIds, boolean active, UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);

        int updated = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (Long testId : testIds) {
            try {
                LabTest test = labTestRepository.findById(Objects.requireNonNull(testId, "Test ID must not be null")).orElse(null);
                if (test == null) {
                    errors.add("Test not found: " + testId);
                    failed++;
                    continue;
                }

                test.setIsActive(active);
                labTestRepository.save(Objects.requireNonNull(test, "LabTest must not be null"));
                updated++;
            } catch (Exception e) {
                errors.add("Error updating test " + testId + ": " + e.getMessage());
                failed++;
            }
        }

        log.info("Bulk active toggle by user {}: {} updated to {}", user.getId(), updated, active);

        return BulkUpdateResult.builder()
                .totalTests(testIds.size())
                .updatedTests(updated)
                .failedTests(failed)
                .errors(errors)
                .build();
    }

    // ==================== Helper Methods ====================

    private BigDecimal calculateNewPrice(BigDecimal currentPrice, BulkUpdatePrice request) {
        BigDecimal adjustment = request.getPriceAdjustment();

        switch (request.getAdjustmentType()) {
            case PERCENTAGE_INCREASE:
                return currentPrice.multiply(BigDecimal.ONE.add(
                        adjustment.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
                        .setScale(2, RoundingMode.HALF_UP);
            case PERCENTAGE_DECREASE:
                return currentPrice.multiply(BigDecimal.ONE.subtract(
                        adjustment.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
                        .setScale(2, RoundingMode.HALF_UP);
            case FIXED_INCREASE:
                return currentPrice.add(adjustment).setScale(2, RoundingMode.HALF_UP);
            case FIXED_DECREASE:
                return currentPrice.subtract(adjustment).max(BigDecimal.ONE).setScale(2, RoundingMode.HALF_UP);
            case SET_TO_VALUE:
                return adjustment.setScale(2, RoundingMode.HALF_UP);
            default:
                return currentPrice;
        }
    }

    private User getUserFromDetails(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private TestDetails mapToTestDetails(LabTest test) {
        long totalBookings = bookingRepository.countByTestId(test.getId());
        BigDecimal totalRevenue = test.getPrice() != null
                ? test.getPrice().multiply(BigDecimal.valueOf(totalBookings))
                : BigDecimal.ZERO;

        return TestDetails.builder()
                .id(test.getId())
                .testCode(test.getTestCode())
                .testName(test.getTestName())
                .description(test.getDescription())
                .categoryId(test.getCategory() != null ? test.getCategory().getId() : null)
                .categoryName(test.getCategory() != null ? test.getCategory().getCategoryName() : null)
                .testType(test.getTestType())
                .methodology(test.getMethodology())
                .unit(test.getUnit())
                .price(test.getPrice())
                .fastingRequired(test.getFastingRequired())
                .fastingHours(test.getFastingHours())
                .reportTimeHours(test.getReportTimeHours())
                .normalRangeText(test.getNormalRangeText())
                .normalRangeMin(test.getNormalRangeMin())
                .normalRangeMax(test.getNormalRangeMax())
                .criticalLow(test.getCriticalLow())
                .criticalHigh(test.getCriticalHigh())
                .pediatricRange(test.getPediatricRange())
                .maleRange(test.getMaleRange())
                .femaleRange(test.getFemaleRange())
                .isActive(test.getIsActive())
                .createdAt(test.getCreatedAt())
                .updatedAt(test.getUpdatedAt())
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .build();
    }

    private TestListItem mapToTestListItem(LabTest test) {
        long bookingsCount = bookingRepository.countByTestId(test.getId());

        return TestListItem.builder()
                .id(test.getId())
                .testCode(test.getTestCode())
                .testName(test.getTestName())
                .categoryName(test.getCategory() != null ? test.getCategory().getCategoryName() : null)
                .testType(test.getTestType())
                .price(test.getPrice())
                .fastingRequired(test.getFastingRequired())
                .reportTimeHours(test.getReportTimeHours())
                .isActive(test.getIsActive())
                .bookingsCount(bookingsCount)
                .build();
    }
}

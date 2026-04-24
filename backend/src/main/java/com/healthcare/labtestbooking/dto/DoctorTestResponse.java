package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.TestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class DoctorTestResponse {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestDetails {
        private Long id;
        private String testCode;
        private String testName;
        private String description;
        private Long categoryId;
        private String categoryName;
        private TestType testType;
        private String methodology;
        private String unit;
        private BigDecimal price;
        private Boolean fastingRequired;
        private Integer fastingHours;
        private Integer reportTimeHours;
        private String normalRangeText;
        private BigDecimal normalRangeMin;
        private BigDecimal normalRangeMax;
        private BigDecimal criticalLow;
        private BigDecimal criticalHigh;
        private String pediatricRange;
        private String maleRange;
        private String femaleRange;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Analytics preview
        private Long totalBookings;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestListItem {
        private Long id;
        private String testCode;
        private String testName;
        private String categoryName;
        private TestType testType;
        private BigDecimal price;
        private Boolean fastingRequired;
        private Integer reportTimeHours;
        private Boolean isActive;
        private Long bookingsCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceComparison {
        private String labName;
        private BigDecimal price;
        private Double labRating;
        private Integer reportTimeHours;
        private Boolean isYourLab;
        private BigDecimal priceDifference;
        private String priceDifferenceText;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestAnalytics {
        private Long testId;
        private String testName;
        private String testCode;

        // Booking stats
        private Long totalBookings;
        private Long bookingsThisMonth;
        private Long bookingsLastMonth;
        private Double bookingGrowthPercentage;
        private String bookingTrend; // UP, DOWN, STABLE

        // Revenue stats
        private BigDecimal totalRevenue;
        private BigDecimal revenueThisMonth;
        private BigDecimal revenueLastMonth;
        private Double revenueGrowthPercentage;

        // Performance
        private Double averageRating;
        private Long totalReviews;
        private Integer averageTurnaroundHours;

        // Comparison
        private Integer marketPriceRank; // 1 = cheapest
        private BigDecimal averageMarketPrice;
        private BigDecimal yourPrice;
        private String pricePosition; // BELOW_MARKET, AT_MARKET, ABOVE_MARKET

        // Trends
        private List<MonthlyData> monthlyTrend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;
        private Long bookings;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private Long totalTests;
        private Long activeTests;
        private Long inactiveTests;
        private Long totalBookingsThisMonth;
        private BigDecimal totalRevenueThisMonth;
        private Long pendingBookings;
        private Long completedBookings;
        private List<TopTest> topPerformingTests;
        private List<CategoryStats> categoryBreakdown;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopTest {
        private Long testId;
        private String testName;
        private Long bookings;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStats {
        private Long categoryId;
        private String categoryName;
        private Long testCount;
        private Long bookingsCount;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkUpdateResult {
        private Integer totalTests;
        private Integer updatedTests;
        private Integer failedTests;
        private List<String> errors;
    }
}

package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.TestType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class DoctorTestRequest {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTest {
        @NotBlank(message = "Test code is required")
        @Size(max = 20, message = "Test code must be less than 20 characters")
        private String testCode;

        @NotBlank(message = "Test name is required")
        @Size(max = 200, message = "Test name must be less than 200 characters")
        private String testName;

        @Size(max = 2000, message = "Description must be less than 2000 characters")
        private String description;

        private Long categoryId;

        private TestType testType;

        private String methodology;

        private String unit;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private BigDecimal price;

        @Builder.Default
        private Boolean fastingRequired = false;

        @Min(value = 0, message = "Fasting hours cannot be negative")
        private Integer fastingHours;

        @Min(value = 1, message = "Report time must be at least 1 hour")
        private Integer reportTimeHours;

        private String normalRangeText;

        private BigDecimal normalRangeMin;

        private BigDecimal normalRangeMax;

        private BigDecimal criticalLow;

        private BigDecimal criticalHigh;

        private String pediatricRange;

        private String maleRange;

        private String femaleRange;

        @Builder.Default
        private Boolean isActive = true;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateTest {
        @Size(max = 200, message = "Test name must be less than 200 characters")
        private String testName;

        @Size(max = 2000, message = "Description must be less than 2000 characters")
        private String description;

        private Long categoryId;

        private TestType testType;

        private String methodology;

        private String unit;

        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private BigDecimal price;

        private Boolean fastingRequired;

        @Min(value = 0, message = "Fasting hours cannot be negative")
        private Integer fastingHours;

        @Min(value = 1, message = "Report time must be at least 1 hour")
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
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkUpdatePrice {
        @NotNull(message = "Test IDs are required")
        private java.util.List<Long> testIds;

        @NotNull(message = "Price adjustment is required")
        private BigDecimal priceAdjustment;

        @NotNull(message = "Adjustment type is required")
        private PriceAdjustmentType adjustmentType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestFilter {
        private String search;
        private Long categoryId;
        private TestType testType;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Boolean fastingRequired;
        private Boolean isActive;
        private String sortBy;
        private String sortDirection;
    }

    public enum PriceAdjustmentType {
        PERCENTAGE_INCREASE,
        PERCENTAGE_DECREASE,
        FIXED_INCREASE,
        FIXED_DECREASE,
        SET_TO_VALUE
    }
}

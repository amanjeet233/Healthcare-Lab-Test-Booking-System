package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class CartRequest {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddTestToCart {
        @NotNull(message = "Test ID is required")
        private Long testId;

        @Min(value = 1, message = "Quantity must be at least 1")
        @Builder.Default
        private Integer quantity = 1;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddPackageToCart {
        @NotNull(message = "Package ID is required")
        private Long packageId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateQuantity {
        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyCoupon {
        @NotNull(message = "Coupon code is required")
        private String couponCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddMultipleTests {
        @NotNull(message = "Test IDs are required")
        private java.util.List<Long> testIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddMultiplePackages {
        @NotNull(message = "Package IDs are required")
        private java.util.List<Long> packageIds;
    }
}

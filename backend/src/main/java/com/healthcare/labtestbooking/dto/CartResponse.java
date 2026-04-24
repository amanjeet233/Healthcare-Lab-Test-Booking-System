package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.CartItem.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long cartId;
    private Long userId;
    private List<CartItemResponse> items;
    private Integer itemCount;

    // Pricing
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalPrice;

    // Coupon
    private String couponCode;
    private BigDecimal couponDiscount;
    private String couponMessage;

    // Savings summary
    private BigDecimal totalSavings;
    private BigDecimal savingsPercentage;
    private String savingsMessage;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiryAt;

    // Status
    private String status;
    private boolean isEmpty;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemResponse {
        private Long cartItemId;
        private Long itemId; // testId or packageId
        private ItemType itemType;
        private String itemName;
        private String itemCode;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal originalPrice;
        private BigDecimal discountPercentage;
        private BigDecimal discountAmount;
        private BigDecimal finalPrice;
        private BigDecimal lineTotal;

        // Additional info
        private Integer testsIncluded;
        private Boolean fastingRequired;
        private String sampleType;
        private Integer turnaroundHours;
        private String imageUrl;

        private LocalDateTime addedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartSummary {
        private Integer totalItems;
        private Integer totalTests;
        private BigDecimal subtotal;
        private BigDecimal discount;
        private BigDecimal tax;
        private BigDecimal total;
        private String currency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuickCartInfo {
        private Long cartId;
        private Integer itemCount;
        private BigDecimal totalPrice;
    }
}

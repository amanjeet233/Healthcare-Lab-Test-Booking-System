package com.healthcare.labtestbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons", indexes = {
    @Index(name = "idx_coupon_code", columnList = "coupon_code", unique = true),
    @Index(name = "idx_coupon_active", columnList = "is_active"),
    @Index(name = "idx_coupon_expiry", columnList = "expiry_date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coupon_id")
    private Long couponId;

    @Column(name = "coupon_code", nullable = false, unique = true)
    private String couponCode;

    @Column(name = "coupon_name")
    private String couponName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", precision = 10, scale = 2, nullable = false)
    private BigDecimal discountValue;

    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "min_order_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "current_uses")
    @Builder.Default
    private Integer currentUses = 0;

    @Column(name = "max_uses_per_user")
    @Builder.Default
    private Integer maxUsesPerUser = 1;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_first_order_only")
    @Builder.Default
    private Boolean isFirstOrderOnly = false;

    @Column(name = "applicable_to")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicableTo applicableTo = ApplicableTo.ALL;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Check if coupon is valid
    public boolean isValid() {
        if (!isActive) return false;

        LocalDate today = LocalDate.now();

        if (startDate != null && today.isBefore(startDate)) return false;
        if (expiryDate != null && today.isAfter(expiryDate)) return false;
        if (maxUses != null && currentUses >= maxUses) return false;

        return true;
    }

    // Check if minimum order amount is met
    public boolean meetsMinimumOrder(BigDecimal orderAmount) {
        if (minOrderAmount == null || minOrderAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return true;
        }
        return orderAmount.compareTo(minOrderAmount) >= 0;
    }

    // Calculate discount amount
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!isValid() || !meetsMinimumOrder(orderAmount)) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;

        if (discountType == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(discountValue).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);

            // Apply max discount cap if set
            if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
                discount = maxDiscountAmount;
            }
        } else {
            // FIXED discount
            discount = discountValue;

            // Don't exceed order amount
            if (discount.compareTo(orderAmount) > 0) {
                discount = orderAmount;
            }
        }

        return discount;
    }

    // Increment usage count
    public void incrementUsage() {
        this.currentUses = (this.currentUses == null ? 0 : this.currentUses) + 1;
    }

    public enum DiscountType {
        PERCENTAGE,
        FIXED
    }

    public enum ApplicableTo {
        ALL,
        LAB_TESTS_ONLY,
        PACKAGES_ONLY,
        FIRST_ORDER
    }
}

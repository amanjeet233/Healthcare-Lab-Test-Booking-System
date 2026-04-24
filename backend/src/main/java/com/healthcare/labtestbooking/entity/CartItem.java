package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items", indexes = {
    @Index(name = "idx_cart_item_cart", columnList = "cart_id"),
    @Index(name = "idx_cart_item_test", columnList = "lab_test_id"),
    @Index(name = "idx_cart_item_package", columnList = "package_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Long cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Cart cart;

    @Column(name = "cart_id", insertable = false, updatable = false)
    private Long cartId;

    // For individual lab tests
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_test_id")
    @JsonIgnore
    @ToString.Exclude
    private LabTest labTest;

    @Column(name = "lab_test_id", insertable = false, updatable = false)
    private Long labTestId;

    // For test packages
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    @JsonIgnore
    @ToString.Exclude
    private TestPackage testPackage;

    @Column(name = "package_id", insertable = false, updatable = false)
    private Long packageId;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    private ItemType itemType;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_code")
    private String itemCode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_price", precision = 10, scale = 2)
    private BigDecimal finalPrice;

    @Column(name = "tests_included")
    private Integer testsIncluded;

    @Column(name = "fasting_required")
    @Builder.Default
    private Boolean fastingRequired = false;

    @Column(name = "sample_type")
    private String sampleType;

    @Column(name = "turnaround_hours")
    private Integer turnaroundHours;

    @CreationTimestamp
    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Calculate final price
    public void calculateFinalPrice() {
        if (unitPrice == null || quantity == null) {
            this.finalPrice = BigDecimal.ZERO;
            return;
        }

        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

        if (discountPercentage != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                discountPercentage.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
            );
            this.discountAmount = subtotal.subtract(subtotal.multiply(discountMultiplier))
                    .setScale(2, RoundingMode.HALF_UP);
            this.finalPrice = subtotal.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP);
        } else {
            this.discountAmount = BigDecimal.ZERO;
            this.finalPrice = subtotal.setScale(2, RoundingMode.HALF_UP);
        }
    }

    // Get line subtotal (before discount)
    public BigDecimal getLineSubtotal() {
        if (unitPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
    }

    public enum ItemType {
        LAB_TEST,
        TEST_PACKAGE
    }
}

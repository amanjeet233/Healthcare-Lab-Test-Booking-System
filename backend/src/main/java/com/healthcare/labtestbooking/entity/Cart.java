package com.healthcare.labtestbooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts", indexes = {
    @Index(name = "idx_cart_user", columnList = "user_id"),
    @Index(name = "idx_cart_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Long cartId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @Column(name = "subtotal", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_price", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "coupon_discount", precision = 5, scale = 2)
    private BigDecimal couponDiscount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private CartStatus status = CartStatus.ACTIVE;

    @Column(name = "item_count")
    @Builder.Default
    private Integer itemCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "expiry_at")
    private LocalDateTime expiryAt;

    @PrePersist
    public void prePersist() {
        if (expiryAt == null) {
            expiryAt = LocalDateTime.now().plusDays(30);
        }
    }

    public void addItem(CartItem item) {
        items.add(item);
        item.setCart(this);
        updateItemCount();
    }

    public void removeItem(CartItem item) {
        items.remove(item);
        item.setCart(null);
        updateItemCount();
    }

    public void updateItemCount() {
        this.itemCount = items.size();
    }

    public void clearItems() {
        items.clear();
        this.itemCount = 0;
        this.subtotal = BigDecimal.ZERO;
        this.discountAmount = BigDecimal.ZERO;
        this.taxAmount = BigDecimal.ZERO;
        this.totalPrice = BigDecimal.ZERO;
    }

    public boolean isExpired() {
        return expiryAt != null && LocalDateTime.now().isAfter(expiryAt);
    }

    public enum CartStatus {
        ACTIVE,
        CHECKED_OUT,
        ABANDONED,
        EXPIRED
    }
}

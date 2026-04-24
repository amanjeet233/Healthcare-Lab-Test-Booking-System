package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.OrderStatus;
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
public class OrderResponse {

    private Long id;

    private String orderReference;

    private Long userId;

    private String userName;

    private OrderStatus status;

    private List<OrderItemResponse> items;

    private BigDecimal subtotal;

    private BigDecimal discountAmount;

    private BigDecimal taxAmount;

    private BigDecimal totalAmount;

    private String preferredLocation;

    private String preferredDate;

    private String preferredTimeSlot;

    private String specialInstructions;

    private String contactEmail;

    private String contactPhone;

    private String paymentStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastStatusChangedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long cartItemId;
        private String itemName;
        private String itemCode;
        private String itemType;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountPercentage;
        private BigDecimal lineTotal;
    }
}

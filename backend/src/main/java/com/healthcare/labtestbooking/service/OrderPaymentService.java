package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.event.PaymentSucceededEvent;
import com.healthcare.labtestbooking.entity.GatewayPayment;
import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.enums.OrderStatus;
import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.GatewayPaymentRepository;
import com.healthcare.labtestbooking.repository.OrderRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderPaymentService {

    private final OrderRepository orderRepository;
    private final GatewayPaymentRepository gatewayPaymentRepository;
    private final OrderStatusHistoryService orderStatusHistoryService;
    private final DomainEventPublisher domainEventPublisher;

    /**
     * Initiate payment for an order
     * For MVP: Creates mock payment link
     */
    public PaymentInitiationResponse initiatePaymentForOrder(
            Long orderId,
            Long userId,
            String email,
            String phone) {

        log.info("Initiating payment for order: {} by user: {}", orderId, userId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Order does not belong to this user");
        }

        if (order.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException("Payment already initiated for this order");
        }

        try {
            // Generate mock gateway order ID
            String mockGatewayOrderId = "MOCK_ORD_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
            String mockPaymentLink = "/api/payments/mock/checkout?gatewayOrderId=" + mockGatewayOrderId;

            // Store in Order
            order.setGatewayOrderId(mockGatewayOrderId);
            order.setPaymentStatus(PaymentStatus.PENDING);
            orderRepository.save(order);

            // Create GatewayPayment record
            GatewayPayment gatewayPayment = GatewayPayment.builder()
                    .order(order)
                    .amount(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
                    .gateway("MOCK_GATEWAY")
                    .transactionId(mockGatewayOrderId)
                    .status(PaymentStatus.PENDING)
                    .paymentLink(mockPaymentLink)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            GatewayPayment savedPayment = gatewayPaymentRepository.save(gatewayPayment);

            log.info("Payment initiated for order: {} with mock gateway order: {}", orderId, mockGatewayOrderId);

            return PaymentInitiationResponse.builder()
                    .paymentId(savedPayment.getId())
                    .orderId(orderId)
                    .gatewayOrderId(mockGatewayOrderId)
                    .amount(order.getTotalAmount())
                    .amountInPaise(order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue())
                    .currency("INR")
                    .orderReference(order.getOrderReference())
                    .paymentLink(mockPaymentLink)
                    .keyId("mock_key_id")
                    .build();

        } catch (Exception e) {
            log.error("Error initiating payment for order: {}", orderId, e);
            throw new RuntimeException("Failed to initiate payment: " + e.getMessage(), e);
        }
    }

    /**
     * Handle payment success (called from webhook or frontend callback)
     */
    public void handlePaymentSuccess(
            String gatewayOrderId,
            String gatewayPaymentId,
            String signature) {

        log.info("Processing gateway payment success for order: {}, payment: {}", gatewayOrderId, gatewayPaymentId);

        try {
            Order order = orderRepository.findByGatewayOrderId(gatewayOrderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found for gateway order: " + gatewayOrderId));

            GatewayPayment gatewayPayment = gatewayPaymentRepository.findByTransactionId(gatewayOrderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

            // Update payment
            gatewayPayment.setStatus(PaymentStatus.SUCCESS);
            gatewayPayment.setGatewayPaymentId(gatewayPaymentId != null ? gatewayPaymentId : "mock_payment_" + UUID.randomUUID());
            gatewayPayment.setUpdatedAt(LocalDateTime.now());
            gatewayPaymentRepository.save(gatewayPayment);

            // Update order
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            order.setStatus(OrderStatus.PAYMENT_COMPLETED);
            order.setLastStatusChangedAt(LocalDateTime.now());
            orderRepository.save(order);

            // Record in history
            orderStatusHistoryService.recordStatusChange(
                    order.getId(),
                    OrderStatus.PAYMENT_COMPLETED,
                    "Payment received - ID: " + (gatewayPaymentId != null ? gatewayPaymentId : "mock"),
                    "PAYMENT_WEBHOOK"
            );

            if (order.getUser() != null) {
                domainEventPublisher.publish(new PaymentSucceededEvent(
                        order.getId(),
                        order.getUser().getId(),
                        gatewayOrderId,
                        gatewayPaymentId != null ? gatewayPaymentId : "mock_payment",
                        order.getTotalAmount(),
                        LocalDateTime.now()
                ));
            }

            log.info("Payment processed successfully for order: {}", order.getId());

        } catch (Exception e) {
            log.error("Error processing payment success", e);
            throw new RuntimeException("Failed to process payment: " + e.getMessage(), e);
        }
    }

    /**
     * Handle payment failure
     */
    public void handlePaymentFailure(String gatewayOrderId, String reason) {
        log.warn("Processing gateway payment failure for order: {}", gatewayOrderId);

        try {
            Order order = orderRepository.findByGatewayOrderId(gatewayOrderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

            GatewayPayment gatewayPayment = gatewayPaymentRepository.findByTransactionId(gatewayOrderId)
                    .orElse(null);

            if (gatewayPayment != null) {
                gatewayPayment.setStatus(PaymentStatus.FAILED);
                gatewayPaymentRepository.save(gatewayPayment);
            }

            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);

            orderStatusHistoryService.recordStatusChange(
                    order.getId(),
                    OrderStatus.PENDING,
                    "Payment failed: " + reason,
                    "PAYMENT_WEBHOOK"
            );

            log.info("Payment failure recorded for order: {}", order.getId());

        } catch (Exception e) {
            log.error("Error recording payment failure", e);
        }
    }

    /**
     * Get payment status
     */
    public OrderPaymentStatus getOrderPaymentStatus(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return OrderPaymentStatus.builder()
                .orderId(orderId)
                .orderReference(order.getOrderReference())
                .orderStatus(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .amount(order.getTotalAmount())
                .gatewayOrderId(order.getGatewayOrderId())
                .build();
    }

    // ==================== Response DTOs ====================

    @Data
    @Builder
    public static class PaymentInitiationResponse {
        private Long paymentId;
        private Long orderId;
        private String gatewayOrderId;
        private BigDecimal amount;
        private long amountInPaise;
        private String currency;
        private String orderReference;
        private String paymentLink;
        private String keyId;
    }

    @Data
    @Builder
    public static class OrderPaymentStatus {
        private Long orderId;
        private String orderReference;
        private OrderStatus orderStatus;
        private PaymentStatus paymentStatus;
        private BigDecimal amount;
        private String gatewayOrderId;
    }
}

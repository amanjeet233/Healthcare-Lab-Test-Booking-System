package com.healthcare.labtestbooking.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentSucceededEvent(
        Long orderId,
        Long userId,
        String gatewayOrderId,
        String gatewayPaymentId,
        BigDecimal amount,
        LocalDateTime occurredAt
) {
}


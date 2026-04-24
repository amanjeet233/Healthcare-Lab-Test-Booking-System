package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.PaymentRequest;
import com.healthcare.labtestbooking.entity.enums.PaymentMethod;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ExternalPaymentGatewayClient {

    private final FeatureFlagService featureFlagService;

    @CircuitBreaker(name = "paymentGateway", fallbackMethod = "paymentFallback")
    public boolean executePayment(PaymentRequest request) {
        if (featureFlagService.isMockPaymentsOnlyEnabled()) {
            return true;
        }
        // Placeholder for real gateway integration.
        return true;
    }

    @CircuitBreaker(name = "paymentGateway", fallbackMethod = "refundFallback")
    public boolean executeRefund(BigDecimal amount, PaymentMethod paymentMethod) {
        if (featureFlagService.isMockPaymentsOnlyEnabled()) {
            return true;
        }
        // Placeholder for real gateway integration.
        return true;
    }

    @SuppressWarnings("unused")
    public boolean paymentFallback(PaymentRequest request, Throwable throwable) {
        return featureFlagService.isMockPaymentsOnlyEnabled();
    }

    @SuppressWarnings("unused")
    public boolean refundFallback(BigDecimal amount, PaymentMethod paymentMethod, Throwable throwable) {
        return featureFlagService.isMockPaymentsOnlyEnabled();
    }
}


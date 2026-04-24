package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.GatewayPayment;
import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import com.healthcare.labtestbooking.repository.GatewayPaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GatewayPaymentService {

    private final GatewayPaymentRepository gatewayPaymentRepository;

    @Transactional
    public GatewayPayment saveGatewayPayment(GatewayPayment gatewayPayment) {
        log.info("Saving gateway payment for order id: {} with transaction id: {}",
                gatewayPayment.getOrder() != null ? gatewayPayment.getOrder().getId() : "null",
                gatewayPayment.getTransactionId());
        return gatewayPaymentRepository.save(gatewayPayment);
    }

    public Optional<GatewayPayment> getGatewayPaymentByTransactionId(String transactionId) {
        return gatewayPaymentRepository.findByTransactionId(transactionId);
    }

    public List<GatewayPayment> getGatewayPaymentsByOrderId(Long orderId) {
        return gatewayPaymentRepository.findByOrderId(orderId);
    }

    public List<GatewayPayment> getAllGatewayPayments() {
        return gatewayPaymentRepository.findAll();
    }

    /**
     * Process payment asynchronously
     * Returns immediately while processing happens in background
     */
    @Async
    public void processPaymentAsync(Long paymentId) {
        try {
            log.info("Processing payment asynchronously for paymentId: {}", paymentId);

            Optional<GatewayPayment> payment = gatewayPaymentRepository.findById(paymentId);
            if (payment.isEmpty()) {
                log.warn("Payment not found for ID: {}", paymentId);
                return;
            }

            GatewayPayment gatewayPayment = payment.get();

            // Simulate payment processing
            // In production, this would call the actual payment gateway API
            Thread.sleep(2000); // Simulate API call

            // Update payment status
            gatewayPayment.setStatus(PaymentStatus.SUCCESS);
            gatewayPaymentRepository.save(gatewayPayment);

            log.info("Payment processed successfully for paymentId: {}", paymentId);
            // Send notification email
            // notificationService.sendPaymentSuccessEmail(gatewayPayment.getOrder().getId());

        } catch (Exception e) {
            log.error("Error processing payment for paymentId: {}", paymentId, e);
            // Update payment status to failed and send failure notification
        }
    }

    /**
     * Get payment status without blocking
     */
    public CompletableFuture<PaymentStatus> getPaymentStatusAsync(Long paymentId) {
        return CompletableFuture.supplyAsync(() -> {
            Optional<GatewayPayment> payment = gatewayPaymentRepository.findById(paymentId);
            return payment.map(GatewayPayment::getStatus).orElse(PaymentStatus.PENDING);
        });
    }
}

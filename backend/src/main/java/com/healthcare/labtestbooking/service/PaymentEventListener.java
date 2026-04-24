package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.event.PaymentSucceededEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final NotificationInboxService notificationInboxService;

    @Async
    @TransactionalEventListener
    public void onPaymentSucceeded(PaymentSucceededEvent event) {
        log.info("PaymentSucceededEvent received for order={}, gatewayOrder={}",
                event.orderId(), event.gatewayOrderId());
        try {
            notificationInboxService.createNotification(
                    event.userId(),
                    "PAYMENT",
                    "Payment Received",
                    "Payment received for order " + event.orderId(),
                    "ORDER",
                    event.orderId()
            );
        } catch (Exception ex) {
            log.warn("Unable to write payment success notification for order={}: {}",
                    event.orderId(), ex.getMessage());
        }
    }
}

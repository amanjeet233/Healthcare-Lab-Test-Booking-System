package com.healthcare.labtestbooking.exception;

public class PaymentFailedException extends RuntimeException {

    private String paymentId;
    private String reason;

    public PaymentFailedException(String message) {
        super(message);
    }

    public PaymentFailedException(String paymentId, String reason) {
        super("Payment failed for transaction: " + paymentId + " - Reason: " + reason);
        this.paymentId = paymentId;
        this.reason = reason;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public String getReason() {
        return reason;
    }
}

package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    @NotNull(message = "Booking ID is required")
    @Positive(message = "Booking ID must be positive")
    private Long bookingId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")       
    private BigDecimal amount;

    @NotBlank(message = "paymentMethod is required")
    @Size(max = 250, message = "paymentMethod must be at most 250 characters")  
    private String paymentMethod;

    @Size(max = 100, message = "Transaction ID must be at most 100 characters") 
    private String transactionId;

    @NotBlank(message = "paymentGateway is required")
    @Size(max = 250, message = "paymentGateway must be at most 250 characters") 
    private String paymentGateway;
}

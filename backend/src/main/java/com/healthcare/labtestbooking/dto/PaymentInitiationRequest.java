package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiationRequest {

    @jakarta.validation.constraints.Email
    private String email;

    @jakarta.validation.constraints.Pattern(regexp = "^[0-9]{10}$")
    private String phone;
}

package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SMSRequest {
    @NotBlank(message = "phoneNumber is required")
    @Size(max = 250, message = "phoneNumber must be at most 250 characters")
    private String phoneNumber;

    @NotBlank(message = "message is required")
    @Size(max = 250, message = "message must be at most 250 characters")
    private String message;

    @Size(max = 5, message = "Country code must be at most 5 characters")
    @NotBlank(message = "countryCode is required")
    @Size(max = 250, message = "countryCode must be at most 250 characters")
    private String countryCode;
}

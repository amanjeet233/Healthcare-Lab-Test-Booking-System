package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsentCaptureRequest {

    @NotNull(message = "bookingId is required")
    private Long bookingId;

    @NotNull(message = "consentGiven is required")
    private Boolean consentGiven;

    @NotBlank(message = "patientSignatureData is required")
    private String patientSignatureData;
}

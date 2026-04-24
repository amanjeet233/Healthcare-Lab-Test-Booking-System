package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RescheduleBookingRequest {
    @NotBlank
    private String newDate;

    @NotBlank
    private String newTime;
}


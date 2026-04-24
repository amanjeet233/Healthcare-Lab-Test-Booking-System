package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestRequest {

    @NotBlank(message = "testName is required")
    @Size(max = 250, message = "testName must be at most 250 characters")
    private String testName;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be positive or zero")
    private BigDecimal price;

    @NotBlank(message = "category is required")
    @Size(max = 250, message = "category must be at most 250 characters")
    private String category;

    @Size(max = 500, message = "Preparation notes must be at most 500 characters")
    private String preparationNotes;

    private Boolean fastingRequired;

    @Min(value = 1, message = "Fasting hours must be at least 1")
    @Max(value = 24, message = "Fasting hours cannot exceed 24")
    private Integer fastingHours;

    @Min(value = 1, message = "Report time must be at least 1 hour")
    @Max(value = 168, message = "Report time cannot exceed 168 hours")
    private Integer reportTimeHours;

    private Boolean isActive;
}

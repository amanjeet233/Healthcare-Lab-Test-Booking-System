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
public class TestRequest {

    @NotBlank(message = "testName is required")
    @Size(max = 250, message = "testName must be at most 250 characters")
    private String testName;

    @Size(max = 500, message = "Description must be at most 500 characters")
    @NotBlank(message = "category is required")
    @Size(max = 250, message = "category must be at most 250 characters")
    private String category;

    @Size(max = 500, message = "Preparation notes must be at most 500 characters")
    @NotBlank(message = "preparationNotes is required")
    @Size(max = 250, message = "preparationNotes must be at most 250 characters")
    private String preparationNotes;
}

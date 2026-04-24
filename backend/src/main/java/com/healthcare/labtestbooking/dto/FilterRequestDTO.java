package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterRequestDTO {

    @Size(max = 20, message = "Gender must be at most 20 characters")
    private String gender;

    @Size(max = 100, message = "Organ must be at most 100 characters")
    private String organ;

    @Size(max = 50, message = "Test type must be at most 50 characters")
    private String testType;

    @DecimalMin(value = "0.0", message = "Min price cannot be negative")
    private BigDecimal minPrice;

    @DecimalMin(value = "0.0", message = "Max price cannot be negative")
    private BigDecimal maxPrice;

    @DecimalMin(value = "0.0", message = "Discount min cannot be negative")
    private BigDecimal discountMin;

    @Size(max = 50, message = "Report time must be at most 50 characters")
    private String reportTime;
    private Boolean fasting;

    @Size(max = 50, message = "Sort by must be at most 50 characters")
    private String sortBy;

    @Min(value = 0, message = "Page cannot be negative")
    private Integer page;

    @Min(value = 1, message = "Size must be at least 1")
    @Max(value = 200, message = "Size cannot exceed 200")
    private Integer size;
}

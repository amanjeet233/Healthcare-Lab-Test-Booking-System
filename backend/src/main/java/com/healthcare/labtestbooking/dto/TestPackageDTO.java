package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestPackageDTO {
    private Long id;
    private String packageCode;
    private String packageName;
    private String description;
    private Integer totalTests;
    private BigDecimal totalPrice;
    private BigDecimal discountedPrice;
    private BigDecimal discountPercentage;
    private BigDecimal savings;
    private List<LabTestDTO> tests;
}

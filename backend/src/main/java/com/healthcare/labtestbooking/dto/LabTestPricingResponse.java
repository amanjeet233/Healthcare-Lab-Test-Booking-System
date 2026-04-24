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
public class LabTestPricingResponse {
    private Long labPartnerId;
    private String labPartnerName;
    private Long testId;
    private String testName;
    private BigDecimal price;
    private BigDecimal discount;
    private BigDecimal finalPrice;
    private Integer turnaroundTimeHours;
    private Boolean homeCollection;
}

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
public class TestParameterDTO {
    private Long id;
    private String parameterName;
    private String unit;
    private BigDecimal normalRangeMin;
    private BigDecimal normalRangeMax;
    private String normalRangeText;
}

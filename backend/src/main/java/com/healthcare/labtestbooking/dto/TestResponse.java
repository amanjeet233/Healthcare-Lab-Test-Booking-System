package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResponse {

    private Long id;
    private String testName;
    private String description;
    private BigDecimal price;
    private String category;
    private String preparationNotes;
}

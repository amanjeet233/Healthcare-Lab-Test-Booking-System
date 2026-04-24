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
public class LabTestDTO {
    private Long id;
    private String testCode;
    private String testName;
    private String slug;
    private String categoryName;
    private Long categoryId;
    private String testType;
    private String methodology;
    private String unit;
    private BigDecimal normalRangeMin;
    private BigDecimal normalRangeMax;
    private String normalRangeText;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String sampleType;
    private Boolean isActive;
    private Boolean fastingRequired;
    private Integer fastingHours;
    private Integer reportTimeHours;
    private String turnaroundTime;
    private Double averageRating;
    private Integer totalReviews;
    private Boolean isTopBooked;
    private Boolean isTopDeal;
    private Integer parametersCount;
    private String recommendedFor;
    private Integer discountPercent;
    private String iconUrl;
    private Boolean isPackage;
    private Boolean isTrending;
    private List<String> subTests;
    private List<String> tags;
    private List<TestParameterDTO> parameters;
}

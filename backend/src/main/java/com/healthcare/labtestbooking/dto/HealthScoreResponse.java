package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthScoreResponse {
    private Long bookingId;
    private BigDecimal overallScore;
    private String riskLevel;
    private BigDecimal cardiovascularScore;
    private BigDecimal metabolicScore;
    private BigDecimal renalScore;
    private BigDecimal hepaticScore;
    private BigDecimal endocrineScore;
    private java.util.Map<String, BigDecimal> bodySystemScores;
    private LocalDateTime calculatedAt;
}

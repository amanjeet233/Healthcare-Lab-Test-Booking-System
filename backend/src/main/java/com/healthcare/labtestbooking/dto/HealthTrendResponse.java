package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthTrendResponse {
    private Long userId;
    private BigDecimal currentScore;
    private String riskLevel;
    private LocalDate date;
    private BigDecimal overallScore;
    private BigDecimal cardiovascularScore;
    private BigDecimal metabolicScore;
    private BigDecimal renalScore;
    private BigDecimal hepaticScore;
    private BigDecimal endocrineScore;
    private List<TrendData> trends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendData {
        private LocalDate date;
        private BigDecimal score;
        private String riskLevel;
    }
}

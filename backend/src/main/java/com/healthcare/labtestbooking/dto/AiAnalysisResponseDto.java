package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.AiAnalysisStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponseDto {

    private Long bookingId;
    private AiAnalysisStatus status;
    private Integer healthScore;
    private String summary;
    private List<AiAnalysisFlagDto> flags;
    private List<String> patterns;
    private List<AiAnalysisRecommendationDto> recommendations;
    private java.util.Map<String, Integer> organScores;
    private Boolean hasCriticalResults;
    private String disclaimer;
    private LocalDateTime generatedAt;
    private String errorMessage;
}

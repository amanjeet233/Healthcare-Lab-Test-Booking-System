package com.healthcare.labtestbooking.dto;

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
public class ReportResultDTO {
    private Long id;
    private Long bookingId;
    private Long technicianId;
    private LocalDateTime submittedAt;
    private List<ResultItemDTO> results;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultItemDTO {
        private Long id;
        private Long parameterId;
        private String parameterName;
        private String resultValue;
        private String unit;
        private String normalRange;
        private String abnormalStatus;
        private Boolean isAbnormal;
        private Boolean isCritical;
    }
}
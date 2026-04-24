package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.entity.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ReportDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportSummaryDTO {
        private Long reportId;
        private Long bookingId;
        private Long orderId;
        private Long patientId;
        private ReportStatus status;
        private LocalDateTime generatedDate;
        private List<TestSummaryDTO> tests;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestSummaryDTO {
        private Long testId;
        private String testName;
        private AbnormalStatus abnormalStatus;
        private Boolean isAbnormal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportDetailDTO {
        private Long reportId;
        private Long bookingId;
        private Long orderId;
        private Long patientId;
        private ReportStatus status;
        private String reportPdfPath;
        private String reportJson;
        private LocalDateTime generatedDate;
        private String verifiedBy;
        private List<ParameterResultDTO> parameters;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParameterResultDTO {
        private Long testId;
        private Long parameterId;
        private String parameterName;
        private String resultValue;
        private String unit;
        private BigDecimal normalRangeMin;
        private BigDecimal normalRangeMax;
        private AbnormalStatus abnormalStatus;
        private Boolean isAbnormal;
        private Boolean isCritical;
        private String comments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AbnormalFlagDTO {
        private Long reportId;
        private Long testId;
        private Long parameterId;
        private String parameterName;
        private String resultValue;
        private AbnormalStatus abnormalStatus;
        private String message;
    }
}

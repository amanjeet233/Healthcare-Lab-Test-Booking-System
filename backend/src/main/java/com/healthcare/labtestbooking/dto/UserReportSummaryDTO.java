package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReportSummaryDTO {
    private Long reportId;
    private Long bookingId;
    private String reportNumber;
    private String testName;
    private String packageName;
    private String status;
    private LocalDateTime generatedAt;
    private LocalDateTime estimatedReadyAt;
}


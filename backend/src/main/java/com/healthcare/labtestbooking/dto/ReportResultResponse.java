package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResultResponse {
    private Long id;
    private Long bookingId;
    private Long parameterId;
    private String parameterName;
    private String resultValue;
    private String normalRange;
    private AbnormalStatus abnormalStatus;
    private Boolean isCritical;
    private String notes;
    private LocalDateTime createdAt;
}

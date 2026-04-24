package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.ConsentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentCaptureResponse {
    private Long bookingId;
    private String testName;
    private ConsentType consentType;
    private Boolean consentGiven;
    private LocalDateTime consentTimestamp;
    private Long collectorId;
    private String collectorName;
    private String consentToken;
}

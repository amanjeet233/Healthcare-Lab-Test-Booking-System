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
public class ConsentStatusResponse {
    private Long bookingId;
    private String testName;
    private Boolean consentRequired;
    private Boolean consentCaptured;
    private Boolean consentGiven;
    private ConsentType consentType;
    private LocalDateTime consentTimestamp;
    private Long collectorId;
    private String collectorName;
}

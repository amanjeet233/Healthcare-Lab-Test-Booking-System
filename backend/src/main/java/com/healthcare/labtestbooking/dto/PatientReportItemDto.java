package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientReportItemDto {
    private Long bookingId;
    private String testName;
    private LocalDate bookingDate;
    private LocalDateTime reportDate;
    private String status;
    private String downloadUrl;
    private String verifiedByName;
}

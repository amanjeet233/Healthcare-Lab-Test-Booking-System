package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeltaCheckEntry {
    private Long bookingId;
    private LocalDate bookingDate;
    private String parameterName;
    private String value;
    private String unit;
    private String referenceRange;
    private String flag;
}

package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.ReflexPriority;
import com.healthcare.labtestbooking.entity.enums.ReflexSuggestionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReflexSuggestionDto {
    private Long id;
    private Long bookingId;
    private String triggeredBy;
    private String suggestedTest;
    private String suggestedTestSlug;
    private ReflexPriority priority;
    private ReflexSuggestionStatus status;
    private Boolean autoOrdered;
    private Long reflexBookingId;
    private String actionReason;
    private LocalDateTime createdAt;
}

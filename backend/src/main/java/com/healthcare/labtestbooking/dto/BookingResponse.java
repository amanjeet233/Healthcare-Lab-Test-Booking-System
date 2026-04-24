package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;
    private String bookingReference;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private Long familyMemberId;
    private Long parentBookingId;
    private Long labTestId;
    private String labTestName;
    private Long packageId;
    private String packageName;
    private String testName;
    private LocalDate bookingDate;
    private String timeSlot;
    private String status;
    private String collectionType;
    private String collectionAddress;
    private BigDecimal homeCollectionCharge;
    private BigDecimal totalAmount;
    private BigDecimal amount;
    private BigDecimal discount;
    private BigDecimal finalAmount;
    private String notes;
    private String paymentStatus;
    private Boolean reportAvailable;
    private LocalDateTime createdAt;
    private Long technicianId;
    private String technicianName;
    private String assignmentType;
    private String cancellationReason;
    private String rejectionReason;
    private LocalDateTime rejectedAt;
}

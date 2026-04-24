package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportVerificationRequest {

    @Size(max = 1000)
    private String clinicalNotes;

    @Size(max = 250)
    private String digitalSignature;   // optional - auto-generated in service

    private Boolean approved;          // optional - defaults to true

    @Size(max = 500)
    private String icdCodes;

    @Size(max = 250)
    private String specialistType;     // optional

    private String verificationNotes;  // alias for clinicalNotes
    private String status;             // VERIFIED or APPROVED
}

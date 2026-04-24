package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.ConsentCaptureRequest;
import com.healthcare.labtestbooking.dto.ConsentCaptureResponse;
import com.healthcare.labtestbooking.dto.ConsentStatusResponse;
import com.healthcare.labtestbooking.service.ConsentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consent")
@RequiredArgsConstructor
public class ConsentController {

    private final ConsentService consentService;

    @PostMapping("/capture")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<ConsentCaptureResponse>> captureConsent(
            @Valid @RequestBody ConsentCaptureRequest request,
            HttpServletRequest httpRequest) {
        ConsentCaptureResponse response = consentService.captureConsent(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Consent captured successfully", response));
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ConsentStatusResponse>> getConsentStatus(@PathVariable Long bookingId) {
        ConsentStatusResponse response = consentService.getConsentStatus(bookingId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

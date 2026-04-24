package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.dto.DeltaCheckEntry;
import com.healthcare.labtestbooking.dto.ReportVerificationRequest;
import com.healthcare.labtestbooking.dto.ReportVerificationResponse;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.service.BookingService;
import com.healthcare.labtestbooking.service.MedicalOfficerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mo")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MEDICAL_OFFICER')")
public class MedicalOfficerController {

    private final MedicalOfficerService medicalOfficerService;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    @GetMapping("/history")
    @PreAuthorize("hasRole('MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<Page<ReportVerificationResponse>>> getMOHistory(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ReportVerificationResponse> history = medicalOfficerService.getVerificationHistory(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("History", history));
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasRole('MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getMOBookings(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Booking> page;
        if (status != null && !status.isBlank()) {
            try {
                BookingStatus bs = BookingStatus.valueOf(status.toUpperCase());
                page = bookingRepository.findByStatus(bs, pageable);
            } catch (IllegalArgumentException e) {
                page = bookingRepository.findAll(pageable);
            }
        } else {
            page = bookingRepository.findAll(pageable);
        }
        return ResponseEntity.ok(ApiResponse.success("Bookings", page.map(bookingService::mapToResponsePublic)));
    }

    @GetMapping("/bookings/{bookingId}")
    @PreAuthorize("hasRole('MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<BookingResponse>> getMOBookingById(@PathVariable Long bookingId) {
        BookingResponse booking = bookingRepository.findDetailedById(bookingId)
                .map(bookingService::mapToResponsePublic)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        return ResponseEntity.ok(ApiResponse.success("Booking fetched successfully", booking));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Page<ReportVerificationResponse>>> getPendingVerifications(
            @RequestParam(required = false) String filter,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ReportVerificationResponse> verifications = medicalOfficerService.getVerificationsByFilter(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(verifications));
    }

    @PutMapping("/flag-critical/{bookingId}")
    public ResponseEntity<ApiResponse<Void>> flagCritical(@PathVariable Long bookingId) {
        medicalOfficerService.flagCritical(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking flagged as critical", null));
    }

    @GetMapping("/pending/count")
    public ResponseEntity<ApiResponse<Integer>> getPendingVerificationsCount() {
        int count = (int) medicalOfficerService.getPendingVerificationsCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/delta-check")
    public ResponseEntity<ApiResponse<List<DeltaCheckEntry>>> getDeltaCheck(
            @RequestParam Long patientId,
            @RequestParam String testName) {
        List<DeltaCheckEntry> delta = medicalOfficerService.getDeltaCheck(patientId, testName);
        return ResponseEntity.ok(ApiResponse.success(delta));
    }

    @PostMapping({"/verify/{bookingId}", "/verify/{reportId}"})
    public ResponseEntity<ApiResponse<ReportVerificationResponse>> verifyReport(
            @PathVariable(value = "bookingId", required = false) Long bookingId,
            @PathVariable(value = "reportId", required = false) Long reportId,
            @Valid @RequestBody ReportVerificationRequest request) {

        Long idToUse = bookingId != null ? bookingId : reportId;
        ReportVerificationResponse response = medicalOfficerService.verifyReport(idToUse, request);
        return ResponseEntity.ok(ApiResponse.success("Report verified", response));
    }

    @PostMapping("/reject/{bookingId}")
    public ResponseEntity<ApiResponse<ReportVerificationResponse>> rejectReport(
            @PathVariable Long bookingId,
            @Valid @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        ReportVerificationResponse response = medicalOfficerService.rejectReport(bookingId, reason);
        return ResponseEntity.ok(ApiResponse.success("Report rejected", response));
    }

    @PostMapping("/referral/{bookingId}")
    public ResponseEntity<ApiResponse<Void>> createReferral(
            @PathVariable Long bookingId,
            @Valid @RequestBody Map<String, String> body) {
        String specialistType = body.getOrDefault("specialistType", "General");
        String referralNotes = body.getOrDefault("notes", "");
        medicalOfficerService.referToSpecialist(bookingId, specialistType, referralNotes);
        return ResponseEntity.ok(ApiResponse.success("Referral created", null));
    }

    // ── Technician Assignment by MO ───────────────────────────────────────────

    /**
     * POST /api/mo/assign-technician/{bookingId}
     * MO suggests a technician for a booking → sets MO_SUGGESTED + notifies technician.
     */
    @PostMapping("/assign-technician/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>> assignTechnicianByMo(
            @PathVariable Long bookingId,
            @RequestBody Map<String, Long> body) {
        Long technicianId = body.get("technicianId");
        if (technicianId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("technicianId is required in the request body"));
        }
        BookingResponse response = medicalOfficerService.suggestTechnician(bookingId, technicianId);
        return ResponseEntity.ok(ApiResponse.success("Technician assigned by Medical Officer", response));
    }

    /**
     * GET /api/mo/bookings/unassigned
     * Returns all bookings with no technician (BOOKED / CONFIRMED), sorted by date asc.
     */
    @GetMapping("/bookings/unassigned")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getUnassignedBookings() {
        List<BookingResponse> bookings = medicalOfficerService.getUnassignedBookings();
        return ResponseEntity.ok(ApiResponse.success("Unassigned bookings fetched", bookings));
    }

    /**
     * GET /api/mo/technicians/available?date=YYYY-MM-DD
     * Returns active technicians with their booking count for the given date.
     */
    @GetMapping("/technicians/available")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTechniciansAvailableForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Map<String, Object>> technicians = medicalOfficerService.getTechniciansAvailableForDate(date);
        return ResponseEntity.ok(ApiResponse.success("Technicians fetched for date " + date, technicians));
    }

    @PostMapping("/amend/{reportId}")
    public ResponseEntity<ApiResponse<ReportVerificationResponse>> amendReport(
            @PathVariable Long reportId,
            @RequestBody Map<String, Object> body) {
        String reason = (String) body.get("amendmentReason");
        @SuppressWarnings("unchecked")
        Map<Long, String> newValues = (Map<Long, String>) body.get("newValues");
        if (newValues == null) newValues = Map.of();
        
        ReportVerificationResponse response = medicalOfficerService.amendReport(reportId, reason, newValues);
        return ResponseEntity.ok(ApiResponse.success("Report amended successfully", response));
    }
}

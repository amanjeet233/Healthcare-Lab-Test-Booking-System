package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.AiAnalysisResponseDto;
import com.healthcare.labtestbooking.dto.PatientReportItemDto;
import com.healthcare.labtestbooking.dto.ReportResultDTO;
import com.healthcare.labtestbooking.dto.ReportResultRequest;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.service.ReportGeneratorService;
import com.healthcare.labtestbooking.service.ReportService;
import com.healthcare.labtestbooking.service.ReportResultService;
import com.healthcare.labtestbooking.service.ReportVerificationService;
import com.healthcare.labtestbooking.service.HtmlTemplatePdfService;
import com.healthcare.labtestbooking.service.AuditService;
import com.healthcare.labtestbooking.service.AIAnalysisService;
import com.healthcare.labtestbooking.service.NotificationInboxService;
import com.healthcare.labtestbooking.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "Lab test results and reports management")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;
    private final ReportGeneratorService reportGeneratorService;
    private final ReportResultService reportResultService;
    private final ReportVerificationService reportVerificationService;
    private final AuditService auditService;
    private final AIAnalysisService aiAnalysisService;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final NotificationInboxService notificationInboxService;
    private final com.healthcare.labtestbooking.service.PdfReportService pdfReportService;
    private final com.healthcare.labtestbooking.repository.ReportRepository reportRepository;
    private final HtmlTemplatePdfService htmlTemplatePdfService;

    @PostMapping("/results")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @Operation(summary = "Submit report results", description = "Submit lab test results for a booking (TECHNICIAN role required)")
    public ResponseEntity<ApiResponse<ReportResultDTO>> submitReportResults(
            @Valid @RequestBody ReportResultRequest request) {
        log.info("Received request to submit report results for booking: {}", request.getBookingId());
        ReportResultDTO result = reportService.enterReportResults(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Report results submitted successfully", result));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'MEDICAL_OFFICER', 'TECHNICIAN')")
    @Operation(summary = "Get report by booking", description = "Retrieve lab test report for a specific booking")
    public ResponseEntity<ApiResponse<ReportResultDTO>> getReportByBooking(@PathVariable Long bookingId) {
        log.info("Fetching report for booking ID: {}", bookingId);
        ReportResultDTO report = reportService.getReportByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Report fetched successfully", report));
    }

    @GetMapping("/results/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'MEDICAL_OFFICER', 'TECHNICIAN', 'ADMIN')")
    @Operation(summary = "Get report results by booking", description = "Retrieve entered result values for a specific booking")
    public ResponseEntity<ApiResponse<ReportResultDTO>> getReportResultsByBooking(@PathVariable Long bookingId) {
        log.info("Fetching report results for booking ID: {}", bookingId);
        ReportResultDTO report = reportService.getReportByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Report results fetched successfully", report));
    }

    @GetMapping("/parameters/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
    @Operation(summary = "Get parameter list for result entry by booking", description = "Returns parameter list for both single-test and package bookings")
    public ResponseEntity<ApiResponse<List<com.healthcare.labtestbooking.entity.TestParameter>>> getParametersByBooking(
            @PathVariable Long bookingId) {
        log.info("Fetching parameters for booking ID: {}", bookingId);
        List<com.healthcare.labtestbooking.entity.TestParameter> params = reportService.getParametersForBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Parameters fetched successfully", params));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<Report>> uploadReport(
            @RequestParam("bookingId") Long bookingId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @org.springframework.security.core.annotation.AuthenticationPrincipal
            org.springframework.security.core.userdetails.UserDetails principal,
            jakarta.servlet.http.HttpServletRequest request) {
        log.info("Uploading PDF report for booking ID: {}", bookingId);
        Report report = reportService.uploadReport(bookingId, file);
        String uploader = principal != null ? principal.getUsername() : "UNKNOWN";
        auditService.logAction(
                null, uploader, "TECHNICIAN",
                "REPORT_UPLOADED", "REPORT", String.valueOf(bookingId),
                "PDF report uploaded for booking " + bookingId,
                request.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Report uploaded successfully", report));
    }

    @GetMapping("/booking/{bookingId}/exists")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN', 'PATIENT')")
    @Operation(summary = "Check if raw report exists", description = "Checks whether a PDF report has already been uploaded")
    public ResponseEntity<ApiResponse<Report>> checkReportExists(@PathVariable Long bookingId) {
        return reportRepository.findByBookingId(bookingId)
                .map(report -> ResponseEntity.ok(ApiResponse.success("Report exists", report)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Report not found")));
    }

    @PostMapping("/verify/{id}")
    @PreAuthorize("hasAnyRole('MEDICAL_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> verifyReport(@PathVariable Long id) {
        log.info("Verifying report ID: {}", id);
        reportService.verifyReport(id);
        return ResponseEntity.ok(ApiResponse.success("Report verified successfully", null));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<PatientReportItemDto>>> getMyReports() {
        log.info("Fetching reports for current patient");
        List<PatientReportItemDto> reports = reportService.getMyPatientReports();
        return ResponseEntity.ok(ApiResponse.success("Reports fetched successfully", reports));
    }

    @GetMapping("/{bookingId}/download")
    @PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
    @Operation(summary = "Download uploaded report by booking ID")
    public ResponseEntity<byte[]> downloadReportByBooking(@PathVariable Long bookingId) {
        Report report = reportService.getDownloadableReportByBooking(bookingId);
        byte[] generated = htmlTemplatePdfService.generatePdf(report);
        String filename = "HEALTHCARELAB_REPORT_" + bookingId + ".pdf";
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(filename)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_PDF)
                .body(generated);
    }

    @GetMapping("/{bookingId}/ai-analysis")
    @PreAuthorize("hasAnyRole('PATIENT', 'MEDICAL_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AiAnalysisResponseDto>> getAiAnalysis(@PathVariable Long bookingId) {
        AiAnalysisResponseDto analysis = aiAnalysisService.getAnalysisForBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("AI analysis fetched successfully", analysis));
    }

    @PostMapping("/{bookingId}/request-analysis")
    @PreAuthorize("hasAnyRole('PATIENT', 'MEDICAL_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> requestAiAnalysis(@PathVariable Long bookingId) {
        aiAnalysisService.requestAnalysisForBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("AI analysis request submitted", null));
    }

    @PostMapping("/{bookingId}/regenerate-analysis")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> regenerateAiAnalysis(@PathVariable Long bookingId) {
        aiAnalysisService.regenerateAnalysis(bookingId);
        return ResponseEntity.ok(ApiResponse.success("AI analysis regeneration triggered", null));
    }

    @PostMapping("/{bookingId}/regenerate-pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<Void>> regeneratePdf(@PathVariable Long bookingId) {
        log.info("Regenerating PDF for booking ID: {}", bookingId);
        pdfReportService.regenerateReportAsync(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Report regeneration triggered", null));
    }

    @PostMapping("/{bookingId}/send-to-patient")
    @PreAuthorize("hasRole('MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<String>> sendToPatient(@PathVariable Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.VERIFIED) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Booking must be VERIFIED first"));
        }

        pdfReportService.generateReport(bookingId);

        User patient = booking.getPatient();
        if (patient != null) {
            notificationService.sendReportReadyNotification(patient, booking);
            notificationInboxService.createNotification(
                    patient.getId(),
                    "REPORT_READY",
                    "Your Report is Ready",
                    "Your " + (booking.getTest() != null ? booking.getTest().getTestName() : "lab test")
                            + " report is verified and ready to download.",
                    "REPORT",
                    bookingId
            );
        }

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        return ResponseEntity.ok(ApiResponse.success("Report sent", "OK"));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('PATIENT', 'MEDICAL_OFFICER', 'TECHNICIAN', 'ADMIN')")
    @Operation(summary = "Get report PDF", description = "Download lab test report as PDF")
    public ResponseEntity<byte[]> getReportPdf(@PathVariable Long id) {
        log.info("Generating PDF report for report ID: {}", id);
        Report report = reportRepository.findById(id).orElseThrow(() -> new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Report not found"));
        com.healthcare.labtestbooking.entity.User currentUser = reportService.getCurrentUser();
        if (currentUser.getRole() == com.healthcare.labtestbooking.entity.enums.UserRole.PATIENT) {
            if (report.getBooking() == null || !report.getBooking().getPatient().getId().equals(currentUser.getId())) {
                throw new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Report not found");
            }
            if (report.getStatus() != com.healthcare.labtestbooking.entity.enums.ReportStatus.VERIFIED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        byte[] pdf = reportGeneratorService.generatePdfReport(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/verifications/booking/{bookingId}")
    public ResponseEntity<ApiResponse<ReportVerification>> getVerificationByBooking(@PathVariable Long bookingId) {
        return reportVerificationService.getVerificationByBookingId(bookingId)
                .map(v -> ResponseEntity.ok(ApiResponse.success("Verification info found", v)))
                .orElse(ResponseEntity.ok(ApiResponse.success("Not yet verified", null)));
    }

    @PostMapping("/{id}/share")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Generate a secure public sharing link (Valid for 7 days)")
    public ResponseEntity<ApiResponse<String>> shareReport(@PathVariable Long id) {
        Report report = reportRepository.findById(id).orElseThrow(() -> new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Report not found"));
        com.healthcare.labtestbooking.entity.User currentUser = reportService.getCurrentUser();
        
        if (!report.getBooking().getPatient().getId().equals(currentUser.getId())) {
            throw new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Report not found");
        }

        report.setShareToken(java.util.UUID.randomUUID().toString());
        report.setShareExpiry(java.time.LocalDateTime.now().plusDays(7));
        reportRepository.save(report);
        
        return ResponseEntity.ok(ApiResponse.success("Sharing token generated (Valid for 7 days)", report.getShareToken()));
    }

    @GetMapping("/public/view/{token}")
    @Operation(summary = "View report via public token")
    public ResponseEntity<byte[]> viewPublicReport(@PathVariable String token) {
        Report report = reportRepository.findByShareToken(token)
                .orElseThrow(() -> new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Invalid link"));
        
        if (report.getShareExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Link expired");
        }

        byte[] pdf = reportGeneratorService.generatePdfReport(report.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/public/analysis/{token}")
    @Operation(summary = "View diagnostic digital analysis via public token")
    public ResponseEntity<ApiResponse<AiAnalysisResponseDto>> viewPublicAnalysis(@PathVariable String token) {
        Report report = reportRepository.findByShareToken(token)
                .orElseThrow(() -> new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Invalid link"));
        
        if (report.getShareExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Link expired");
        }

        AiAnalysisResponseDto analysis = aiAnalysisService.getAnalysisForBooking(report.getBooking().getId());
        return ResponseEntity.ok(ApiResponse.success("Digital analysis fetched successfully", analysis));
    }

    @GetMapping("/active-shares")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "List current reports being shared by the patient")
    public ResponseEntity<ApiResponse<List<Report>>> getActiveShares() {
        com.healthcare.labtestbooking.entity.User currentUser = reportService.getCurrentUser();
        List<Report> shared = reportRepository.findByBookingPatientIdAndShareTokenIsNotNull(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Active shared links fetched", shared));
    }

    @DeleteMapping("/share/{bookingId}/revoke")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Revoke public access for a specific report link")
    public ResponseEntity<ApiResponse<Void>> revokeShare(@PathVariable Long bookingId) {
        com.healthcare.labtestbooking.entity.User currentUser = reportService.getCurrentUser();
        Report report = reportRepository.findByBookingIdAndBookingPatientId(bookingId, currentUser.getId())
                .orElseThrow(() -> new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Report not found"));
        
        report.setShareToken(null);
        report.setShareExpiry(null);
        reportRepository.save(report);
        
        return ResponseEntity.ok(ApiResponse.success("Sharing access revoked successfully", null));
    }

    private String resolveDownloadFilename(Report report, Long bookingId) {
        String candidate = report.getReportPdfPath();
        if (candidate != null && !candidate.isBlank()) {
            int idx = candidate.lastIndexOf('/');
            int winIdx = candidate.lastIndexOf('\\');
            int start = Math.max(idx, winIdx);
            String resolved = start >= 0 ? candidate.substring(start + 1) : candidate;
            if (!resolved.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
                return "report-booking-" + bookingId + ".pdf";
            }
            return resolved;
        }
        return "report-booking-" + bookingId + ".pdf";
    }
}

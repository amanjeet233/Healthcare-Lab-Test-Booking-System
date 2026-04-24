package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.dto.EmailRequest;
import com.healthcare.labtestbooking.service.BookingService;
import com.healthcare.labtestbooking.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * ✅ EMAIL CONTROLLER
 * Handles email operations including sending PDFs with bookings and reports
 */
@RestController
@RequestMapping({"/api/email", "/api/emails"})
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class EmailController {

    private final EmailService emailService;
    private final BookingService bookingService;

    /**
     * ✅ SEND EMAIL WITH PDF ATTACHMENT
     * POST /api/email/send-with-attachment
     */
    @PostMapping("/send-with-attachment")
    public ResponseEntity<?> sendEmailWithAttachment(@RequestBody EmailRequest request) {
        try {
            log.info("📧 Sending email to: {} with attachment: {}", request.getToEmail(), request.getAttachmentFilename());

            // Validate request
            if (request.getToEmail() == null || request.getToEmail().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email address is required"));
            }

            if (request.getAttachmentBase64() == null || request.getAttachmentBase64().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("PDF attachment is required"));
            }

            // Send email with attachment
            emailService.sendEmailWithAttachment(
                    request.getToEmail(),
                    request.getSubject() != null ? request.getSubject() : "Document",
                    request.getBody() != null ? request.getBody() : "Please find the attached document.",
                    request.getAttachmentBase64(),
                    request.getAttachmentFilename() != null ? request.getAttachmentFilename() : "document.pdf"
            );

            log.info("✅ Email sent successfully to: {}", request.getToEmail());
            return ResponseEntity.ok(createSuccessResponse("Email sent successfully"));
        } catch (Exception e) {
            log.error("❌ Error sending email: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to send email: " + e.getMessage()));
        }
    }

    /**
     * ✅ SEND BOOKING RECEIPT EMAIL
     * POST /api/email/send-receipt
     */
    @PostMapping("/send-receipt")
    public ResponseEntity<?> sendBookingReceipt(
            @RequestParam String email,
            @RequestParam String bookingReference,
            @RequestParam String testName
    ) {
        try {
            log.info("📄 Sending booking receipt to: {}", email);

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }

            emailService.sendBookingReceipt(email, bookingReference, testName);

            log.info("✅ Receipt email sent to: {}", email);
            return ResponseEntity.ok(createSuccessResponse("Receipt sent successfully"));
        } catch (Exception e) {
            log.error("❌ Error sending receipt: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to send receipt: " + e.getMessage()));
        }
    }

    /**
     * ✅ SEND LAB REPORT EMAIL
     * POST /api/email/send-report
     */
    @PostMapping("/send-report")
    public ResponseEntity<?> sendLabReport(
            @RequestParam String email,
            @RequestParam String bookingReference,
            @RequestParam String testName
    ) {
        try {
            log.info("📊 Sending lab report to: {}", email);

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }

            emailService.sendLabReport(email, bookingReference, testName);

            log.info("✅ Report email sent to: {}", email);
            return ResponseEntity.ok(createSuccessResponse("Report sent successfully"));
        } catch (Exception e) {
            log.error("❌ Error sending report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to send report: " + e.getMessage()));
        }
    }

    @PostMapping("/send-booking-confirmation")
    public ResponseEntity<?> sendBookingConfirmation(@RequestBody BookingTriggerRequest request) {
        try {
            if (request.getBookingId() == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("bookingId is required"));
            }

            String fallbackEmail = getCurrentUserEmail();
            emailService.sendBookingConfirmationAsync(request.getBookingId(), fallbackEmail);
            return ResponseEntity.accepted().body(createSuccessResponse("Booking confirmation queued"));
        } catch (Exception e) {
            log.error("❌ Failed to trigger booking confirmation email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to trigger booking confirmation email: " + e.getMessage()));
        }
    }

    @PostMapping("/send-appointment-reminder")
    public ResponseEntity<?> sendAppointmentReminder(@RequestBody BookingTriggerRequest request) {
        try {
            if (request.getBookingId() == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("bookingId is required"));
            }

            BookingResponse booking = bookingService.getBookingById(request.getBookingId());
            String email = getCurrentUserEmail();
            String bookingReference = booking.getBookingReference() != null ? booking.getBookingReference() : ("BK-" + booking.getId());
            String testName = booking.getLabTestName() != null ? booking.getLabTestName() : "HealthcareLab Appointment";
            emailService.sendSimpleEmail(
                    email,
                    "Appointment Reminder - " + bookingReference,
                    "Reminder: Your appointment is scheduled on " + booking.getBookingDate() + " at " + booking.getTimeSlot()
                            + " for " + testName + "."
            );

            return ResponseEntity.ok(createSuccessResponse("Appointment reminder email triggered"));
        } catch (Exception e) {
            log.error("❌ Failed to trigger appointment reminder email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to trigger appointment reminder email: " + e.getMessage()));
        }
    }

    @PostMapping("/send-report-ready")
    public ResponseEntity<?> sendReportReady(@RequestBody ReportTriggerRequest request) {
        try {
            if (request.getReportId() == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("reportId is required"));
            }

            String email = getCurrentUserEmail();
            String reportReference = "RPT-" + request.getReportId();
            emailService.sendLabReport(email, reportReference, "HealthcareLab Report");

            return ResponseEntity.ok(createSuccessResponse("Report ready email triggered"));
        } catch (Exception e) {
            log.error("❌ Failed to trigger report ready email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to trigger report ready email: " + e.getMessage()));
        }
    }

    /**
     * ✅ HELPER: CREATE SUCCESS RESPONSE
     */
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }

    /**
     * ✅ HELPER: CREATE ERROR RESPONSE
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return "support@healthcarelab.com";
        }
        return authentication.getName();
    }

    public static class BookingTriggerRequest {
        private Long bookingId;

        public Long getBookingId() {
            return bookingId;
        }

        public void setBookingId(Long bookingId) {
            this.bookingId = bookingId;
        }
    }

    public static class ReportTriggerRequest {
        private Long reportId;

        public Long getReportId() {
            return reportId;
        }

        public void setReportId(Long reportId) {
            this.reportId = reportId;
        }
    }
}

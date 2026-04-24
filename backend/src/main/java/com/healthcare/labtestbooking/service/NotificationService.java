package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.NotificationLog;
import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationLogRepository notificationLogRepository;
    private final EmailService emailService;

    @Value("${app.notification.sms.mock:true}")
    private boolean smsMock;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter DATE_TIME_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // ── Public Methods ────────────────────────────────────────────────────────

    /**
     * Sends fasting and preparation instructions to a patient after booking.
     * Also logs the notification attempt (SENT or FAILED) in notification_log.
     */
    @Async
    public void sendBookingConfirmation(Booking booking) {
        String status = "FAILED";
        String message = buildPreparationMessage(booking);

        try {
            String recipientEmail = resolveEmail(booking);
            if (recipientEmail == null) {
                log.warn("[NOTIFICATION] No email address for booking {}; skipping.", booking.getId());
                return;
            }

            String subject = "Your Booking Confirmation & Preparation Instructions — "
                    + (booking.getBookingReference() != null ? booking.getBookingReference() : ("BK-" + booking.getId()));

            emailService.sendSimpleEmail(recipientEmail, subject, message);
            status = "SENT";
            log.info("[NOTIFICATION] Preparation instructions sent to {} for booking {}", recipientEmail, booking.getId());

        } catch (Exception e) {
            log.error("[NOTIFICATION] Failed to send preparation instructions for booking {}: {}", booking.getId(), e.getMessage(), e);
        } finally {
            saveLog(booking, "EMAIL", status, message);
        }
    }

    public void sendSMS(String phoneNumber, String message) {
        if (smsMock) {
            log.info("[SMS MOCK] To {}: {}", phoneNumber, message);
            return;
        }
        log.warn("SMS provider not configured; message to {} not sent", phoneNumber);
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        log.info("[EMAIL MOCK] Password-reset email to: {}", toEmail);
        log.info("[EMAIL MOCK] Reset link: {}", resetLink);
    }

    public void sendVerificationEmail(String toEmail, String verificationLink) {
        log.info("[EMAIL MOCK] Verification email to: {}", toEmail);
        log.info("[EMAIL MOCK] Verification link: {}", verificationLink);
    }

    public void sendOrderConfirmed(Order order) {
        log.debug("Notification disabled for confirmed order: {}", order.getId());
    }

    public void sendTechnicianAssigned(Order order) {
        log.debug("Notification disabled for technician assignment: {}", order.getId());
    }

    public void sendSampleCollected(Order order) {
        log.debug("Notification disabled for sample collection: {}", order.getId());
    }

    public void sendReportReady(Order order, Report report) {
        log.debug("Notification disabled for report ready: {}", order.getId());
    }

    /**
     * Sends a notification to the patient when their report is ready for viewing.
     */
    @Async
    public void sendReportReadyNotification(User patient, Booking booking) {
        String recipientEmail = patient.getEmail();
        String bookingRef = booking.getBookingReference() != null ? booking.getBookingReference() : "BK-" + booking.getId();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("[NOTIFICATION] No email for patient {}; skipping report notification.", patient.getId());
            saveLog(booking, "EMAIL", "FAILED", "Report ready notification skipped: missing patient email.");
            return;
        }

        try {
            String testName = resolveTestName(booking);
            String patientName = patient.getName() != null && !patient.getName().isBlank() ? patient.getName() : "Patient";
            String moName = booking.getMedicalOfficer() != null && booking.getMedicalOfficer().getName() != null
                    ? booking.getMedicalOfficer().getName()
                    : "Medical Officer";
            LocalDateTime verifiedAtRaw = LocalDateTime.now();
            String verifiedAt = verifiedAtRaw.format(DATE_TIME_FMT);
            String reportsPath = "/reports";

            String subject = "Your Lab Report is Ready — HealthcareLab";
            String body = "Dear " + patientName + ",\n\n"
                    + "Your lab report has been verified and is now ready for download.\n\n"
                    + "Patient Name: " + patientName + "\n"
                    + "Test Name: " + testName + "\n"
                    + "Booking Reference: " + bookingRef + "\n"
                    + "Verified By: " + moName + "\n"
                    + "Verified At: " + verifiedAt + "\n"
                    + "Report Link: " + reportsPath + "\n\n"
                    + "Download Your Report: " + reportsPath + "\n\n"
                    + "Thank you,\nHealthcareLab";

            emailService.sendSimpleEmail(recipientEmail, subject, body);
            log.info("[NOTIFICATION] Report ready alert sent to {} for booking {}", recipientEmail, booking.getId());
            saveLog(booking, "EMAIL", "SENT",
                    "Report ready email sent to " + recipientEmail + " for booking reference " + bookingRef + ".");
        } catch (Exception e) {
            log.error("[NOTIFICATION] Failed to send report ready alert: {}", e.getMessage());
            saveLog(booking, "EMAIL", "FAILED",
                    "Failed to send report ready email for booking reference " + bookingRef + ": " + e.getMessage());
        }
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private String buildPreparationMessage(Booking booking) {
        String testName = resolveTestName(booking);
        String bookingDate = booking.getBookingDate() != null
                ? booking.getBookingDate().format(DATE_FMT) : "N/A";
        String timeSlot = booking.getTimeSlot() != null ? booking.getTimeSlot() : "N/A";

        boolean fastingRequired = resolveFastingRequired(booking);
        String fastingHoursText = resolveFastingHoursText(booking, fastingRequired);

        StringBuilder sb = new StringBuilder();
        sb.append("Dear ").append(resolvePatientName(booking)).append(",\n\n");
        sb.append("Your lab booking has been confirmed. Please find the details below:\n\n");
        sb.append("  Test / Package  : ").append(testName).append("\n");
        sb.append("  Date            : ").append(bookingDate).append("\n");
        sb.append("  Time Slot       : ").append(timeSlot).append("\n");
        sb.append("  Fasting Required: ").append(fastingRequired ? "Yes" : "No").append("\n");
        sb.append("  Fasting Hours   : ").append(fastingHoursText).append("\n");
        sb.append("  Booking Ref     : ").append(
                booking.getBookingReference() != null ? booking.getBookingReference() : "BK-" + booking.getId()
        ).append("\n\n");

        sb.append("=== Preparation Instructions ===\n\n");
        if (fastingRequired) {
            sb.append("FASTING REQUIRED\n");
            sb.append("   Please fast for ").append(fastingHoursText).append(" before your appointment.\n");
            sb.append("   - Avoid food, milk, tea, and coffee.\n");
            sb.append("   - Plain water is allowed.\n");
            sb.append("   - Continue your regular medications unless advised otherwise by your doctor.\n\n");
        } else {
            sb.append("No fasting is required for this test.\n\n");
        }
        sb.append("General Tips:\n");
        sb.append("   - Wear comfortable, loose-fitting clothing.\n");
        sb.append("   - Bring a valid photo ID.\n");
        sb.append("   - Arrive 10 minutes early for home collection.\n\n");
        sb.append("If you have any questions, contact our support team.\n\n");
        sb.append("Thank you,\nHealthcare Lab Team");

        return sb.toString();
    }

    private String resolveTestName(Booking booking) {
        if (booking.getTestPackage() != null && booking.getTestPackage().getPackageName() != null) {
            return booking.getTestPackage().getPackageName();
        }
        if (booking.getTest() != null && booking.getTest().getTestName() != null) {
            return booking.getTest().getTestName();
        }
        return "Diagnostic Test";
    }

    private boolean resolveFastingRequired(Booking booking) {
        if (booking.getTest() != null && Boolean.TRUE.equals(booking.getTest().getFastingRequired())) {
            return true;
        }
        if (booking.getTestPackage() != null && Boolean.TRUE.equals(booking.getTestPackage().getFastingRequired())) {
            return true;
        }
        return false;
    }

    private String resolveFastingHoursText(Booking booking, boolean fastingRequired) {
        Integer fastingHours = null;
        if (booking.getTest() != null) {
            fastingHours = booking.getTest().getFastingHours();
        }
        if (fastingHours == null && booking.getTestPackage() != null) {
            fastingHours = booking.getTestPackage().getFastingHours();
        }

        if (!fastingRequired) {
            return "0";
        }
        return Optional.ofNullable(fastingHours)
                .filter(hours -> hours > 0)
                .map(hours -> hours + " hours")
                .orElse("10-12 hours");
    }

    private String resolvePatientName(Booking booking) {
        if (booking.getPatientDisplayName() != null && !booking.getPatientDisplayName().isBlank()) {
            return booking.getPatientDisplayName();
        }
        if (booking.getPatient() != null && booking.getPatient().getName() != null) {
            return booking.getPatient().getName();
        }
        return "Patient";
    }

    private String resolveEmail(Booking booking) {
        if (booking.getPatient() != null
                && booking.getPatient().getEmail() != null
                && !booking.getPatient().getEmail().isBlank()) {
            return booking.getPatient().getEmail();
        }
        return null;
    }

    private void saveLog(Booking booking, String type, String status, String message) {
        try {
            NotificationLog logEntry = NotificationLog.builder()
                    .bookingId(booking.getId())
                    .userId(booking.getPatient() != null ? booking.getPatient().getId() : null)
                    .type(type)
                    .status(status)
                    .message(message)
                    .build();
            notificationLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("[NOTIFICATION] Failed to save notification log for booking {}: {}", booking.getId(), e.getMessage());
        }
    }
}

package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ConsentCaptureRequest;
import com.healthcare.labtestbooking.dto.ConsentCaptureResponse;
import com.healthcare.labtestbooking.dto.ConsentStatusResponse;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.ConsentRecord;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.ConsentType;
import com.healthcare.labtestbooking.exception.BadRequestException;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ConsentRecordRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsentService {

    private final ConsentRecordRepository consentRecordRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public ConsentCaptureResponse captureConsent(ConsentCaptureRequest request, HttpServletRequest httpRequest) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!requiresConsent(booking)) {
            throw new BadRequestException("Consent capture is not required for this test");
        }

        User collector = getCurrentUser();
        if (booking.getTechnician() != null && !booking.getTechnician().getId().equals(collector.getId())) {
            throw new BadRequestException("Only the assigned technician can capture consent for this booking");
        }

        LocalDateTime now = LocalDateTime.now();
        String signatureHash = sha256(request.getPatientSignatureData().trim() + "|" + now);

        ConsentRecord record = ConsentRecord.builder()
                .bookingId(booking.getId())
                .patientId(booking.getPatient().getId())
                .testName(resolveTestName(booking))
                .consentType(resolveConsentType(booking.getTest()))
                .consentGiven(Boolean.TRUE.equals(request.getConsentGiven()))
                .consentTimestamp(now)
                .collectorId(collector.getId())
                .ipAddress(httpRequest != null ? httpRequest.getRemoteAddr() : null)
                .deviceInfo(httpRequest != null ? httpRequest.getHeader("User-Agent") : null)
                .patientSignatureHash(signatureHash)
                .build();

        consentRecordRepository.save(record);

        auditService.logAction(
                collector.getId(), collector.getEmail(), collector.getRole().name(),
                "CONSENT_CAPTURED", "BOOKING", String.valueOf(booking.getId()),
                "bookingId=" + booking.getId()
                        + ", testType=" + record.getConsentType()
                        + ", timestamp=" + now
                        + ", collectorId=" + collector.getId(),
                httpRequest != null ? httpRequest.getRemoteAddr() : null
        );

        return ConsentCaptureResponse.builder()
                .bookingId(booking.getId())
                .testName(record.getTestName())
                .consentType(record.getConsentType())
                .consentGiven(record.getConsentGiven())
                .consentTimestamp(record.getConsentTimestamp())
                .collectorId(collector.getId())
                .collectorName(collector.getName())
                .consentToken(signatureHash)
                .build();
    }

    @Transactional(readOnly = true)
    public ConsentStatusResponse getConsentStatus(Long bookingId) {
        Booking booking = bookingRepository.findDetailedById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean consentRequired = requiresConsent(booking);
        Optional<ConsentRecord> latestOpt = consentRecordRepository.findTopByBookingIdOrderByConsentTimestampDesc(bookingId);

        if (latestOpt.isEmpty()) {
            return ConsentStatusResponse.builder()
                    .bookingId(booking.getId())
                    .testName(resolveTestName(booking))
                    .consentRequired(consentRequired)
                    .consentCaptured(false)
                    .consentGiven(false)
                    .consentType(consentRequired ? resolveConsentType(booking.getTest()) : null)
                    .build();
        }

        ConsentRecord record = latestOpt.get();
        String collectorName = userRepository.findById(record.getCollectorId()).map(User::getName).orElse(null);

        return ConsentStatusResponse.builder()
                .bookingId(booking.getId())
                .testName(record.getTestName())
                .consentRequired(consentRequired)
                .consentCaptured(true)
                .consentGiven(Boolean.TRUE.equals(record.getConsentGiven()))
                .consentType(record.getConsentType())
                .consentTimestamp(record.getConsentTimestamp())
                .collectorId(record.getCollectorId())
                .collectorName(collectorName)
                .build();
    }

    public void assertConsentCapturedBeforeSampleCollection(Booking booking) {
        if (!requiresConsent(booking)) {
            return;
        }
        boolean present = consentRecordRepository.existsByBookingIdAndConsentGivenTrue(booking.getId());
        if (!present) {
            throw new BadRequestException("Patient consent required before sample collection for this test type.");
        }
    }

    private boolean requiresConsent(Booking booking) {
        LabTest test = booking.getTest();
        return test != null && Boolean.TRUE.equals(test.getConsentRequired());
    }

    private ConsentType resolveConsentType(LabTest test) {
        String haystack = ((test != null ? test.getTestName() : "") + " " + (test != null ? test.getCategoryName() : ""))
                .toLowerCase(Locale.ROOT);

        if (haystack.contains("hiv")) {
            return ConsentType.HIV_TEST;
        }
        if (haystack.contains("sti") || haystack.contains("std") || haystack.contains("sexually")) {
            return ConsentType.STI_SCREENING;
        }
        if (haystack.contains("drug") && (haystack.contains("monitor") || haystack.contains("screen") || haystack.contains("abuse"))) {
            return ConsentType.DRUG_MONITORING;
        }
        return ConsentType.GENETIC_TEST;
    }

    private String resolveTestName(Booking booking) {
        if (booking.getTest() != null && booking.getTest().getTestName() != null) {
            return booking.getTest().getTestName();
        }
        if (booking.getTestPackage() != null && booking.getTestPackage().getPackageName() != null) {
            return booking.getTestPackage().getPackageName();
        }
        return "Lab Test";
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String sha256(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            log.error("Failed to generate SHA-256 hash", e);
            throw new BadRequestException("Unable to process signature data");
        }
    }
}

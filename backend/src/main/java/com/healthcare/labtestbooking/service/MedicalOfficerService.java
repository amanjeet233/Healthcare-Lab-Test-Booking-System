package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.dto.ReportVerificationRequest;
import com.healthcare.labtestbooking.dto.ReportVerificationResponse;
import com.healthcare.labtestbooking.dto.DeltaCheckEntry;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.PanicAlertLog;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.entity.Technician;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.AssignmentType;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.ReportStatus;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.entity.enums.VerificationStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.PanicAlertLogRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
import com.healthcare.labtestbooking.repository.TechnicianRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalOfficerService {

    private final ReportVerificationRepository reportVerificationRepository;
    private final BookingRepository bookingRepository;
    private final ReportRepository reportRepository;
    private final ReportResultRepository reportResultRepository;
    private final UserRepository userRepository;
    private final TechnicianRepository technicianRepository;
    private final BookingService bookingService;
    private final AuditService auditService;
    private final NotificationInboxService notificationInboxService;
    private final NotificationService notificationService;
    private final PdfReportService pdfReportService;
    private final ReflexTestingService reflexTestingService;
    private final AIAnalysisService aiAnalysisService;
    private final ReportSealingService reportSealingService;
    private final PanicAlertLogRepository panicAlertLogRepository;

    @Transactional(readOnly = true)
    public Page<ReportVerificationResponse> getPendingVerifications(Pageable pageable) {
        validateMedicalOfficerAccess();
        return reportVerificationRepository
                .findByStatusOrderByCreatedAtDesc(VerificationStatus.PENDING, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ReportVerificationResponse> getVerificationsByFilter(String filter, Pageable pageable) {
        validateMedicalOfficerAccess();
        
        if (filter == null || filter.equalsIgnoreCase("ALL")) {
            return getPendingVerifications(pageable);
        }

        Page<ReportVerification> verifications;
        switch (filter.toUpperCase()) {
            case "NEW":
                LocalDateTime since = LocalDateTime.now().minusHours(24);
                verifications = reportVerificationRepository.findByStatusAndCreatedAtAfterOrderByCreatedAtDesc(
                        VerificationStatus.PENDING, since, pageable);
                break;
            case "CRITICAL":
                verifications = reportVerificationRepository.findCriticalPending(pageable);
                break;
            case "RECHECK":
                verifications = reportVerificationRepository.findByStatusAndPreviouslyRejectedTrueOrderByCreatedAtDesc(
                        VerificationStatus.PENDING, pageable);
                break;
            default:
                verifications = reportVerificationRepository.findByStatusOrderByCreatedAtDesc(
                        VerificationStatus.PENDING, pageable);
        }

        return verifications.map(this::mapToResponse);
    }

	@Transactional(readOnly = true)
	public Page<ReportVerificationResponse> getVerificationHistory(String status, Pageable pageable) {
		validateMedicalOfficerAccess();

		if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
			VerificationStatus verificationStatus = VerificationStatus.valueOf(status.toUpperCase());
			return reportVerificationRepository.findByStatusOrderByCreatedAtDesc(verificationStatus, pageable)
					.map(this::mapToResponse);
		}

		return reportVerificationRepository
				.findByStatusInOrderByCreatedAtDesc(Arrays.asList(
						VerificationStatus.APPROVED,
						VerificationStatus.REJECTED,
						VerificationStatus.FLAGGED
				), pageable)
				.map(this::mapToResponse);
	}

    @Transactional(readOnly = true)
    public long getPendingVerificationsCount() {
        validateMedicalOfficerAccess();
        return reportVerificationRepository.countByStatus(VerificationStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<DeltaCheckEntry> getDeltaCheck(Long patientId, String testName) {
        validateMedicalOfficerAccess();
        if (patientId == null || testName == null || testName.trim().isEmpty()) {
            return List.of();
        }

        String normalizedTestName = testName.trim();
        List<Booking> recentCompletedSameTest = bookingRepository.findByPatientIdAndStatus(patientId, BookingStatus.COMPLETED)
                .stream()
                .filter(booking -> normalizedTestName.equalsIgnoreCase(resolveTestName(booking)))
                .sorted(Comparator
                        .comparing(Booking::getBookingDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(3)
                .toList();

        return recentCompletedSameTest.stream()
                .flatMap(booking -> reportResultRepository.findByBookingId(booking.getId()).stream()
                        .map(result -> mapDeltaEntry(booking, result)))
                .sorted(Comparator
                        .comparing(DeltaCheckEntry::getBookingDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(DeltaCheckEntry::getParameterName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportVerificationResponse verifyReport(Long bookingId, ReportVerificationRequest request) {
        validateMedicalOfficerAccess();

        if (request.getClinicalNotes() == null || request.getClinicalNotes().trim().length() < 10) {
            throw new com.healthcare.labtestbooking.exception.BadRequestException(
                    "Clinical remarks are mandatory and must be at least 10 characters.");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        List<ReportResult> reportResults = reportResultRepository.findByBookingId(bookingId);
        if (reportResults.isEmpty()) {
            throw new RuntimeException("No report results found for booking with id: " + bookingId);
        }

        reflexTestingService.evaluateReflexRules(bookingId, reportResults);
        if (reflexTestingService.hasPendingManualSuggestions(bookingId)) {
            throw new com.healthcare.labtestbooking.exception.BadRequestException(
                    "Resolve pending reflex suggestions before final sign-off.");
        }

        User medicalOfficer = getCurrentUser();

        ReportVerification verification = reportVerificationRepository.findByBookingId(bookingId)
                .orElse(null);

        if (verification == null) {
            verification = ReportVerification.builder()
                    .booking(booking)
                    .medicalOfficer(medicalOfficer)
                    .build();
        }

        verification.setClinicalNotes(request.getClinicalNotes());
        if (request.getDigitalSignature() == null) {
            verification.setDigitalSignature(generateDigitalSignature(medicalOfficer));
        } else {
            verification.setDigitalSignature(request.getDigitalSignature());
        }
        verification.setVerificationDate(LocalDateTime.now());
        verification.setStatus(VerificationStatus.APPROVED);
        verification.setIcdCodes(request.getIcdCodes() != null ? String.join(",", request.getIcdCodes()) : null);

        verification = reportVerificationRepository.save(verification);

        Report report = reportRepository.findByBookingId(bookingId)
                .orElseGet(() -> {
                    Report generatedReport = Report.builder()
                            .booking(booking)
                            .patient(booking.getPatient())
                            .generatedDate(LocalDateTime.now())
                            .status(ReportStatus.DRAFT)
                            .build();
                    return reportRepository.save(generatedReport);
                });
        LocalDateTime verifiedAt = LocalDateTime.now();
        report.setVerifiedBy(medicalOfficer.getName());
        report.setVerifiedAt(verifiedAt);
        report.setStatus(ReportStatus.VERIFIED);
        
        // Generate and set digital fingerprint (Hardened Security)
        String fingerprint = reportSealingService.generateFingerprint(report);
        report.setDigitalFingerprint(fingerprint);
        
        reportRepository.save(report);

        // Advance booking status: PENDING_VERIFICATION → VERIFIED
        BookingStatus previousStatus = booking.getStatus();
        bookingService.validateStatusTransition(previousStatus, BookingStatus.VERIFIED);
        booking.setStatus(BookingStatus.VERIFIED);
        booking.setReportAvailable(true);
        booking.setMedicalOfficer(medicalOfficer);
        bookingRepository.save(booking);

        // Generate and persist patient-downloadable PDF right after MO sign-off.
        pdfReportService.generateReport(bookingId);
        aiAnalysisService.analyzeReport(bookingId);

        // Notify patient that report is ready
        try {
            User patient = booking.getPatient();
            if (patient != null) {
                notificationService.sendReportReadyNotification(patient, booking);
                log.info("[NOTIFY] Report ready sent to patient: {}", patient.getEmail());
            }
        } catch (Exception notifyEx) {
            // Never fail verification due to notification failure
            log.error("[NOTIFY] Failed to notify patient: {}", notifyEx.getMessage());
        }

        // Create in-app notification in notification inbox
        try {
            User patient = booking.getPatient();
            if (patient != null) {
                String testName = booking.getTest() != null
                        ? booking.getTest().getTestName()
                        : booking.getTestPackage() != null
                                ? booking.getTestPackage().getPackageName()
                                : "Your lab test";

                notificationInboxService.createNotification(
                        patient.getId(),
                        "REPORT_READY",
                        "Report Ready for Download",
                        testName + " report has been verified by " + medicalOfficer.getName()
                                + ". Download it now. Visit /reports",
                        "REPORT",
                        bookingId
                );
            }
        } catch (Exception inboxEx) {
            log.error("[INBOX] Failed to create inbox notification: {}", inboxEx.getMessage());
        }

        auditService.logAction(
                medicalOfficer.getId(), medicalOfficer.getEmail(), UserRole.MEDICAL_OFFICER.name(),
                "REPORT_VERIFIED", "BOOKING", String.valueOf(bookingId),
                "Report verified by " + medicalOfficer.getName());
        auditService.logAction(
                medicalOfficer.getId(), medicalOfficer.getEmail(), UserRole.MEDICAL_OFFICER.name(),
                "BOOKING_STATUS_CHANGED", "BOOKING", String.valueOf(bookingId),
                "Status changed from " + previousStatus + " to " + BookingStatus.VERIFIED);

        return mapToResponse(verification);
    }

    @Transactional
    public ReportVerificationResponse amendReport(Long reportId, String reason, Map<Long, String> newValues) {
        validateMedicalOfficerAccess();

        Report originalReport = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Original report not found"));

        if (originalReport.getStatus() != ReportStatus.VERIFIED && originalReport.getStatus() != ReportStatus.AMENDED) {
            throw new com.healthcare.labtestbooking.exception.BadRequestException("Only verified or already amended reports can be further amended.");
        }

        User medicalOfficer = getCurrentUser();
        Booking booking = originalReport.getBooking();

        // Create new Amended Report entry
        Report amendedReport = Report.builder()
                .booking(booking)
                .order(originalReport.getOrder())
                .patient(originalReport.getPatient())
                .status(ReportStatus.AMENDED)
                .version(originalReport.getVersion() + 1)
                .parentReportId(originalReport.getParentReportId() != null ? originalReport.getParentReportId() : originalReport.getId())
                .isAmended(true)
                .amendmentReason(reason)
                .verifiedBy(medicalOfficer.getName())
                .verifiedAt(LocalDateTime.now())
                .generatedDate(LocalDateTime.now())
                .build();

        amendedReport = reportRepository.save(amendedReport);

        // Map and update results for the new report version
        List<ReportResult> originalResults = reportResultRepository.findByBookingId(booking.getId());
        for (ReportResult originalRes : originalResults) {
            String newValue = newValues.get(originalRes.getParameter().getId());
            
            ReportResult newRes = ReportResult.builder()
                    .booking(booking)
                    .report(amendedReport)
                    .test(originalRes.getTest())
                    .parameter(originalRes.getParameter())
                    .unit(originalRes.getUnit())
                    .normalRange(originalRes.getNormalRange())
                    .normalRangeMin(originalRes.getNormalRangeMin())
                    .normalRangeMax(originalRes.getNormalRangeMax())
                    .value(newValue != null ? newValue : originalRes.getValue())
                    .resultValue(newValue != null ? newValue : originalRes.getResultValue())
                    .status(originalRes.getStatus())
                    .build();
            
            reportResultRepository.save(newRes);
        }

        // Generate security seal for the new version
        String fingerprint = reportSealingService.generateFingerprint(amendedReport);
        amendedReport.setDigitalFingerprint(fingerprint);
        reportRepository.save(amendedReport);

        // Update PDF
        pdfReportService.generateReport(booking.getId());

        auditService.logAction(
                medicalOfficer.getId(), medicalOfficer.getEmail(), UserRole.MEDICAL_OFFICER.name(),
                "REPORT_AMENDED", "REPORT", String.valueOf(amendedReport.getId()),
                "Report #" + reportId + " amended (v" + amendedReport.getVersion() + ") for reason: " + reason);

        return mapToResponse(amendedReport);
    }

    @Transactional
    public ReportVerificationResponse rejectReport(Long bookingId, String rejectionReason) {
        validateMedicalOfficerAccess();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        User medicalOfficer = getCurrentUser();

        ReportVerification verification = reportVerificationRepository.findByBookingId(bookingId)
                .orElse(null);

        if (verification == null) {
            verification = ReportVerification.builder()
                    .booking(booking)
                    .medicalOfficer(medicalOfficer)
                    .build();
        }

        verification.setClinicalNotes("Report rejected: " + rejectionReason);
        verification.setDigitalSignature(generateDigitalSignature(medicalOfficer));
        verification.setVerificationDate(LocalDateTime.now());
        verification.setStatus(VerificationStatus.REJECTED);
        verification.setPreviouslyRejected(true);

        verification = reportVerificationRepository.save(verification);

        // Send back: PENDING_VERIFICATION → PROCESSING
        BookingStatus previousStatus = booking.getStatus();
        bookingService.validateStatusTransition(previousStatus, BookingStatus.PROCESSING);
        booking.setStatus(BookingStatus.PROCESSING);
        booking.setReportAvailable(false);
        bookingRepository.save(booking);

        auditService.logAction(
                medicalOfficer.getId(), medicalOfficer.getEmail(), UserRole.MEDICAL_OFFICER.name(),
                "REPORT_REJECTED", "BOOKING", String.valueOf(bookingId),
                "Report rejected by " + medicalOfficer.getName() + ": " + rejectionReason);
        auditService.logAction(
                medicalOfficer.getId(), medicalOfficer.getEmail(), UserRole.MEDICAL_OFFICER.name(),
                "BOOKING_STATUS_CHANGED", "BOOKING", String.valueOf(bookingId),
                "Status changed from " + previousStatus + " to " + BookingStatus.PROCESSING);

        return mapToResponse(verification);
    }

    @Transactional
    public void flagCritical(Long bookingId) {
        validateMedicalOfficerAccess();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        booking.setCriticalFlag(true);
        bookingRepository.save(booking);

        User medicalOfficer = getCurrentUser();

        List<User> admins = userRepository.findByRoleAndIsActiveTrue(UserRole.ADMIN);
        for (User admin : admins) {
            notificationInboxService.createNotification(
                    admin.getId(),
                    "CRITICAL_ALERT",
                    "Critical Booking Flagged",
                    String.format("Medical Officer %s flagged booking #%s as CRITICAL.",
                            medicalOfficer.getName(), bookingId),
                    "BOOKING",
                    bookingId
            );
        }

        auditService.logAction(
                medicalOfficer.getId(), medicalOfficer.getEmail(), UserRole.MEDICAL_OFFICER.name(),
                "BOOKING_FLAGGED_CRITICAL", "BOOKING", String.valueOf(bookingId),
                "Booking flagged as critical by " + medicalOfficer.getName());
    }

    @Transactional
    public void logPanicAlert(Long bookingId, String physicianName, String channel, String instructions) {
        validateMedicalOfficerAccess();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        User medicalOfficer = getCurrentUser();

        // Snapshot of current results that are critical/abnormal
        String panicSnapshot = booking.getReportResults().stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsCritical()) || Boolean.TRUE.equals(r.getIsAbnormal()))
                .map(r -> (r.getParameter() != null ? r.getParameter().getParameterName() : "P") + ":" + r.getResultValue())
                .collect(Collectors.joining("; "));

        PanicAlertLog panicLog = PanicAlertLog.builder()
                .booking(booking)
                .loggedBy(medicalOfficer)
                .notifiedPhysician(physicianName)
                .communicationChannel(channel)
                .notifiedAt(LocalDateTime.now())
                .panicValues(panicSnapshot)
                .physicianInstruction(instructions)
                .build();

        panicAlertLogRepository.save(panicLog);

        auditService.logAction(
                medicalOfficer.getId(), medicalOfficer.getEmail(), UserRole.MEDICAL_OFFICER.name(),
                "PANIC_VALUE_LOGGED", "BOOKING", String.valueOf(bookingId),
                "Critical results communicated to Dr. " + physicianName + " via " + channel);
    }

    @Transactional
    public ReportVerificationResponse addICDCodes(Long bookingId, List<String> icdCodes) {
        validateMedicalOfficerAccess();

        ReportVerification verification = reportVerificationRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No verification found for booking with id: " + bookingId));

        if (verification.getStatus() != VerificationStatus.APPROVED) {
            throw new RuntimeException("ICD codes can only be added to verified reports");
        }

        verification.setIcdCodes(String.join(",", icdCodes));
        verification.setUpdatedAt(LocalDateTime.now());

        verification = reportVerificationRepository.save(verification);

        return mapToResponse(verification);
    }

    @Transactional
    public void referToSpecialist(Long bookingId, String specialistType, String referralNotes) {
        validateMedicalOfficerAccess();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        ReportVerification verification = reportVerificationRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No verification found for booking with id: " + bookingId));

        String existingNotes = verification.getClinicalNotes() != null ? verification.getClinicalNotes() : "";
        String referralText = String.format("\n\nREFERRAL TO %s:\n%s", specialistType.toUpperCase(), referralNotes);

        verification.setClinicalNotes(existingNotes + referralText);
        verification.setUpdatedAt(LocalDateTime.now());
        verification.setRequiresSpecialistReferral(true);
        verification.setSpecialistType(specialistType);

        reportVerificationRepository.save(verification);
    }

    // ── MO Technician Assignment ──────────────────────────────────────────────

    /**
     * Medical Officer suggests a technician for a booking.
     * Sets assignmentType = MO_SUGGESTED and sends a notification to the technician.
     */
    @Transactional
    public BookingResponse suggestTechnician(Long bookingId, Long technicianUserId) {
        validateMedicalOfficerAccess();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        User techUser = resolveTechnicianUser(technicianUserId);

        User mo = getCurrentUser();

        booking.setTechnician(techUser);
        booking.setAssignmentType(AssignmentType.MO_SUGGESTED);
        bookingRepository.save(booking);

        // Notify the technician
        String patientName = booking.getPatientDisplayName() != null
                ? booking.getPatientDisplayName() : (booking.getPatient() != null ? booking.getPatient().getName() : "Patient");
        String bookingDate = booking.getBookingDate() != null ? booking.getBookingDate().toString() : "-";
        String address = booking.getCollectionAddress() != null ? booking.getCollectionAddress() : "Lab";

        notificationInboxService.createNotification(
                techUser.getId(),
                "TECHNICIAN_ASSIGNED_BY_MO",
                "New Booking Assigned by Medical Officer",
                String.format("New booking assigned by Medical Officer. Patient: %s. Date: %s. Address: %s.",
                        patientName, bookingDate, address),
                "BOOKING",
                bookingId
        );

        auditService.logAction(
                mo.getId(), mo.getEmail(), UserRole.MEDICAL_OFFICER.name(),
                "TECHNICIAN_ASSIGNED_BY_MO", "BOOKING", String.valueOf(bookingId),
                "MO " + mo.getName() + " suggested technician userId=" + technicianUserId + " for booking " + bookingId);

        return bookingService.mapToResponsePublic(booking);
    }

    private User resolveTechnicianUser(Long technicianIdentifier) {
        if (technicianIdentifier == null) {
            throw new RuntimeException("technicianId is required");
        }

        // Primary path: frontend sends technician user id
        User directUser = userRepository.findById(technicianIdentifier).orElse(null);
        if (directUser != null) {
            if (directUser.getRole() != UserRole.TECHNICIAN) {
                throw new RuntimeException("User " + technicianIdentifier + " is not a TECHNICIAN");
            }
            return directUser;
        }

        // Compatibility path: frontend sends technicians table id
        Technician technician = technicianRepository.findById(technicianIdentifier)
                .orElseThrow(() -> new RuntimeException("Technician not found: " + technicianIdentifier));
        User user = technician.getUser();
        if (user == null) {
            throw new RuntimeException("Technician " + technicianIdentifier + " has no linked user");
        }
        if (user.getRole() != UserRole.TECHNICIAN) {
            throw new RuntimeException("Linked user is not a TECHNICIAN");
        }
        return user;
    }

    /**
     * Returns all bookings with no technician assigned yet, in statuses BOOKED or CONFIRMED,
     * sorted by bookingDate ascending — gives MO visibility into pending collections.
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getUnassignedBookings() {
        validateMedicalOfficerAccess();
                List<BookingStatus> eligibleStatuses = Arrays.asList(BookingStatus.BOOKED, BookingStatus.CONFIRMED);
        return bookingRepository.findUnassignedBookingsByStatuses(eligibleStatuses)
                .stream()
                .map(bookingService::mapToResponsePublic)
                .collect(Collectors.toList());
    }

    /**
     * Returns all active technicians with their booking count for a given date
     * so the MO can make load-balanced assignment decisions.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTechniciansAvailableForDate(LocalDate date) {
        validateMedicalOfficerAccess();

        // Build a map of technicianUserId -> bookingCount for that date
        Map<Long, Long> countByTechUserId = bookingRepository
                .countBookingsByTechnicianForDate(date)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        List<Technician> technicians = technicianRepository.findByIsActiveTrue();
        if (!technicians.isEmpty()) {
            return technicians.stream().map(tech -> {
                Long userId = tech.getUser() != null ? tech.getUser().getId() : null;
                long count = userId != null ? countByTechUserId.getOrDefault(userId, 0L) : 0L;
                Map<String, Object> info = new LinkedHashMap<>();
                info.put("technicianId", tech.getId());
                info.put("userId", userId);
                info.put("name", tech.getFullName());
                info.put("phone", tech.getPhone());
                info.put("email", tech.getEmail());
                info.put("bookingCountForDate", count);
                return info;
            }).collect(Collectors.toList());
        }

        // Backward-compatible fallback: some environments create TECHNICIAN users
        // without corresponding technicians table rows.
        return userRepository.findByRoleAndIsActiveTrue(UserRole.TECHNICIAN).stream()
                .map(user -> {
                    long count = countByTechUserId.getOrDefault(user.getId(), 0L);
                    Map<String, Object> info = new LinkedHashMap<>();
                    info.put("technicianId", null);
                    info.put("userId", user.getId());
                    info.put("name", user.getName());
                    info.put("phone", user.getPhone());
                    info.put("email", user.getEmail());
                    info.put("bookingCountForDate", count);
                    return info;
                })
                .collect(Collectors.toList());
    }

    private void validateMedicalOfficerAccess() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.MEDICAL_OFFICER && currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Medical officer access required");
        }
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String generateDigitalSignature(User medicalOfficer) {
        return String.format("Digitally signed by Dr. %s on %s",
                medicalOfficer.getName(),
                LocalDateTime.now().toString());
    }

    private ReportVerificationResponse mapToResponse(Report report) {
        Booking booking = report.getBooking();
        boolean anyAbnormal = booking.getReportResults().stream()
                .anyMatch(r -> Boolean.TRUE.equals(r.getIsAbnormal()) || Boolean.TRUE.equals(r.getIsCritical()));
        String testName = resolveTestName(booking);
        Long patientId = booking.getPatient() != null ? booking.getPatient().getId() : null;
        List<Map<String, Object>> resultItems = buildResultItems(booking.getId());
        List<DeltaCheckEntry> previousResults = patientId != null ? getDeltaCheck(patientId, testName) : List.of();

        return ReportVerificationResponse.builder()
                .id(report.getId())
                .bookingId(booking.getId())
                .status(report.getStatus().name())
                .verificationDate(report.getVerifiedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .patientName(booking.getPatientDisplayName() != null && !booking.getPatientDisplayName().isBlank()
                        ? booking.getPatientDisplayName()
                        : booking.getPatient() != null ? booking.getPatient().getName() : null)
                .patientId(patientId)
                .bookingReference(booking.getBookingReference())
                .reference(booking.getBookingReference())
                .testName(testName)
                .bookingDate(booking.getBookingDate() != null ? booking.getBookingDate().toString() : null)
                .collectionAddress(booking.getCollectionAddress())
                .address(booking.getCollectionAddress())
                .criticalFlag(Boolean.TRUE.equals(booking.getCriticalFlag()))
                .anyResultAbnormal(anyAbnormal)
                .resultItems(resultItems)
                .previousResults(previousResults)
                .digitalFingerprint(report.getDigitalFingerprint())
                .version(report.getVersion())
                .isAmended(report.getIsAmended())
                .amendmentReason(report.getAmendmentReason())
                .build();
    }

    private ReportVerificationResponse mapToResponse(ReportVerification verification) {
        Booking booking = verification.getBooking();
        boolean anyAbnormal = booking.getReportResults().stream()
                .anyMatch(r -> Boolean.TRUE.equals(r.getIsAbnormal()) || Boolean.TRUE.equals(r.getIsCritical()));
        String testName = resolveTestName(booking);
        Long patientId = booking.getPatient() != null ? booking.getPatient().getId() : null;
        List<Map<String, Object>> resultItems = buildResultItems(booking.getId());
        List<DeltaCheckEntry> previousResults = patientId != null ? getDeltaCheck(patientId, testName) : List.of();

        return ReportVerificationResponse.builder()
                .id(verification.getId())
                .bookingId(booking.getId())
                .medicalOfficerId(verification.getMedicalOfficer() != null ? verification.getMedicalOfficer().getId() : null)
                .medicalOfficerName(verification.getMedicalOfficer() != null ? verification.getMedicalOfficer().getName() : null)
                .status(verification.getStatus().name())
                .clinicalNotes(verification.getClinicalNotes())
                .digitalSignature(verification.getDigitalSignature())
                .verificationDate(verification.getVerificationDate())
                .icdCodes(verification.getIcdCodes())
                .requiresSpecialistReferral(verification.getRequiresSpecialistReferral())
                .specialistType(verification.getSpecialistType())
                .createdAt(verification.getCreatedAt())
                .updatedAt(verification.getUpdatedAt())
                .patientName(booking.getPatientDisplayName() != null && !booking.getPatientDisplayName().isBlank()
                        ? booking.getPatientDisplayName()
                        : booking.getPatient() != null ? booking.getPatient().getName() : null)
                .patientId(patientId)
                .bookingReference(booking.getBookingReference())
                .reference(booking.getBookingReference())
                .testName(testName)
                .bookingDate(booking.getBookingDate() != null ? booking.getBookingDate().toString() : null)
                .collectionAddress(booking.getCollectionAddress())
                .address(booking.getCollectionAddress())
                .criticalFlag(Boolean.TRUE.equals(booking.getCriticalFlag()))
                .anyResultAbnormal(anyAbnormal)
                .previouslyRejected(Boolean.TRUE.equals(verification.getPreviouslyRejected()))
                .resultItems(resultItems)
                .previousResults(previousResults)
                .digitalFingerprint(reportRepository.findByBookingId(booking.getId()).map(Report::getDigitalFingerprint).orElse(null))
                .build();
    }

    private List<Map<String, Object>> buildResultItems(Long bookingId) {
        List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);
        return results.stream()
                .map(r -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("parameterName",
                            r.getParameter() != null && r.getParameter().getParameterName() != null
                                    ? r.getParameter().getParameterName()
                                    : "Unknown");
                    item.put("value", r.getResultValue());
                    item.put("unit",
                            r.getParameter() != null && r.getParameter().getUnit() != null
                                    ? r.getParameter().getUnit()
                                    : "");
                    item.put("normalRange",
                            r.getParameter() != null && r.getParameter().getNormalRangeText() != null
                                    ? r.getParameter().getNormalRangeText()
                                    : "");
                    item.put("status", r.getAbnormalStatus() != null ? r.getAbnormalStatus().name() : "NORMAL");
                    return item;
                })
                .collect(Collectors.toList());
    }

    private DeltaCheckEntry mapDeltaEntry(Booking booking, ReportResult result) {
        String parameterName = result.getParameter() != null ? result.getParameter().getParameterName() : "-";
        String value = result.getResultValue() != null && !result.getResultValue().isBlank()
                ? result.getResultValue()
                : (result.getValue() != null ? result.getValue() : "-");
        String flag = "N";
        if (result.getAbnormalStatus() != null) {
            String normalized = result.getAbnormalStatus().name();
            if ("HIGH".equals(normalized)) {
                flag = "H";
            } else if ("LOW".equals(normalized)) {
                flag = "L";
            }
        }

        return DeltaCheckEntry.builder()
                .bookingId(booking.getId())
                .bookingDate(booking.getBookingDate())
                .parameterName(parameterName)
                .value(value)
                .unit(result.getUnit() != null ? result.getUnit() : "-")
                .referenceRange(resolveReferenceRange(result))
                .flag(flag)
                .build();
    }

    private String resolveReferenceRange(ReportResult rr) {
        if (rr.getNormalRange() != null && !rr.getNormalRange().isBlank()) {
            return rr.getNormalRange();
        }
        if (rr.getParameter() != null && rr.getParameter().getNormalRangeMin() != null && rr.getParameter().getNormalRangeMax() != null) {
            return rr.getParameter().getNormalRangeMin() + " - " + rr.getParameter().getNormalRangeMax();
        }
        if (rr.getNormalRangeMin() != null && rr.getNormalRangeMax() != null) {
            return rr.getNormalRangeMin() + " - " + rr.getNormalRangeMax();
        }
        return "-";
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
}

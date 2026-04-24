package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.BookingRequest;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.dto.SpecimenRejectionRequest;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.FamilyMember;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.AssignmentType;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.CollectionType;
import com.healthcare.labtestbooking.entity.enums.SpecimenRejectionReason;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.exception.BadRequestException;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.FamilyMemberRepository;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.TestPackageRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final LabTestRepository labTestRepository;
    private final TestPackageRepository testPackageRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final NotificationInboxService notificationInboxService;
    private final ConsentService consentService;

    private static final BigDecimal HOME_COLLECTION_CHARGE = new BigDecimal("150.00");

    /** Allowed forward transitions for each status. */
    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED_TRANSITIONS;

    static {
        Map<BookingStatus, Set<BookingStatus>> map = new EnumMap<>(BookingStatus.class);
        map.put(BookingStatus.BOOKED,               EnumSet.of(BookingStatus.SAMPLE_COLLECTED, BookingStatus.CANCELLED));
        map.put(BookingStatus.CONFIRMED,            EnumSet.of(BookingStatus.SAMPLE_COLLECTED, BookingStatus.CANCELLED));
        map.put(BookingStatus.REFLEX_PENDING,       EnumSet.of(BookingStatus.SAMPLE_COLLECTED, BookingStatus.CANCELLED));
        map.put(BookingStatus.SAMPLE_COLLECTED,      EnumSet.of(BookingStatus.PROCESSING));
        map.put(BookingStatus.PROCESSING,            EnumSet.of(BookingStatus.PENDING_VERIFICATION));
        map.put(BookingStatus.PENDING_VERIFICATION,  EnumSet.of(BookingStatus.VERIFIED, BookingStatus.PROCESSING));
        map.put(BookingStatus.VERIFIED,              EnumSet.of(BookingStatus.COMPLETED));
        map.put(BookingStatus.COMPLETED,             Collections.emptySet());
        map.put(BookingStatus.CANCELLED,             Collections.emptySet());
        ALLOWED_TRANSITIONS = Collections.unmodifiableMap(map);
    }

    // ── Status Transition Validation ──────────────────────────────────────────

    /**
     * Validates that {@code newStatus} is a legal forward transition from {@code currentStatus}.
     * Throws {@link BadRequestException} if the transition is not allowed.
     */
    public void validateStatusTransition(BookingStatus currentStatus, BookingStatus newStatus) {
        Set<BookingStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
        if (!allowed.contains(newStatus)) {
            throw new BadRequestException("Invalid status transition");
        }
    }

    /**
     * Returns the list of valid next statuses for a given booking.
     */
    public List<BookingStatus> getAllowedTransitions(Long bookingId) {
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId, "Booking ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        Set<BookingStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(booking.getStatus(), Collections.emptySet());
        return List.copyOf(allowed);
    }

    // ── Booking CRUD ──────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "adminStats", allEntries = true)
    public BookingResponse createBooking(BookingRequest request) {
        log.info("========== CREATE BOOKING ATTEMPT ==========");
        log.info("Request: {}", request);

        User patient = getCurrentUser();
        log.info("Patient: {} (ID: {})", patient.getEmail(), patient.getId());

        if (request.getPatientId() != null && !request.getPatientId().equals(patient.getId())
                && patient.getRole() != UserRole.ADMIN) {
            log.error("Patient ID mismatch: Request ID {}, Authenticated ID {}", request.getPatientId(),
                    patient.getId());
            throw new RuntimeException("Cannot create booking for another patient");
        }

        Long testId = request.getTestId();
        Long packageId = request.getPackageId();
        if (testId == null && packageId == null) {
            throw new RuntimeException("Either testId or packageId is required");
        }

        LabTest labTest = null;
        TestPackage testPackage = null;
        BigDecimal sourcePrice;
        String sourceName;

        if (testId != null) {
            log.info("Looking up test with ID: {}", testId);
            labTest = labTestRepository.findById(testId)
                    .orElseThrow(() -> new RuntimeException("Lab test not found with id: " + testId));

            if (!labTest.getIsActive()) {
                log.error("Test is not active: {}", labTest.getTestName());
                throw new RuntimeException("Lab test is currently not available");
            }

            sourcePrice = labTest.getPrice();
            sourceName = labTest.getTestName();
        } else {
            log.info("Looking up package with ID: {}", packageId);
            testPackage = testPackageRepository.findById(packageId)
                    .orElseThrow(() -> new RuntimeException("Package not found with id: " + packageId));

            if (!Boolean.TRUE.equals(testPackage.getIsActive())) {
                throw new RuntimeException("Test package is currently not available");
            }

            sourcePrice = testPackage.getEffectivePrice() != null ? testPackage.getEffectivePrice() : testPackage.getTotalPrice();
            sourceName = testPackage.getPackageName();
        }

        log.info("Found booking source: {} (Price: {})", sourceName, sourcePrice);

        String patientDisplayName = patient.getName();
        Long familyMemberId = null;
        if (request.getFamilyMemberId() != null) {
            FamilyMember familyMember = familyMemberRepository.findById(request.getFamilyMemberId())
                    .orElseThrow(() -> new RuntimeException("Family member not found with id: " + request.getFamilyMemberId()));

            if (!familyMember.getPatient().getId().equals(patient.getId()) && patient.getRole() != UserRole.ADMIN) {
                throw new RuntimeException("Cannot create booking for a family member outside your account");
            }

            familyMemberId = familyMember.getId();
            patientDisplayName = familyMember.getName();
        }

        CollectionType collectionType = CollectionType.LAB;
        BigDecimal homeCharge = BigDecimal.ZERO;

        if (request.getCollectionType() != null && request.getCollectionType().equalsIgnoreCase("HOME")) {
            collectionType = CollectionType.HOME;
            homeCharge = HOME_COLLECTION_CHARGE;
        }

        BigDecimal totalAmount = sourcePrice.add(homeCharge);
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal finalAmount = totalAmount.subtract(discount);

        String bookingRef = "HLTH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .bookingReference(bookingRef)
                .patient(patient)
                .legacyUserId(patient.getId())
                .test(labTest)
                .testPackage(testPackage)
                .bookingDate(request.getBookingDate())
                .timeSlot(request.getTimeSlot())
                .familyMemberId(familyMemberId)
                .patientDisplayName(patientDisplayName)
                .status(BookingStatus.BOOKED)
                .collectionType(collectionType)
                .collectionAddress(request.getCollectionAddress())
                .notes(request.getNotes())
                .homeCollectionCharge(homeCharge)
                .totalAmount(totalAmount)
                .discount(discount)
                .finalAmount(finalAmount)
                .build();

        booking = bookingRepository.save(Objects.requireNonNull(booking, "Booking must not be null"));

        // Fire-and-forget: send fasting & preparation instructions to the patient
        notificationService.sendBookingConfirmation(booking);

        return mapToResponse(booking);
    }

    public List<BookingResponse> getMyBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByPatientId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<BookingResponse> getMyBookings(Pageable pageable) {
        User user = getCurrentUser();
        log.info("Fetching bookings for patient {} with pagination | Page: {}, Size: {}",
                user.getId(), pageable.getPageNumber(), pageable.getPageSize());
        return bookingRepository.findByPatientId(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    public List<BookingResponse> getTechnicianBookings() {
        User technician = getCurrentUser();
        return bookingRepository.findByTechnicianId(technician.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<BookingResponse> getTechnicianBookings(Pageable pageable) {
        User technician = getCurrentUser();
        log.info("Fetching bookings for technician {} with pagination | Page: {}, Size: {}",
                technician.getId(), pageable.getPageNumber(), pageable.getPageSize());
        return bookingRepository.findByTechnicianId(technician.getId(), pageable)
                .map(this::mapToResponse);
    }

    public List<BookingResponse> getTechnicianTodayBookings() {
        User technician = getCurrentUser();
        LocalDate today = LocalDate.now();
        return bookingRepository.findByTechnicianId(technician.getId()).stream()
                .filter(b -> today.equals(b.getBookingDate()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getTechnicianRejectedSpecimens() {
        User technician = getCurrentUser();
        return bookingRepository.findByTechnicianId(technician.getId()).stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED && b.getRejectionReason() != null && !b.getRejectionReason().isBlank())
                .sorted((a, b) -> {
                    LocalDateTime left = a.getRejectedAt() != null ? a.getRejectedAt() : a.getCreatedAt();
                    LocalDateTime right = b.getRejectedAt() != null ? b.getRejectedAt() : b.getCreatedAt();
                    return right.compareTo(left);
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getUnassignedBookings() {
        List<BookingStatus> statuses = List.of(BookingStatus.BOOKED, BookingStatus.CONFIRMED);
        return bookingRepository.findByTechnicianIsNullAndStatusIn(statuses).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<String> getAvailableSlots(String dateStr, Long testId) {
        LocalDate date = LocalDate.parse(dateStr);
        List<Booking> bookings = bookingRepository.findByBookingDate(date);

        List<String> allSlots = java.util.Arrays.asList(
                "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
                "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM");

        Set<String> bookedSlots = bookings.stream()
                .map(Booking::getTimeSlot)
                .collect(Collectors.toSet());

        return allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findDetailedById(Objects.requireNonNull(id, "Booking ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        if (!booking.getPatient().getId().equals(user.getId())
                && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to view this booking");
        }

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(Objects.requireNonNull(id, "Booking ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        if (!booking.getPatient().getId().equals(user.getId())
                && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        auditService.logAction(
                user.getId(), user.getEmail(), user.getRole().name(),
                "BOOKING_STATUS_CHANGED",
                "BOOKING", String.valueOf(id),
                "Status -> " + BookingStatus.CANCELLED + " (cancelled by " + user.getRole().name() + ")");

        return mapToResponse(booking);
    }

    public List<BookingResponse> getBookingsByTechnician(Long technicianId) {
        return bookingRepository.findByTechnicianId(technicianId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<Booking> getTechnicianBookings(Long technicianId) {
        return bookingRepository.findByTechnicianId(technicianId);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public BookingResponse assignTechnician(Long bookingId, Long technicianId) {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.TECHNICIAN
                && !Objects.equals(currentUser.getId(), technicianId)) {
            throw new RuntimeException("Technicians can only claim bookings for themselves");
        }

        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId, "Booking ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        User technician = userRepository.findById(Objects.requireNonNull(technicianId, "Technician ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Technician not found with id: " + technicianId));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new RuntimeException("User is not a technician");
        }

        booking.setTechnician(technician);
        booking.setAssignmentType(AssignmentType.ADMIN_ASSIGNED);
        booking = bookingRepository.save(booking);

        auditService.logAction(
                currentUser.getId(), currentUser.getEmail(), currentUser.getRole().name(),
                "TECHNICIAN_ASSIGNED",
                "BOOKING", String.valueOf(bookingId),
                "TECHNICIAN_ASSIGNED bookingId=" + bookingId + " technicianId=" + technicianId + " technicianName=" + technician.getName());

        return mapToResponse(booking);
    }

    public boolean checkSlotAvailability(LocalDate date, String timeSlot) {
        List<Booking> existingBookings = bookingRepository.findByBookingDateAndTimeSlot(date, timeSlot);
        return existingBookings.isEmpty();
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(Objects.requireNonNull(id, "Booking ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        // Only admin endpoint can cancel directly from status-update APIs.
        if (newStatus == BookingStatus.CANCELLED) {
            throw new BadRequestException("Invalid status transition");
        }

        if (newStatus == BookingStatus.SAMPLE_COLLECTED) {
            consentService.assertConsentCapturedBeforeSampleCollection(booking);
        }

        BookingStatus oldStatus = booking.getStatus();
        validateStatusTransition(oldStatus, newStatus);

        booking.setStatus(newStatus);
        booking = bookingRepository.save(booking);

        auditService.logAction(
                null, null, null,
                "BOOKING_STATUS_CHANGED",
                "BOOKING", String.valueOf(id),
                "Status -> " + newStatus + " (from " + oldStatus + ")");

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse adminUpdateBookingStatus(Long id, BookingStatus newStatus, String cancellationReason) {
        Booking booking = bookingRepository.findById(Objects.requireNonNull(id, "Booking ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(newStatus);
        
        if (newStatus == BookingStatus.CANCELLED && cancellationReason != null) {
            booking.setCancellationReason(cancellationReason);
        }

        booking = bookingRepository.save(booking);

        auditService.logAction(
                null, null, "ADMIN",
                "BOOKING_STATUS_CHANGED",
                "BOOKING", String.valueOf(id),
                "Status -> " + newStatus + " (admin override from " + oldStatus + ")" +
                        (cancellationReason != null ? " Reason: " + cancellationReason : ""));

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse markCollected(Long id) {
        Booking booking = bookingRepository.findById(Objects.requireNonNull(id, "Booking ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        consentService.assertConsentCapturedBeforeSampleCollection(booking);
        validateStatusTransition(booking.getStatus(), BookingStatus.SAMPLE_COLLECTED);

        booking.setStatus(BookingStatus.SAMPLE_COLLECTED);
        booking = bookingRepository.save(booking);

        auditService.logAction(null, null, "TECHNICIAN",
                "BOOKING_STATUS_CHANGED", "BOOKING", String.valueOf(id),
                "Status -> " + BookingStatus.SAMPLE_COLLECTED + " (sample collected)");

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse rejectSpecimen(Long bookingId, SpecimenRejectionRequest request) {
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId, "Booking ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        User technician = getCurrentUser();

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new BadRequestException("Only technicians can reject specimens");
        }
        if (booking.getTechnician() == null || !Objects.equals(booking.getTechnician().getId(), technician.getId())) {
            throw new BadRequestException("You can reject only your assigned bookings");
        }
        if (!(booking.getStatus() == BookingStatus.BOOKED
                || booking.getStatus() == BookingStatus.CONFIRMED
                || booking.getStatus() == BookingStatus.SAMPLE_COLLECTED)) {
            throw new BadRequestException("Specimen can only be rejected in BOOKED/CONFIRMED or SAMPLE_COLLECTED status");
        }
        if (request == null || request.getReason() == null) {
            throw new BadRequestException("Rejection reason is required");
        }

        SpecimenRejectionReason reason = request.getReason();
        String notes = request.getNotes() != null ? request.getNotes().trim() : null;
        String finalReason = notes == null || notes.isEmpty()
                ? reason.name()
                : reason.name() + " | " + notes;

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setRejectionReason(finalReason);
        booking.setRejectedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        final Booking rejectedBooking = booking;

        auditService.logAction(
                technician.getId(), technician.getEmail(), technician.getRole().name(),
                "SPECIMEN_REJECTED",
                "BOOKING", String.valueOf(bookingId),
                "Technician rejected specimen. reason=" + reason.name() + (notes != null && !notes.isEmpty() ? ", notes=" + notes : "")
        );
        auditService.logAction(
                technician.getId(), technician.getEmail(), technician.getRole().name(),
                "BOOKING_STATUS_CHANGED",
                "BOOKING", String.valueOf(bookingId),
                "Status -> " + BookingStatus.CANCELLED + " (specimen rejected)");

        if (rejectedBooking.getPatient() != null) {
            notificationInboxService.createNotification(
                    rejectedBooking.getPatient().getId(),
                    "SPECIMEN_REJECTED",
                    "Sample Rejected",
                    "Your sample for booking #" + rejectedBooking.getId() + " was rejected due to: " + reason.name(),
                    "BOOKING",
                    rejectedBooking.getId()
            );
        }
        userRepository.findByRoleAndIsActiveTrue(UserRole.ADMIN).forEach(admin ->
                notificationInboxService.createNotification(
                        admin.getId(),
                        "SPECIMEN_REJECTED",
                        "Specimen Rejected",
                        "Technician " + technician.getName() + " rejected specimen for booking #" + rejectedBooking.getId() + " (" + reason.name() + ").",
                        "BOOKING",
                        rejectedBooking.getId()
                )
        );

        return mapToResponse(booking);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(String patientName, BookingStatus status, Pageable pageable) {
        log.info("Fetching all bookings (admin) | Filter: patientName={}, status={} | Pagination: Page={}, Size={}",
                patientName, status, pageable.getPageNumber(), pageable.getPageSize());
        
        Page<Booking> page;
        if (patientName != null && !patientName.isBlank() && status != null) {
            page = bookingRepository.findByStatusAndPatientDisplayNameContainingIgnoreCase(status, patientName, pageable);
        } else if (patientName != null && !patientName.isBlank()) {
            page = bookingRepository.findByPatientDisplayNameContainingIgnoreCase(patientName, pageable);
        } else if (status != null) {
            page = bookingRepository.findByStatus(status, pageable);
        } else {
            page = bookingRepository.findAll(pageable);
        }
        
        return page.map(this::mapToResponse);
    }

    public List<BookingResponse> getUpcomingBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByPatientId(user.getId()).stream()
            .filter(b -> b.getStatus() == BookingStatus.BOOKED || b.getStatus() == BookingStatus.CONFIRMED)
                .filter(b -> !b.getBookingDate().isBefore(LocalDate.now()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingHistory() {
        User user = getCurrentUser();
        List<BookingStatus> historyStatuses = Arrays.asList(
                BookingStatus.COMPLETED, BookingStatus.CANCELLED);
        return bookingRepository.findByPatientId(user.getId()).stream()
                .filter(b -> historyStatuses.contains(b.getStatus()) || b.getBookingDate().isBefore(LocalDate.now()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse rescheduleBooking(Long bookingId, LocalDate newDate, String newTimeSlot) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId, "Booking ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!booking.getPatient().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to reschedule this booking");
        }
        if (booking.getStatus() != BookingStatus.BOOKED && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Can only reschedule bookings in BOOKED/CONFIRMED status");
        }
        if (newDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot reschedule to a past date");
        }

        booking.setBookingDate(newDate);
        booking.setTimeSlot(newTimeSlot);
        booking = bookingRepository.save(booking);
        log.info("Booking {} rescheduled to {} at {}", bookingId, newDate, newTimeSlot);
        return mapToResponse(booking);
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /** Public accessor so co-located services can map a Booking they already loaded. */
    public BookingResponse mapToResponsePublic(Booking booking) {
        return mapToResponse(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .patientId(booking.getPatient().getId())
                .patientName(booking.getPatientDisplayName() != null ? booking.getPatientDisplayName() : booking.getPatient().getName())
                .patientEmail(booking.getPatient().getEmail())
                .patientPhone(booking.getPatient().getPhone())
                .familyMemberId(booking.getFamilyMemberId())
                .parentBookingId(booking.getParentBookingId())
                .labTestId(booking.getTest() != null ? booking.getTest().getId() : null)
                .labTestName(booking.getTest() != null ? booking.getTest().getTestName() : null)
                .packageId(booking.getTestPackage() != null ? booking.getTestPackage().getId() : null)
                .packageName(booking.getTestPackage() != null ? booking.getTestPackage().getPackageName() : null)
                .testName(booking.getTest() != null ? booking.getTest().getTestName()
                        : booking.getTestPackage() != null ? booking.getTestPackage().getPackageName() : null)
                .bookingDate(booking.getBookingDate())
                .timeSlot(booking.getTimeSlot())
                .status(booking.getStatus().name())
                .collectionType(booking.getCollectionType().name())
                .collectionAddress(booking.getCollectionAddress())
                .homeCollectionCharge(booking.getHomeCollectionCharge())
                .totalAmount(booking.getTotalAmount())
                .amount(booking.getFinalAmount())
                .discount(booking.getDiscount())
                .finalAmount(booking.getFinalAmount())
                .notes(booking.getNotes())
                .paymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus().name() : "PENDING")
                .reportAvailable(Boolean.TRUE.equals(booking.getReportAvailable()))
                .createdAt(booking.getCreatedAt())
                .technicianId(booking.getTechnician() != null ? booking.getTechnician().getId() : null)
                .technicianName(booking.getTechnician() != null ? booking.getTechnician().getName() : null)
                .assignmentType(booking.getAssignmentType() != null ? booking.getAssignmentType().name() : null)
                .cancellationReason(booking.getCancellationReason())
                .rejectionReason(booking.getRejectionReason())
                .rejectedAt(booking.getRejectedAt())
                .build();
    }
}

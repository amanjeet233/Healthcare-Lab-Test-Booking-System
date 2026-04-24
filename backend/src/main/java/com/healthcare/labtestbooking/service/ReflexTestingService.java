package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ReflexSuggestionDto;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.ReflexRule;
import com.healthcare.labtestbooking.entity.ReflexSuggestion;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.CollectionType;
import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import com.healthcare.labtestbooking.entity.enums.ReflexPriority;
import com.healthcare.labtestbooking.entity.enums.ReflexSuggestionStatus;
import com.healthcare.labtestbooking.entity.enums.TriggerCondition;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.exception.BadRequestException;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.ReflexRuleRepository;
import com.healthcare.labtestbooking.repository.ReflexSuggestionRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReflexTestingService {

    private final ReflexRuleRepository reflexRuleRepository;
    private final ReflexSuggestionRepository reflexSuggestionRepository;
    private final BookingRepository bookingRepository;
    private final LabTestRepository labTestRepository;
    private final ReportResultRepository reportResultRepository;
    private final UserRepository userRepository;
    private final NotificationInboxService notificationInboxService;
    private final AuditService auditService;

    @Transactional
    public List<ReflexSuggestionDto> evaluateReflexRules(Long bookingId, List<ReportResult> results) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        List<ReflexRule> activeRules = reflexRuleRepository.findByIsActiveTrue();
        for (ReportResult result : results) {
            String triggerName = result.getParameter() != null ? result.getParameter().getParameterName() : null;
            BigDecimal numericValue = parseNumericResult(result);
            if (triggerName == null || numericValue == null) {
                continue;
            }

            for (ReflexRule rule : activeRules) {
                if (!matchesTriggerName(triggerName, rule.getTriggerTestName())) {
                    continue;
                }
                if (!matchesCondition(numericValue, rule, result)) {
                    continue;
                }

                ReflexSuggestion suggestion = reflexSuggestionRepository
                        .findByBookingIdAndReflexRuleId(bookingId, rule.getId())
                        .orElseGet(() -> ReflexSuggestion.builder()
                                .bookingId(bookingId)
                                .reflexRuleId(rule.getId())
                                .triggeredBy(triggerName + "=" + numericValue.stripTrailingZeros().toPlainString())
                                .suggestedTest(rule.getReflexTestName())
                                .suggestedTestSlug(rule.getReflexTestSlug())
                                .priority(rule.getPriority())
                                .status(ReflexSuggestionStatus.PENDING)
                                .autoOrdered(false)
                                .build());

                if (rule.getPriority() == ReflexPriority.AUTOMATIC && !Boolean.TRUE.equals(suggestion.getAutoOrdered())) {
                    Booking reflexBooking = createReflexBooking(booking, rule, "AUTO");
                    suggestion.setStatus(ReflexSuggestionStatus.ACCEPTED);
                    suggestion.setAutoOrdered(true);
                    suggestion.setReflexBookingId(reflexBooking.getId());
                    suggestion.setActionReason("Auto ordered by reflex rule");
                    notifyReflexOrder(booking, reflexBooking, rule.getReflexTestName(), true);
                }
                reflexSuggestionRepository.save(suggestion);
            }
        }

        return getSuggestionsForBooking(bookingId, false);
    }

    @Transactional(readOnly = true)
    public List<ReflexSuggestionDto> getSuggestionsForBooking(Long bookingId, boolean evaluateIfMissing) {
        if (evaluateIfMissing) {
            List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);
            if (!results.isEmpty()) {
                evaluateReflexRules(bookingId, results);
            }
        }

        return reflexSuggestionRepository.findByBookingIdOrderByCreatedAtDesc(bookingId)
                .stream()
                .sorted(Comparator.comparing(ReflexSuggestion::getCreatedAt).reversed())
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ReflexSuggestionDto acceptSuggestion(Long suggestionId) {
        ReflexSuggestion suggestion = reflexSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reflex suggestion not found"));

        if (suggestion.getStatus() != ReflexSuggestionStatus.PENDING) {
            throw new BadRequestException("Suggestion already resolved");
        }
        if (suggestion.getPriority() == ReflexPriority.AUTOMATIC) {
            throw new BadRequestException("Automatic reflex suggestion is already handled");
        }

        ReflexRule rule = reflexRuleRepository.findById(suggestion.getReflexRuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Reflex rule not found"));
        Booking parent = bookingRepository.findById(suggestion.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        Booking reflexBooking = createReflexBooking(parent, rule, "MANUAL_ACCEPT");
        suggestion.setStatus(ReflexSuggestionStatus.ACCEPTED);
        suggestion.setReflexBookingId(reflexBooking.getId());
        suggestion.setActionReason("Accepted by medical officer");
        reflexSuggestionRepository.save(suggestion);

        notifyReflexOrder(parent, reflexBooking, suggestion.getSuggestedTest(), false);
        return toDto(suggestion);
    }

    @Transactional
    public ReflexSuggestionDto dismissSuggestion(Long suggestionId, String reason) {
        ReflexSuggestion suggestion = reflexSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Reflex suggestion not found"));

        if (suggestion.getStatus() != ReflexSuggestionStatus.PENDING) {
            throw new BadRequestException("Suggestion already resolved");
        }
        if (suggestion.getPriority() == ReflexPriority.AUTOMATIC) {
            throw new BadRequestException("Automatic reflex suggestion cannot be dismissed");
        }

        suggestion.setStatus(ReflexSuggestionStatus.DISMISSED);
        suggestion.setActionReason(reason != null && !reason.isBlank() ? reason.trim() : "Dismissed by medical officer");
        reflexSuggestionRepository.save(suggestion);
        return toDto(suggestion);
    }

    public boolean hasPendingManualSuggestions(Long bookingId) {
        return reflexSuggestionRepository.countByBookingIdAndPriorityAndStatus(
                bookingId, ReflexPriority.SUGGESTED, ReflexSuggestionStatus.PENDING) > 0;
    }

    private Booking createReflexBooking(Booking parent, ReflexRule rule, String source) {
        LabTest reflexTest = resolveReflexTest(rule);

        BigDecimal price = Optional.ofNullable(reflexTest.getPrice()).orElse(BigDecimal.ZERO);
        BigDecimal homeCharge = parent.getCollectionType() == CollectionType.HOME
                ? Optional.ofNullable(parent.getHomeCollectionCharge()).orElse(BigDecimal.ZERO)
                : BigDecimal.ZERO;
        BigDecimal total = price.add(homeCharge).setScale(2, RoundingMode.HALF_UP);

        Booking reflexBooking = Booking.builder()
                .bookingReference("RFX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT))
                .patient(parent.getPatient())
                .test(reflexTest)
                .testPackage(null)
                .bookingDate(parent.getBookingDate() != null ? parent.getBookingDate() : LocalDate.now().plusDays(1))
                .timeSlot(parent.getTimeSlot())
                .familyMemberId(parent.getFamilyMemberId())
                .patientDisplayName(parent.getPatientDisplayName())
                .status(BookingStatus.REFLEX_PENDING)
                .collectionType(parent.getCollectionType())
                .collectionAddress(parent.getCollectionAddress())
                .homeCollectionCharge(homeCharge)
                .totalAmount(total)
                .discount(BigDecimal.ZERO)
                .finalAmount(total)
                .paymentStatus(PaymentStatus.PENDING)
                .notes("Reflex order from booking #" + parent.getId() + " [" + source + "]")
                .parentBookingId(parent.getId())
                .build();

        Booking saved = bookingRepository.save(reflexBooking);

        auditService.logAction(
                null, null, null,
                "REFLEX_BOOKING_CREATED", "BOOKING", String.valueOf(saved.getId()),
                "Created reflex booking " + saved.getId() + " from parent " + parent.getId() + " for " + reflexTest.getTestName());

        return saved;
    }

    private LabTest resolveReflexTest(ReflexRule rule) {
        Optional<LabTest> bySlug = labTestRepository.findByTestCode(rule.getReflexTestSlug());
        if (bySlug.isPresent()) {
            return bySlug.get();
        }

        return labTestRepository.findByIsActiveTrue().stream()
                .filter(t -> t.getTestName() != null && t.getTestName().equalsIgnoreCase(rule.getReflexTestName()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reflex test not found for slug/name: " + rule.getReflexTestSlug() + " / " + rule.getReflexTestName()));
    }

    private boolean matchesTriggerName(String resultParamName, String ruleTriggerName) {
        return resultParamName != null
                && ruleTriggerName != null
                && resultParamName.trim().equalsIgnoreCase(ruleTriggerName.trim());
    }

    private boolean matchesCondition(BigDecimal value, ReflexRule rule, ReportResult result) {
        BigDecimal trigger = Optional.ofNullable(rule.getTriggerValue()).orElse(BigDecimal.ZERO);
        return switch (rule.getTriggerCondition()) {
            case GREATER_THAN -> value.compareTo(trigger) >= 0;
            case LESS_THAN -> value.compareTo(trigger) <= 0;
            case EQUALS -> value.compareTo(trigger) == 0;
            case OUT_OF_RANGE -> isOutOfRange(value, result);
        };
    }

    private boolean isOutOfRange(BigDecimal value, ReportResult result) {
        BigDecimal min = result.getNormalRangeMin();
        BigDecimal max = result.getNormalRangeMax();
        if (min != null && value.compareTo(min) < 0) {
            return true;
        }
        if (max != null && value.compareTo(max) > 0) {
            return true;
        }
        return Boolean.TRUE.equals(result.getIsAbnormal());
    }

    private BigDecimal parseNumericResult(ReportResult result) {
        String raw = (result.getResultValue() != null && !result.getResultValue().isBlank())
                ? result.getResultValue()
                : result.getValue();
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String normalized = raw.replaceAll("[^0-9.+-]", "");
        if (normalized.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(normalized);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private void notifyReflexOrder(Booking parent, Booking reflexBooking, String reflexTestName, boolean automatic) {
        if (parent.getPatient() != null) {
            notificationInboxService.createNotification(
                    parent.getPatient().getId(),
                    "REFLEX_TEST",
                    automatic ? "Automatic Reflex Test Ordered" : "Reflex Test Ordered",
                    "Follow-up test ordered: " + reflexTestName + " (Booking #" + reflexBooking.getId() + ")",
                    "BOOKING",
                    reflexBooking.getId());
        }

        List<User> admins = userRepository.findByRoleAndIsActiveTrue(UserRole.ADMIN);
        for (User admin : admins) {
            notificationInboxService.createNotification(
                    admin.getId(),
                    "REFLEX_TEST",
                    "Reflex Booking Created",
                    "Reflex booking #" + reflexBooking.getId() + " created from booking #" + parent.getId() +
                            " for test " + reflexTestName,
                    "BOOKING",
                    reflexBooking.getId());
        }
    }

    private ReflexSuggestionDto toDto(ReflexSuggestion suggestion) {
        return ReflexSuggestionDto.builder()
                .id(suggestion.getId())
                .bookingId(suggestion.getBookingId())
                .triggeredBy(suggestion.getTriggeredBy())
                .suggestedTest(suggestion.getSuggestedTest())
                .suggestedTestSlug(suggestion.getSuggestedTestSlug())
                .priority(suggestion.getPriority())
                .status(suggestion.getStatus())
                .autoOrdered(suggestion.getAutoOrdered())
                .reflexBookingId(suggestion.getReflexBookingId())
                .actionReason(suggestion.getActionReason())
                .createdAt(suggestion.getCreatedAt())
                .build();
    }
}

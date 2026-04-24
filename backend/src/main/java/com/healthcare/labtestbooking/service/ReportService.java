package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ReportResultDTO;
import com.healthcare.labtestbooking.dto.ReportResultRequest;
import com.healthcare.labtestbooking.dto.PatientReportItemDto;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.exception.BadRequestException;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.TestParameterRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportShare;
import com.healthcare.labtestbooking.repository.ReportShareRepository;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.EntityManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final TestParameterRepository testParameterRepository;
    private final ReportResultRepository reportResultRepository;
    private final ReportRepository reportRepository;
    private final ReportShareRepository reportShareRepository;
    private final BookingService bookingService;
    private final ReportVerificationRepository reportVerificationRepository;
    private final ReportGeneratorService reportGeneratorService;
    private final LabTestRepository labTestRepository;
    @PersistenceContext
    private EntityManager entityManager;

    private static final String CONTENT_TYPE_PDF = "application/pdf";
    private static final Set<BookingStatus> PATIENT_REPORT_VISIBLE_STATUSES = EnumSet.of(
            BookingStatus.PENDING_VERIFICATION, BookingStatus.VERIFIED, BookingStatus.COMPLETED);

    @Transactional
    public Report uploadReport(Long bookingId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Report file is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (reportRepository.findByBookingId(bookingId).isPresent()) {
            throw new BadRequestException("Report already uploaded for this booking");
        }

        if (booking.getStatus() != BookingStatus.PROCESSING) {
            throw new BadRequestException("Report upload is only allowed when booking is in PROCESSING status");
        }

        if (!isSupportedReportFile(file)) {
            throw new BadRequestException("Unsupported file type. Only PDF and images are allowed");
        }

        try {
            Report report = new Report();
            report.setBooking(booking);
            report.setReportPdf(file.getBytes());
            report.setGeneratedDate(LocalDateTime.now());
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "report.bin";
            report.setReportPdfPath("uploaded_report_" + bookingId + "_" + originalName.replaceAll("[^a-zA-Z0-9._-]", "_"));
            report.setStatus(com.healthcare.labtestbooking.entity.enums.ReportStatus.DRAFT);
            Report savedReport = reportRepository.save(report);

            bookingService.updateBookingStatus(bookingId, BookingStatus.PENDING_VERIFICATION);

            com.healthcare.labtestbooking.entity.ReportVerification rv = new com.healthcare.labtestbooking.entity.ReportVerification();
            rv.setBooking(booking);
            rv.setStatus(com.healthcare.labtestbooking.entity.enums.VerificationStatus.PENDING);
            reportVerificationRepository.save(rv);

            return savedReport;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    private boolean isSupportedReportFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null) {
            String normalized = contentType.toLowerCase(Locale.ROOT);
            if (CONTENT_TYPE_PDF.equals(normalized) || normalized.startsWith("image/")) {
                return true;
            }
        }

        String filename = file.getOriginalFilename();
        if (filename == null) return false;
        String lower = filename.toLowerCase(Locale.ROOT);
        return lower.endsWith(".pdf") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp");
    }

    @Transactional
    public void verifyReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setVerifiedBy(getCurrentUser().getEmail());
        report.setGeneratedDate(LocalDateTime.now());
        reportRepository.save(report);
    }

    public Page<ReportResultDTO> getMyReports(Pageable pageable) {
        User patient = getCurrentUser();
        List<Booking> patientBookings = bookingRepository.findByPatientId(patient.getId());

        List<ReportResultDTO> allReports = new ArrayList<>();
        for (Booking booking : patientBookings) {
            try {
                allReports.add(getReportByBookingId(booking.getId()));
            } catch (Exception e) {
                // Skip bookings without reports
            }
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allReports.size());

        List<ReportResultDTO> pagedContent = allReports.subList(start, end);
        return new PageImpl<>(pagedContent, pageable, allReports.size());
    }

    public List<PatientReportItemDto> getMyPatientReports() {
        User patient = getCurrentUser();
        List<Report> reports = reportRepository.findByBookingPatientId(patient.getId());

        return reports.stream()
                .filter(report -> report.getBooking() != null)
                .filter(report -> PATIENT_REPORT_VISIBLE_STATUSES.contains(report.getBooking().getStatus()))
                .sorted(Comparator
                        .comparing(Report::getVerifiedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Report::getGeneratedDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toPatientReportItem)
                .collect(Collectors.toList());
    }

    @Transactional
    public Report getDownloadableReportByBooking(Long bookingId) {
        User currentUser = getCurrentUser();
        Report report = reportRepository.findDetailedByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        if (currentUser.getRole() == UserRole.PATIENT) {
            boolean isOwner = report.getBooking() != null
                    && report.getBooking().getPatient() != null
                    && report.getBooking().getPatient().getId().equals(currentUser.getId());
            if (!isOwner) throw new ResourceNotFoundException("Report not found");
        }

        if (report.getReportPdf() == null || report.getReportPdf().length == 0) {
            log.info("Report PDF missing for booking {}. Generating on-the-fly.", bookingId);
            try {
                byte[] generatedPdf = reportGeneratorService.generatePdfReport(report.getId());
                if (generatedPdf != null && generatedPdf.length > 0) {
                    // Keep generated bytes in-memory for this response only.
                    // Some deployments have small report_pdf column size, which can fail on flush.
                    entityManager.detach(report);
                    report.setReportPdf(generatedPdf);
                    report.setGeneratedDate(LocalDateTime.now());
                } else {
                    throw new ResourceNotFoundException("Failed to generate report file");
                }
            } catch (Exception e) {
                log.error("Error generating report on-the-fly for booking {}: {}", bookingId, e.getMessage());
                throw new ResourceNotFoundException("Report file not yet available");
            }
        }

        return report;
    }

    @Transactional
    public void shareReport(Long reportId, String email, String accessType) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        ReportShare share = ReportShare.builder()
                .report(report)
                .sharedWithEmail(email)
                .accessType(accessType)
                .build();

        reportShareRepository.save(share);
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private PatientReportItemDto toPatientReportItem(Report report) {
        Booking booking = report.getBooking();
        String testName = booking.getTest() != null
                ? booking.getTest().getTestName()
                : booking.getTestPackage() != null
                ? booking.getTestPackage().getPackageName()
                : "Lab Report";

        return PatientReportItemDto.builder()
                .bookingId(booking.getId())
                .testName(testName)
                .bookingDate(booking.getBookingDate())
                .reportDate(report.getVerifiedAt())
                .status(booking.getStatus().name())
                .downloadUrl("/api/reports/" + booking.getId() + "/download")
                .verifiedByName(report.getVerifiedBy())
                .build();
    }

    @Transactional
    public ReportResultDTO enterReportResults(ReportResultRequest request) {
        log.info("Entering report results for booking ID: {}", request.getBookingId());
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + request.getBookingId()));

        User technician = getCurrentUser();
        if (booking.getTechnician() == null) {
            booking.setTechnician(technician);
            bookingRepository.save(booking);
        }

        List<ReportResult> savedResults = new ArrayList<>();
        for (ReportResultRequest.ResultItem item : request.getResults()) {
            TestParameter parameter = testParameterRepository.findById(item.getParameterId())
                    .orElseThrow(() -> new RuntimeException("Parameter not found with id: " + item.getParameterId()));

            ReportResult result = reportResultRepository
                    .findByBookingIdAndParameterId(booking.getId(), parameter.getId())
                    .orElseGet(() -> {
                        ReportResult newResult = new ReportResult();
                        newResult.setBooking(booking);
                        newResult.setParameter(parameter);
                        return newResult;
                    });
            result.setResultValue(item.getResultValue());
            result.setUnit(item.getUnit());
            result.setNormalRange(item.getNormalRange());
            result.setNotes(item.getNotes());

            AbnormalStatus status = calculateAbnormalStatus(parameter, item.getResultValue());
            result.setAbnormalStatus(status);
            result.setIsAbnormal(status != null && status != AbnormalStatus.NORMAL);
            result.setIsCritical(status == AbnormalStatus.CRITICAL_LOW || status == AbnormalStatus.CRITICAL_HIGH);

            savedResults.add(reportResultRepository.save(result));
        }

        return convertToDTO(savedResults, booking, technician);
    }

    public ReportResultDTO getReportByBookingId(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == UserRole.PATIENT) {
            if (booking.getPatient() == null || !booking.getPatient().getId().equals(currentUser.getId())) {
                log.warn("Security Alert: User {} attempted to access report for booking {} owned by someone else", 
                    currentUser.getEmail(), bookingId);
                throw new ResourceNotFoundException("Report not found");
            }
        }

        List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);
        if (results.isEmpty()) {
            log.info("No report results found for booking id: {}. Returning empty DTO.", bookingId);
            ReportResultDTO emptyDto = new ReportResultDTO();
            emptyDto.setBookingId(bookingId);
            emptyDto.setResults(new ArrayList<>());
            emptyDto.setSubmittedAt(null);
            return emptyDto;
        }

        User technician = booking.getTechnician();
        return convertToDTO(results, booking, technician);
    }

    @Transactional(readOnly = true)
    public List<TestParameter> getParametersForBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getTest() != null) {
            log.info("Fetching parameters for single test: {} (ID: {})", booking.getTest().getTestName(), booking.getTest().getId());
            return testParameterRepository.findByTest_IdOrderByDisplayOrder(booking.getTest().getId());
        }

        if (booking.getTestPackage() != null) {
            List<LabTest> tests = booking.getTestPackage().getTests();
            log.info("Fetching parameters for package: {} (ID: {}). Tests found: {}", 
                booking.getTestPackage().getPackageName(), booking.getTestPackage().getId(), 
                tests != null ? tests.size() : 0);
            
            if ((tests == null || tests.isEmpty()) && 
                booking.getTestPackage().getIncludedTestNames() != null && 
                !booking.getTestPackage().getIncludedTestNames().isEmpty()) {
                
                log.warn("Package tests list is empty. Attempting name-based lookup fallback for: {}", 
                    booking.getTestPackage().getIncludedTestNames());
                
                tests = new ArrayList<>();
                for (String testName : booking.getTestPackage().getIncludedTestNames()) {
                    // Try exact match first
                    List<LabTest> found = labTestRepository.findByTestNameContainingIgnoreCaseAndIsActiveTrue(testName);
                    if (!found.isEmpty()) {
                        // Find the closest match
                        LabTest bestMatch = found.stream()
                            .filter(t -> t.getTestName().equalsIgnoreCase(testName))
                            .findFirst()
                            .orElse(found.get(0));
                        tests.add(bestMatch);
                        log.info("Resolved test '{}' to ID: {}", testName, bestMatch.getId());
                    } else {
                        log.warn("Could not resolve test by name: {}", testName);
                    }
                }
            }
            
            if (tests == null || tests.isEmpty()) {
                log.warn("No tests resolved for package ID: {}", booking.getTestPackage().getId());
                return List.of();
            }

            Map<Long, TestParameter> deduped = new LinkedHashMap<>();
            for (LabTest test : tests) {
                if (test == null || test.getId() == null) continue;
                List<TestParameter> params = testParameterRepository.findByTest_IdOrderByDisplayOrder(test.getId());
                log.info("Test '{}' (ID: {}) has {} parameters", test.getTestName(), test.getId(), params.size());
                for (TestParameter param : params) {
                    if (param != null && param.getId() != null) {
                        deduped.putIfAbsent(param.getId(), param);
                    }
                }
            }
            return new ArrayList<>(deduped.values());
        }

        return List.of();
    }

    private AbnormalStatus calculateAbnormalStatus(TestParameter parameter, String resultValueStr) {
        if (resultValueStr == null || resultValueStr.isEmpty()) return AbnormalStatus.NORMAL;
        try {
            BigDecimal resultValue = new BigDecimal(resultValueStr);
            if (parameter.getCriticalLow() != null && resultValue.compareTo(parameter.getCriticalLow()) < 0) return AbnormalStatus.CRITICAL_LOW;
            if (parameter.getCriticalHigh() != null && resultValue.compareTo(parameter.getCriticalHigh()) > 0) return AbnormalStatus.CRITICAL_HIGH;
            if (parameter.getNormalRangeMin() != null && resultValue.compareTo(parameter.getNormalRangeMin()) < 0) return AbnormalStatus.LOW;
            if (parameter.getNormalRangeMax() != null && resultValue.compareTo(parameter.getNormalRangeMax()) > 0) return AbnormalStatus.HIGH;
            return AbnormalStatus.NORMAL;
        } catch (NumberFormatException e) {
            return AbnormalStatus.NORMAL;
        }
    }

    private ReportResultDTO convertToDTO(List<ReportResult> results, Booking booking, User technician) {
        ReportResultDTO dto = new ReportResultDTO();
        dto.setBookingId(booking.getId());
        dto.setTechnicianId(technician != null ? technician.getId() : null);
        dto.setSubmittedAt(LocalDateTime.now());
        dto.setResults(results.stream().map(this::convertToItemDTO).collect(Collectors.toList()));
        return dto;
    }

    private ReportResultDTO.ResultItemDTO convertToItemDTO(ReportResult result) {
        ReportResultDTO.ResultItemDTO itemDTO = new ReportResultDTO.ResultItemDTO();
        itemDTO.setId(result.getId());
        itemDTO.setParameterId(result.getParameter().getId());
        itemDTO.setParameterName(result.getParameter().getParameterName());
        itemDTO.setResultValue(result.getResultValue());
        itemDTO.setUnit(result.getUnit());
        String normalRange = "";
        if (result.getParameter().getNormalRangeMin() != null && result.getParameter().getNormalRangeMax() != null) {
            normalRange = result.getParameter().getNormalRangeMin() + " - " + result.getParameter().getNormalRangeMax();
        }
        itemDTO.setNormalRange(normalRange);
        itemDTO.setAbnormalStatus(result.getAbnormalStatus() != null ? result.getAbnormalStatus().name() : null);
        itemDTO.setIsAbnormal(result.getIsAbnormal());
        itemDTO.setIsCritical(result.getIsCritical());
        return itemDTO;
    }

    public List<Map<String, Object>> getTrendsForPatient(Long patientId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == UserRole.PATIENT && !currentUser.getId().equals(patientId)) {
            log.warn("Security Alert: User {} attempted to access trends for patient ID {}", 
                currentUser.getEmail(), patientId);
            throw new ResourceNotFoundException("Patient not found");
        }
        
        Map<String, List<Map<String, Object>>> paramTrends = new HashMap<>();

        List<ReportResultRepository.TrendResultRow> trendRows =
                reportResultRepository.findTrendRowsByPatientIdAndStatusIn(
                        patientId,
                        EnumSet.of(BookingStatus.COMPLETED, BookingStatus.VERIFIED));

        for (ReportResultRepository.TrendResultRow row : trendRows) {
            try {
                BigDecimal value = new BigDecimal(row.getResultValue());
                String parameterName = row.getParameterName();
                String date = row.getBookingDate() != null
                        ? row.getBookingDate().toString()
                        : row.getBookingCreatedAt().toLocalDate().toString();

                paramTrends.computeIfAbsent(parameterName, key -> new ArrayList<>())
                        .add(Map.of(
                                "date", date,
                                "value", value,
                                "unit", row.getUnit()
                        ));
            } catch (NumberFormatException ignored) {
                // Ignore non-numeric values for trend graphs.
            }
        }
        
        return paramTrends.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> trend = new HashMap<>();
                    trend.put("parameter", entry.getKey());
                    trend.put("data", entry.getValue().stream().sorted(Comparator.comparing(m -> m.get("date").toString())).collect(Collectors.toList()));
                    return trend;
                }).collect(Collectors.toList());
    }
}

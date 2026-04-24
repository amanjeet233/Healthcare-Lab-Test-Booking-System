package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.ShareReportRequest;
import com.healthcare.labtestbooking.dto.UserReportSummaryDTO;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.service.ReportGeneratorService;
import com.healthcare.labtestbooking.service.ReportService;
import com.healthcare.labtestbooking.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
public class UserReportsController {

    private final UserService userService;
    private final BookingRepository bookingRepository;
    private final ReportRepository reportRepository;
    private final ReportService reportService;
    private final ReportGeneratorService reportGeneratorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserReportSummaryDTO>>> getUserReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        Long userId = userService.getCurrentUserId();
        List<Booking> bookings = bookingRepository.findByPatientId(userId, PageRequest.of(0, Math.max(1, limit + offset))).getContent();
        List<Long> bookingIds = bookings.stream()
                .map(Booking::getId)
                .collect(Collectors.toList());

        java.util.Map<Long, Report> reportByBookingId = (bookingIds.isEmpty() ? List.<Report>of() : reportRepository.findByBookingIdIn(bookingIds)).stream()
                .filter(report -> report.getBooking() != null && report.getBooking().getId() != null)
                .collect(Collectors.toMap(
                        report -> report.getBooking().getId(),
                        report -> report,
                        (first, second) -> {
                            LocalDateTime firstGeneratedAt = first.getGeneratedDate();
                            LocalDateTime secondGeneratedAt = second.getGeneratedDate();
                            if (firstGeneratedAt == null) return second;
                            if (secondGeneratedAt == null) return first;
                            return secondGeneratedAt.isAfter(firstGeneratedAt) ? second : first;
                        }
                ));

        List<UserReportSummaryDTO> list = bookings.stream()
                .map(booking -> toReportSummary(booking, reportByBookingId.get(booking.getId())))
                .sorted(Comparator.comparing(UserReportSummaryDTO::getGeneratedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(UserReportSummaryDTO::getBookingId, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        if (status != null && !status.isBlank()) {
            String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
            list = list.stream()
                    .filter(item -> item.getStatus() != null && item.getStatus().equalsIgnoreCase(normalizedStatus))
                    .collect(Collectors.toList());
        }

        int start = Math.min(offset, list.size());
        int end = Math.min(start + Math.max(1, limit), list.size());
        List<UserReportSummaryDTO> paged = list.subList(start, end);

        return ResponseEntity.ok(ApiResponse.successPaginated(
                "Reports fetched successfully",
                paged,
                (long) list.size(),
                (int) Math.ceil((double) list.size() / Math.max(1, limit)),
                (limit == 0 ? 0 : (offset / limit))
        ));
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<UserReportSummaryDTO>> getReportById(@PathVariable Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        Long currentUserId = userService.getCurrentUserId();
        if (report.getBooking() == null || report.getBooking().getPatient() == null ||
                !report.getBooking().getPatient().getId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized access to report");
        }

        return ResponseEntity.ok(ApiResponse.success("Report fetched successfully", toReportSummary(report.getBooking(), report)));
    }

    @GetMapping("/{reportId}/pdf")
    public ResponseEntity<byte[]> getReportPdf(@PathVariable Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Report not found"));
        
        Long currentUserId = userService.getCurrentUserId();
        if (report.getBooking() == null || report.getBooking().getPatient() == null ||
                !report.getBooking().getPatient().getId().equals(currentUserId)) {
            throw new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Report not found");
        }

        byte[] pdf = reportGeneratorService.generatePdfReport(reportId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report-" + reportId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/{reportId}/share")
    public ResponseEntity<ApiResponse<Void>> shareReport(
            @PathVariable Long reportId,
            @Valid @RequestBody ShareReportRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Report not found"));
        
        Long currentUserId = userService.getCurrentUserId();
        if (report.getBooking() == null || report.getBooking().getPatient() == null ||
                !report.getBooking().getPatient().getId().equals(currentUserId)) {
            throw new com.healthcare.labtestbooking.exception.ResourceNotFoundException("Report not found");
        }

        reportService.shareReport(reportId, request.getEmail(), request.getAccessType());
        return ResponseEntity.ok(ApiResponse.success("Report shared successfully", null));
    }

    @GetMapping("/trends")
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> getTrends() {
        Long userId = userService.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Trend data fetched successfully", reportService.getTrendsForPatient(userId)));
    }

    private UserReportSummaryDTO toReportSummary(Booking booking, Report report) {
        String reportStatus;
        if (report != null) {
            reportStatus = "READY";
        } else if (booking.getStatus() == BookingStatus.SAMPLE_COLLECTED || booking.getStatus() == BookingStatus.PROCESSING) {
            reportStatus = "PROCESSING";
        } else {
            reportStatus = "PENDING";
        }

        return UserReportSummaryDTO.builder()
                .reportId(report != null ? report.getId() : null)
                .bookingId(booking.getId())
                .reportNumber(booking.getBookingReference())
                .testName(booking.getTest() != null ? booking.getTest().getTestName() : "Lab Test")
                .packageName(booking.getTestPackage() != null ? booking.getTestPackage().getPackageName() : null)
                .status(reportStatus)
                .generatedAt(report != null ? report.getGeneratedDate() : null)
                .estimatedReadyAt(estimateReadyAt(booking))
                .build();
    }

    private LocalDateTime estimateReadyAt(Booking booking) {
        if (booking.getCreatedAt() == null) {
            return null;
        }
        if (booking.getStatus() == BookingStatus.PROCESSING) {
            return booking.getCreatedAt().plusHours(24);
        }
        if (booking.getStatus() == BookingStatus.BOOKED) {
            return booking.getCreatedAt().plusHours(48);
        }
        return null;
    }
}

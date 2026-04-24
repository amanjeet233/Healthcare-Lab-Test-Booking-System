package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfReportService {

    private final BookingRepository bookingRepository;
    private final ReportRepository reportRepository;
    private final ReportGeneratorService reportGeneratorService;
    private final NotificationService notificationService;
    private final java.util.concurrent.Executor taskExecutor;

    @Value("${app.report.pdf.directory:uploads/generated-reports}")
    private String pdfDirectory;

    public void generateReport(Long bookingId) {
        // Run PDF Generation asynchronously so it doesn't block MO verification request.
        CompletableFuture.runAsync(() -> {
            try {
                generateAndSaveReportSync(bookingId);
            } catch (Exception e) {
                log.error("Error generating Smart PDF report asynchronously for bookingId: {}", bookingId, e);
            }
        });
    }

    public void generateReportAsync(Long bookingId) {
        CompletableFuture.runAsync(() -> {
            try {
                Report report = reportRepository.findByBookingId(bookingId)
                        .orElseThrow(() -> new RuntimeException("Report not found for booking: " + bookingId));
                
                reportGeneratorService.generatePdfReport(report.getId());
                
                // Delivery Excellence: Notify Patient
                if (report.getPatient() != null) {
                    notificationService.sendReportReadyNotification(report.getPatient(), report.getBooking());
                }
            } catch (Exception e) {
                log.error("Failed to generate report for booking {}: {}", bookingId, e.getMessage());
            }
        }, taskExecutor);
    }

    @Transactional
    public void regenerateReportAsync(Long bookingId) {
        log.info("Regenerating report for booking ID: {}", bookingId);
        Report report = reportRepository.findByBookingId(bookingId).orElse(null);
        if (report != null) {
            report.setReportPdf(null); // Clear existing
            reportRepository.save(report);
            generateReportAsync(bookingId);
        }
    }

    @Transactional
    public void generateAndSaveReportSync(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        Report report = reportRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Report not found for booking id: " + bookingId));

        // Generate the premium Smart Report via the new generator
        byte[] pdfBytes = reportGeneratorService.generatePdfReport(report.getId());
        
        String fileName = buildFilename(bookingId);
        String savedPath = persistPdf(fileName, pdfBytes);

        report.setReportPdf(pdfBytes);
        report.setReportPdfPath(savedPath);
        report.setGeneratedDate(LocalDateTime.now());
        reportRepository.save(report);
        log.info("Smart PDF report generated successfully for reportId: {}", report.getId());
    }

    private String buildFilename(Long bookingId) {
        return "smart-report-booking-" + bookingId + ".pdf";
    }

    private String persistPdf(String fileName, byte[] bytes) {
        try {
            Path directory = Paths.get(pdfDirectory);
            Files.createDirectories(directory);
            Path target = directory.resolve(fileName);
            Files.write(target, bytes);
            return target.toString();
        } catch (Exception ex) {
            log.warn("Failed to persist generated PDF file to disk: {}", ex.getMessage());
            return fileName;
        }
    }
}


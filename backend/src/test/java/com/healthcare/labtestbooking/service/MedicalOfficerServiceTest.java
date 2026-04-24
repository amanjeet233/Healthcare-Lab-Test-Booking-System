package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ReportVerificationRequest;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.ReportStatus;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.entity.enums.VerificationStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicalOfficerServiceTest {

    @Mock
    private ReportVerificationRepository reportVerificationRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private ReportRepository reportRepository;
    @Mock
    private ReportResultRepository reportResultRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BookingService bookingService;
    @Mock
    private AuditService auditService;
    @Mock
    private NotificationInboxService notificationInboxService;
    @Mock
    private PdfReportService pdfReportService;
    @Mock
    private ReflexTestingService reflexTestingService;
    @Mock
    private AIAnalysisService aiAnalysisService;

    @InjectMocks
    private MedicalOfficerService medicalOfficerService;

    @Test
    void verifyReport_UpdatesBookingAndReportMetadata() {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setStatus(BookingStatus.PENDING_VERIFICATION);
        booking.setBookingDate(LocalDate.now());

        User mo = new User();
        mo.setId(2L);
        mo.setName("Dr. Mehta");
        mo.setEmail("mo@test.com");
        mo.setRole(UserRole.MEDICAL_OFFICER);

        Report report = new Report();
        report.setId(10L);
        report.setBooking(booking);
        report.setStatus(ReportStatus.DRAFT);

        ReportVerification existingVerification = ReportVerification.builder()
                .booking(booking)
                .status(VerificationStatus.PENDING)
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(reportResultRepository.findByBookingId(1L)).thenReturn(List.of(new ReportResult()));
        when(reportVerificationRepository.findByBookingId(1L)).thenReturn(Optional.of(existingVerification));
        when(reportVerificationRepository.save(any(ReportVerification.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reportRepository.findByBookingId(1L)).thenReturn(Optional.of(report));
        when(reportRepository.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findByEmail("mo@test.com")).thenReturn(Optional.of(mo));
        when(reflexTestingService.hasPendingManualSuggestions(1L)).thenReturn(false);

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("mo@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            ReportVerificationRequest request = new ReportVerificationRequest();
            request.setClinicalNotes("Approved by MO");
            medicalOfficerService.verifyReport(1L, request);
        }

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.VERIFIED);
        assertThat(booking.getReportAvailable()).isTrue();
        assertThat(report.getVerifiedBy()).isEqualTo("Dr. Mehta");
        assertThat(report.getVerifiedAt()).isNotNull();
        assertThat(report.getStatus()).isEqualTo(ReportStatus.VERIFIED);

        verify(bookingService).validateStatusTransition(BookingStatus.PENDING_VERIFICATION, BookingStatus.VERIFIED);
        verify(pdfReportService).generateReport(1L);
        verify(aiAnalysisService).analyzeReport(1L);
        verify(reportRepository).save(report);
        verify(bookingRepository).save(booking);
    }
}

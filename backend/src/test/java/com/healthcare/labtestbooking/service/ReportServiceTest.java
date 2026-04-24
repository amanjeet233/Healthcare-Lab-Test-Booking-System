package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ReportResultDTO;
import com.healthcare.labtestbooking.dto.ReportResultRequest;
import com.healthcare.labtestbooking.entity.*;
import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.entity.enums.VerificationStatus;
import com.healthcare.labtestbooking.exception.BadRequestException;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TestParameterRepository testParameterRepository;

    @Mock
    private ReportResultRepository reportResultRepository;

    @Mock
    private HealthScoreRepository healthScoreRepository;

    @Mock
    private RecommendationRepository recommendationRepository;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private ReportShareRepository reportShareRepository;

    @Mock
    private BookingService bookingService;

    @Mock
    private ReportVerificationRepository reportVerificationRepository;

    @InjectMocks
    private ReportService reportService;

    private Booking booking;
    private User technician;
    private User patient;
    private TestParameter parameter;
    private ReportResult reportResult;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setId(1L);
        patient.setName("Test Patient");

        technician = new User();
        technician.setId(2L);
        technician.setName("Test Technician");
        technician.setEmail("tech@test.com");
        technician.setRole(UserRole.TECHNICIAN);

        booking = new Booking();
        booking.setId(1L);
        booking.setPatient(patient);
        booking.setTechnician(technician);
        booking.setStatus(BookingStatus.PROCESSING);

        parameter = new TestParameter();
        parameter.setId(1L);
        parameter.setParameterName("Glucose");
        parameter.setNormalRangeMin(new BigDecimal("70"));
        parameter.setNormalRangeMax(new BigDecimal("140"));
        parameter.setCriticalLow(new BigDecimal("50"));
        parameter.setCriticalHigh(new BigDecimal("300"));

        reportResult = new ReportResult();
        reportResult.setId(1L);
        reportResult.setBooking(booking);
        reportResult.setParameter(parameter);
        reportResult.setResultValue("100");
        reportResult.setAbnormalStatus(AbnormalStatus.NORMAL);
        reportResult.setIsAbnormal(false);
        reportResult.setIsCritical(false);
    }

    @Test
    void enterReportResults_Success() {
        // Given
        ReportResultRequest request = ReportResultRequest.builder()
                .bookingId(1L)
                .technicianId(2L)
                .results(List.of(
                        ReportResultRequest.ResultItem.builder()
                                .parameterId(1L)
                                .resultValue("100")
                                .unit("mg/dL")
                                .notes("Normal range")
                                .build()))
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.of(technician));
        when(testParameterRepository.findById(1L)).thenReturn(Optional.of(parameter));
        when(reportResultRepository.findByBookingIdAndParameterId(1L, 1L)).thenReturn(Optional.empty());
        when(reportResultRepository.save(any(ReportResult.class))).thenReturn(reportResult);

        // Mock SecurityContext
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        when(userDetails.getUsername()).thenReturn("tech@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When
            ReportResultDTO result = reportService.enterReportResults(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getBookingId()).isEqualTo(1L);
            assertThat(result.getTechnicianId()).isEqualTo(2L);
            assertThat(result.getResults()).hasSize(1);
        }
    }

    @Test
    void enterReportResults_ExistingResult_UpdatesInsteadOfInsert() {
        // Given
        ReportResultRequest request = ReportResultRequest.builder()
                .bookingId(1L)
                .technicianId(2L)
                .results(List.of(
                        ReportResultRequest.ResultItem.builder()
                                .parameterId(1L)
                                .resultValue("180")
                                .unit("mg/dL")
                                .notes("Updated value")
                                .build()))
                .build();

        ReportResult existingResult = new ReportResult();
        existingResult.setId(99L);
        existingResult.setBooking(booking);
        existingResult.setParameter(parameter);
        existingResult.setResultValue("100");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.of(technician));
        when(testParameterRepository.findById(1L)).thenReturn(Optional.of(parameter));
        when(reportResultRepository.findByBookingIdAndParameterId(1L, 1L)).thenReturn(Optional.of(existingResult));
        when(reportResultRepository.save(any(ReportResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Mock SecurityContext
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("tech@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When
            ReportResultDTO result = reportService.enterReportResults(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getResults()).hasSize(1);
            assertThat(result.getResults().get(0).getId()).isEqualTo(99L);
            assertThat(result.getResults().get(0).getResultValue()).isEqualTo("180");
            verify(reportResultRepository).findByBookingIdAndParameterId(1L, 1L);
            verify(reportResultRepository).save(existingResult);
        }
    }

    @Test
    void enterReportResults_BookingNotFound_ThrowsException() {
        // Given
        ReportResultRequest request = ReportResultRequest.builder()
                .bookingId(999L)
                .technicianId(2L)
                .results(List.of())
                .build();

        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            reportService.enterReportResults(request);
        });
    }

    @Test
    void getReportByBookingId_Success() {
        // Given
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("tech@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.of(technician));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(reportResultRepository.findByBookingId(1L)).thenReturn(List.of(reportResult));

        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When
            ReportResultDTO result = reportService.getReportByBookingId(1L);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getBookingId()).isEqualTo(1L);
            assertThat(result.getResults()).hasSize(1);
        }
    }

    @Test
    void getReportByBookingId_NotFound_ThrowsException() {
        // Given
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            reportService.getReportByBookingId(999L);
        });
    }

    @Test
    void getReportByBookingId_NoResults_ThrowsException() {
        // Given
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("tech@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.of(technician));
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(reportResultRepository.findByBookingId(1L)).thenReturn(List.of());

        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When/Then
            assertThrows(RuntimeException.class, () -> {
                reportService.getReportByBookingId(1L);
            });
        }
    }

    @Test
    void uploadReport_Success_ProcessingBooking() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", "dummy-pdf-content".getBytes());
        Report saved = new Report();
        saved.setId(11L);
        saved.setBooking(booking);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(reportRepository.findByBookingId(1L)).thenReturn(Optional.empty());
        when(reportRepository.save(any(Report.class))).thenReturn(saved);

        // When
        Report result = reportService.uploadReport(1L, file);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(11L);
        verify(bookingService).updateBookingStatus(1L, BookingStatus.PENDING_VERIFICATION);
        verify(reportVerificationRepository).save(argThat(rv ->
                rv.getBooking() != null
                        && rv.getBooking().getId().equals(1L)
                        && rv.getStatus() == VerificationStatus.PENDING));
    }

    @Test
    void uploadReport_Fails_WhenStatusNotProcessing() {
        // Given
        booking.setStatus(BookingStatus.BOOKED);
        MockMultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", "dummy".getBytes());
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(reportRepository.findByBookingId(1L)).thenReturn(Optional.empty());

        // When / Then
        assertThrows(BadRequestException.class, () -> reportService.uploadReport(1L, file));
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void uploadReport_Fails_WhenFileTypeInvalid() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "report.txt", "text/plain", "dummy".getBytes());
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(reportRepository.findByBookingId(1L)).thenReturn(Optional.empty());

        // When / Then
        assertThrows(BadRequestException.class, () -> reportService.uploadReport(1L, file));
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void uploadReport_Fails_WhenReportAlreadyExists() {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", "dummy".getBytes());
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(reportRepository.findByBookingId(1L)).thenReturn(Optional.of(new Report()));

        // When / Then
        assertThrows(BadRequestException.class, () -> reportService.uploadReport(1L, file));
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void getMyPatientReports_ReturnsOnlyVisibleStatuses() {
        // Given
        patient.setEmail("patient@test.com");
        patient.setRole(UserRole.PATIENT);

        Booking visibleBooking = new Booking();
        visibleBooking.setId(11L);
        visibleBooking.setStatus(BookingStatus.VERIFIED);
        visibleBooking.setPatient(patient);
        visibleBooking.setBookingDate(java.time.LocalDate.now());

        Booking hiddenBooking = new Booking();
        hiddenBooking.setId(12L);
        hiddenBooking.setStatus(BookingStatus.PROCESSING);
        hiddenBooking.setPatient(patient);
        hiddenBooking.setBookingDate(java.time.LocalDate.now());

        Report visibleReport = new Report();
        visibleReport.setBooking(visibleBooking);
        visibleReport.setVerifiedBy("Dr. A");
        visibleReport.setVerifiedAt(LocalDateTime.now());

        Report hiddenReport = new Report();
        hiddenReport.setBooking(hiddenBooking);

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("patient@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(patient));
        when(reportRepository.findByBookingPatientId(1L)).thenReturn(List.of(visibleReport, hiddenReport));

        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When
            var items = reportService.getMyPatientReports();

            // Then
            assertEquals(1, items.size());
            assertEquals(11L, items.get(0).getBookingId());
            assertEquals("VERIFIED", items.get(0).getStatus());
        }
    }

    @Test
    void getDownloadableReportByBooking_ThrowsWhenPatientDoesNotOwnBooking() {
        // Given
        User anotherPatient = new User();
        anotherPatient.setId(99L);

        Booking otherBooking = new Booking();
        otherBooking.setId(2L);
        otherBooking.setPatient(anotherPatient);

        Report report = new Report();
        report.setBooking(otherBooking);
        report.setReportPdf("file".getBytes());

        patient.setEmail("patient@test.com");
        patient.setRole(UserRole.PATIENT);

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("patient@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(patient));
        when(reportRepository.findByBookingId(2L)).thenReturn(Optional.of(report));

        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            assertThrows(ResourceNotFoundException.class, () -> reportService.getDownloadableReportByBooking(2L));
        }
    }

    @Test
    void getTrendsForPatient_UsesSingleProjectionQuery() {
        // Given
        patient.setEmail("patient@test.com");
        patient.setRole(UserRole.PATIENT);

        ReportResultRepository.TrendResultRow trendRow = mock(ReportResultRepository.TrendResultRow.class);
        when(trendRow.getParameterName()).thenReturn("Glucose");
        when(trendRow.getBookingDate()).thenReturn(java.time.LocalDate.now());
        when(trendRow.getResultValue()).thenReturn("98");
        when(trendRow.getUnit()).thenReturn("mg/dL");

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("patient@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(patient));
        when(reportResultRepository.findTrendRowsByPatientIdAndStatusIn(anyLong(), anyCollection()))
                .thenReturn(List.of(trendRow));

        // When
        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            reportService.getTrendsForPatient(1L);
        }

        // Then
        verify(reportResultRepository).findTrendRowsByPatientIdAndStatusIn(eq(1L), anyCollection());
        verify(bookingRepository, never()).findForTrendsByPatientId(anyLong());
        verify(reportResultRepository, never()).findByBookingId(anyLong());
    }
}

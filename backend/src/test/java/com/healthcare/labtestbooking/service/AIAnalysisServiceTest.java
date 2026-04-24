package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.ReportAiAnalysis;
import com.healthcare.labtestbooking.entity.enums.AiAnalysisStatus;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.dto.AiAnalysisResponseDto;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportAiAnalysisRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpServerErrorException;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class AIAnalysisServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ReportResultRepository reportResultRepository;

    @Mock
    private ReportAiAnalysisRepository reportAiAnalysisRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AIAnalysisAsyncService aiAnalysisAsyncService;

    @Mock
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @InjectMocks
    private AIAnalysisService aiAnalysisService;

    @Test
    void requestAnalysisForBooking_dispatchesAsyncJob() {
        User currentUser = new User();
        currentUser.setId(1L);
        currentUser.setEmail("patient@test.com");
        currentUser.setRole(UserRole.PATIENT);

        Booking booking = new Booking();
        booking.setId(10L);
        booking.setPatient(currentUser);

        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(currentUser));
        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(reportAiAnalysisRepository.findByBookingId(10L)).thenReturn(Optional.empty());
        when(reportAiAnalysisRepository.save(any(ReportAiAnalysis.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ReflectionTestUtils.setField(aiAnalysisService, "aiAnalysisAsyncService", aiAnalysisAsyncService);

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("patient@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            aiAnalysisService.requestAnalysisForBooking(10L);
        }

        verify(aiAnalysisAsyncService).analyzeReportAsync(10L);
    }

    @Test
    void buildClientSafeErrorMessage_transientProvider503ReturnsFriendlyMessage() {
        HttpServerErrorException exception = HttpServerErrorException.create(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Service Unavailable",
                HttpHeaders.EMPTY,
                """
                        {
                          "error": {
                            "code": 503,
                            "message": "This model is currently experiencing high demand."
                          }
                        }
                        """.getBytes(),
                null
        );

        String message = ReflectionTestUtils.invokeMethod(
                aiAnalysisService,
                "buildClientSafeErrorMessage",
                exception
        );

        org.assertj.core.api.Assertions.assertThat(message)
                .isEqualTo("AI service is currently busy. Please try again in a minute.");
    }

    @Test
    void buildClientSafeErrorMessage_raw503PayloadStringReturnsFriendlyMessage() {
        IllegalStateException exception = new IllegalStateException(
                "503 Service Unavailable: \"{<EOL> \\\"error\\\": {<EOL> \\\"code\\\": 503,<EOL> \\\"message\\\": \\\"This model is currently experiencing high demand.\\\"<EOL> }}\""
        );

        String message = ReflectionTestUtils.invokeMethod(
                aiAnalysisService,
                "buildClientSafeErrorMessage",
                exception
        );

        org.assertj.core.api.Assertions.assertThat(message)
                .isEqualTo("AI service is currently busy. Please try again in a minute.");
    }

    @Test
    void getAnalysisForBooking_sanitizesLegacyRawProviderErrorMessage() {
        User currentUser = new User();
        currentUser.setId(1L);
        currentUser.setEmail("patient@test.com");
        currentUser.setRole(UserRole.PATIENT);

        Booking booking = new Booking();
        booking.setId(10L);
        booking.setPatient(currentUser);

        ReportAiAnalysis analysis = ReportAiAnalysis.builder().booking(booking).build();
        analysis.setStatus(AiAnalysisStatus.FAILED);
        analysis.setErrorMessage("503 Service Unavailable: \"{<EOL> \\\"error\\\": {<EOL> \\\"code\\\": 503,<EOL> \\\"message\\\": \\\"This model is currently experiencing high demand.\\\"<EOL> }}\"");

        when(userRepository.findByEmail("patient@test.com")).thenReturn(Optional.of(currentUser));
        when(reportAiAnalysisRepository.findByBookingId(10L)).thenReturn(Optional.of(analysis));
        when(reportResultRepository.findByBookingId(10L)).thenReturn(java.util.List.of());

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("patient@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        AiAnalysisResponseDto response;
        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            response = aiAnalysisService.getAnalysisForBooking(10L);
        }

        assertThat(response.getErrorMessage())
                .isEqualTo("AI service is currently busy. Please try again in a minute.");
    }
}

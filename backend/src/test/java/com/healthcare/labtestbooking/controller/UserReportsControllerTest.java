package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.UserReportSummaryDTO;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.service.ReportGeneratorService;
import com.healthcare.labtestbooking.service.ReportService;
import com.healthcare.labtestbooking.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserReportsControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private ReportService reportService;

    @Mock
    private ReportGeneratorService reportGeneratorService;

    @InjectMocks
    private UserReportsController userReportsController;

    @Test
    void getUserReports_UsesBulkReportLookup() {
        Booking bookingWithReport = new Booking();
        bookingWithReport.setId(101L);
        bookingWithReport.setStatus(BookingStatus.VERIFIED);
        bookingWithReport.setBookingReference("BKG-101");
        bookingWithReport.setCreatedAt(LocalDateTime.now().minusDays(2));

        Booking bookingWithoutReport = new Booking();
        bookingWithoutReport.setId(102L);
        bookingWithoutReport.setStatus(BookingStatus.BOOKED);
        bookingWithoutReport.setBookingReference("BKG-102");
        bookingWithoutReport.setCreatedAt(LocalDateTime.now().minusDays(1));

        Report report = new Report();
        report.setId(5001L);
        report.setBooking(bookingWithReport);
        report.setGeneratedDate(LocalDateTime.now());

        when(userService.getCurrentUserId()).thenReturn(1L);
        when(bookingRepository.findByPatientId(anyLong(), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(bookingWithReport, bookingWithoutReport)));
        when(reportRepository.findByBookingIdIn(List.of(101L, 102L))).thenReturn(List.of(report));

        ResponseEntity<ApiResponse<List<UserReportSummaryDTO>>> response = userReportsController.getUserReports(null, 10, 0);

        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getData().size());
        assertEquals("READY", response.getBody().getData().get(0).getStatus());
        assertEquals("PENDING", response.getBody().getData().get(1).getStatus());

        verify(reportRepository).findByBookingIdIn(List.of(101L, 102L));
        verify(reportRepository, never()).findByBookingId(anyLong());
    }
}

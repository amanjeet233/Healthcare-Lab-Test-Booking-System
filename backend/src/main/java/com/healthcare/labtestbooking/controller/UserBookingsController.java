package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.dto.CancelBookingRequest;
import com.healthcare.labtestbooking.dto.RescheduleBookingRequest;
import com.healthcare.labtestbooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
public class UserBookingsController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        List<BookingResponse> bookings = bookingService.getMyBookings();

        if (status != null && !status.isBlank()) {
            bookings = bookings.stream()
                    .filter(b -> b.getStatus() != null && b.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }
        if (dateFrom != null && !dateFrom.isBlank()) {
            LocalDate from = LocalDate.parse(dateFrom);
            bookings = bookings.stream()
                    .filter(b -> b.getBookingDate() != null && !b.getBookingDate().isBefore(from))
                    .collect(Collectors.toList());
        }
        if (dateTo != null && !dateTo.isBlank()) {
            LocalDate to = LocalDate.parse(dateTo);
            bookings = bookings.stream()
                    .filter(b -> b.getBookingDate() != null && !b.getBookingDate().isAfter(to))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(ApiResponse.success("Bookings fetched successfully", bookings));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success("Booking fetched successfully", bookingService.getBookingById(bookingId)));
    }

    @PutMapping("/{bookingId}/reschedule")
    public ResponseEntity<ApiResponse<BookingResponse>> rescheduleBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody RescheduleBookingRequest request) {
        BookingResponse response = bookingService.rescheduleBooking(
                bookingId,
                LocalDate.parse(request.getNewDate()),
                request.getNewTime());
        return ResponseEntity.ok(ApiResponse.success("Booking rescheduled successfully", response));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long bookingId,
            @RequestBody(required = false) CancelBookingRequest request) {
        BookingResponse response = bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", response));
    }
}

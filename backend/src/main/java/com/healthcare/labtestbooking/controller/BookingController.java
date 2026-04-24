package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.AssignTechnicianRequest;
import com.healthcare.labtestbooking.dto.BookingRequest;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.dto.SpecimenRejectionRequest;
import com.healthcare.labtestbooking.entity.AuditLog;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.exception.BadRequestException;
import com.healthcare.labtestbooking.repository.AuditLogRepository;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bookings", description = "Lab test booking management")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

        private final BookingService bookingService;
        private final BookingRepository bookingRepository;
        private final AuditLogRepository auditLogRepository;

        @PostMapping({ "", "/create" })
        @Operation(summary = "Create a new booking", description = "Create a new lab test booking with tests and slot information")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Booking created successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid booking data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
                log.info("Create booking request: {}", request);
                BookingResponse response = bookingService.createBooking(request);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Booking created successfully", response));
        }

        @GetMapping({ "/my", "/user" })
        @Operation(summary = "Get my bookings", description = "Retrieve all bookings for the authenticated user")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bookings retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<BookingResponse>>> getMyBookings(
                        @PageableDefault(size = 20, sort = "bookingDate") Pageable pageable) {
                log.info("Get my bookings request | Page: {}, Size: {}",
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<BookingResponse> bookings = bookingService.getMyBookings(pageable);
                return ResponseEntity.ok(ApiResponse.success("Bookings fetched successfully", bookings));
        }

        @GetMapping("/technician")
        @Operation(summary = "Get technician bookings", description = "Retrieve all bookings assigned to the authenticated technician")
        public ResponseEntity<ApiResponse<List<BookingResponse>>> getTechnicianBookings() {
                log.info("Fetching bookings for authenticated technician");
                List<BookingResponse> bookings = bookingService.getTechnicianBookings();
                return ResponseEntity.ok(ApiResponse.success("Technician bookings fetched successfully", bookings));
        }

        @GetMapping("/technician/today")
        @Operation(summary = "Get today's technician bookings", description = "Retrieve today's bookings assigned to the authenticated technician")
        public ResponseEntity<ApiResponse<List<BookingResponse>>> getTechnicianTodayBookings() {
                log.info("Fetching today's bookings for authenticated technician");
                List<BookingResponse> bookings = bookingService.getTechnicianTodayBookings();
                return ResponseEntity.ok(ApiResponse.success("Today's technician bookings fetched successfully", bookings));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get booking by ID", description = "Retrieve a specific booking by its ID")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
                log.info("Get booking by id: {}", id);
                BookingResponse booking = bookingService.getBookingById(id);
                return ResponseEntity.ok(ApiResponse.success(booking));
        }

        @GetMapping("/{id}/timeline")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBookingTimeline(@PathVariable Long id) {
                log.info("GET /api/bookings/{}/timeline", id);

                List<AuditLog> logs = auditLogRepository
                                .findByEntityNameAndEntityId("BOOKING", String.valueOf(id))
                                .stream()
                                .filter(l -> l.getAction() != null &&
                                                (l.getAction().startsWith("BOOKING_STATUS") ||
                                                                l.getAction().equals("TECHNICIAN_ASSIGNED") ||
                                                                l.getAction().equals("REPORT_VERIFIED") ||
                                                                l.getAction().equals("REPORT_UPLOADED") ||
                                                                l.getAction().equals("SPECIMEN_REJECTED")))
                                .sorted(java.util.Comparator.comparing(AuditLog::getTimestamp))
                                .collect(java.util.stream.Collectors.toList());

                List<Map<String, Object>> timeline = logs.stream().map(l -> {
                        Map<String, Object> entry = new java.util.HashMap<>();
                        entry.put("action", l.getAction());
                        entry.put("timestamp", l.getTimestamp());
                        entry.put("details", l.getNewValue());
                        entry.put("userId", l.getUserId());
                        return entry;
                }).collect(java.util.stream.Collectors.toList());

                Booking booking = bookingRepository.findById(id).orElse(null);
                if (booking != null) {
                        Map<String, Object> first = new java.util.HashMap<>();
                        first.put("action", "BOOKED");
                        first.put("timestamp", booking.getCreatedAt());
                        first.put("details", "Booking created");
                        timeline.add(0, first);
                }

                return ResponseEntity.ok(ApiResponse.success("Timeline", timeline));
        }

        @GetMapping("/slots")
        @Operation(summary = "Get available slots", description = "Retrieve available time slots for a specific test and date")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Available slots retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date or test ID"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<List<String>>> getAvailableSlots(@RequestParam String date,
                        @RequestParam Long testId) {
                log.info("Get available slots for date: {} and testId: {}", date, testId);
                List<String> slots = bookingService.getAvailableSlots(date, testId);
                return ResponseEntity.ok(ApiResponse.success(slots));
        }

        /**
         * GET /api/bookings/{id}/allowed-transitions
         * Returns the list of valid next statuses for the given booking.
         * Used by the frontend to show only valid action buttons.
         */
        @GetMapping("/{id}/allowed-transitions")
        @Operation(summary = "Get allowed status transitions",
                   description = "Returns valid next statuses for a booking — used by the frontend to show only valid action buttons")
        public ResponseEntity<ApiResponse<List<BookingStatus>>> getAllowedTransitions(@PathVariable Long id) {
                log.info("Get allowed transitions for booking: {}", id);
                List<BookingStatus> transitions = bookingService.getAllowedTransitions(id);
                return ResponseEntity.ok(ApiResponse.success("Allowed transitions fetched", transitions));
        }

        /**
         * PUT /api/bookings/{id}/status
         * Accepts a BookingStatus enum value. Spring auto-validates and returns 400 on unknown values.
         */
        @PutMapping("/{id}/status")
        @PreAuthorize("hasAnyRole('TECHNICIAN', 'MEDICAL_OFFICER')")
        @Operation(summary = "Update booking status", description = "Update the status of a booking — only enum-valid transitions are accepted")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking status updated"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid status or illegal transition"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
        })
        public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(@PathVariable Long id,
                        @RequestParam BookingStatus status) {
                log.info("Update booking {} status to: {}", id, status);
                try {
                        BookingResponse booking = bookingService.updateBookingStatus(id, status);
                        return ResponseEntity.ok(ApiResponse.success("Booking status updated", booking));
                } catch (BadRequestException ex) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(ex.getMessage()));
                } catch (IllegalArgumentException ex) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error("Invalid status value"));
                }
        }

        @PutMapping("/{id}/collection")
        @PreAuthorize("hasRole('TECHNICIAN')")
        @Operation(summary = "Mark sample as collected", description = "Transitions booking from BOOKED to SAMPLE_COLLECTED")
        public ResponseEntity<ApiResponse<BookingResponse>> markCollected(@PathVariable Long id) {
                log.info("Marking booking {} as collected", id);
                try {
                        BookingResponse booking = bookingService.markCollected(id);
                        return ResponseEntity.ok(ApiResponse.success("Sample marked as collected", booking));
                } catch (BadRequestException ex) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(ex.getMessage()));
                }
        }

        @PostMapping("/{id}/reject-specimen")
        @PreAuthorize("hasRole('TECHNICIAN')")
        @Operation(summary = "Reject specimen", description = "Reject a specimen with reason code and optional notes")
        public ResponseEntity<ApiResponse<BookingResponse>> rejectSpecimen(
                        @PathVariable Long id,
                        @Valid @RequestBody SpecimenRejectionRequest request) {
                log.info("Technician rejecting specimen for booking {} with reason {}", id, request.getReason());
                BookingResponse booking = bookingService.rejectSpecimen(id, request);
                return ResponseEntity.ok(ApiResponse.success("Specimen rejected", booking));
        }

        @PutMapping("/{id}/technician")
        @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'TECHNICIAN')")
        @Operation(summary = "Assign technician", description = "Assign a technician to a booking (ADMIN, MEDICAL_OFFICER or TECHNICIAN role required)")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Technician assigned successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - role access denied"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking or technician not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> assignTechnician(@PathVariable Long id,
                        @Valid @RequestBody AssignTechnicianRequest request) {
                log.info("Assign technician {} to booking {}", request.getTechnicianId(), id);
                BookingResponse booking = bookingService.assignTechnician(id, request.getTechnicianId());
                return ResponseEntity.ok(ApiResponse.success("Technician assigned", booking));
        }

        @GetMapping("/unassigned")
        @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN','MEDICAL_OFFICER')")
        @Operation(summary = "Get unassigned bookings", description = "Retrieve unassigned BOOKED/CONFIRMED bookings for admin, technician and medical officer")
        public ResponseEntity<ApiResponse<List<BookingResponse>>> getUnassignedBookings() {
                log.info("Fetching unassigned bookings");
                List<BookingResponse> bookings = bookingService.getUnassignedBookings();
                return ResponseEntity.ok(ApiResponse.success("Unassigned bookings fetched successfully", bookings));
        }

        @RequestMapping(value = { "/{id}/cancel", "/cancel/{id}" }, method = { RequestMethod.PUT, RequestMethod.POST })
        @PreAuthorize("isAuthenticated()")
        @Operation(summary = "Cancel booking", description = "Cancel an existing booking")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking cancelled successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
                        @PathVariable Long id,
                        @RequestBody(required = false) Map<String, String> body) {
                log.info("Cancel booking: {}", id);
                BookingResponse booking = bookingService.cancelBooking(id);
                return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
        }

        // ===== Admin Endpoints =====

        @GetMapping("/admin/all")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Get all bookings", description = "Retrieve all bookings in the system (ADMIN role required)")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All bookings retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
                        @RequestParam(required = false) String patientName,
                        @RequestParam(required = false) BookingStatus status,
                        @PageableDefault(size = 20, sort = "bookingDate") Pageable pageable) {
                log.info("Get all bookings (admin) | Name: {}, Status: {} | Page: {}, Size: {}",
                                patientName, status, pageable.getPageNumber(), pageable.getPageSize());
                Page<BookingResponse> bookings = bookingService.getAllBookings(patientName, status, pageable);
                return ResponseEntity.ok(ApiResponse.success("Bookings fetched successfully", bookings));
        }

        /**
         * PUT /api/bookings/admin/{id}/status
         * Admin can set any enum status including CANCELLED from any state.
         */
        @PutMapping("/admin/{id}/status")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Admin update booking status",
                   description = "Update booking status as admin. Admin can force CANCELLED from any state; all other transitions are still validated.")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking status updated"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid status or illegal transition"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
        })
        public ResponseEntity<ApiResponse<BookingResponse>> adminUpdateBookingStatus(@PathVariable Long id,
                        @RequestBody Map<String, String> payload) {
                BookingStatus status = BookingStatus.valueOf(payload.get("status"));
                String cancellationReason = payload.get("cancellationReason");
                
                log.info("Admin update booking {} status to: {} | Reason: {}", id, status, cancellationReason);
                try {
                        BookingResponse booking = bookingService.adminUpdateBookingStatus(id, status, cancellationReason);
                        return ResponseEntity.ok(ApiResponse.success("Booking status updated", booking));
                } catch (IllegalArgumentException ex) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error("Invalid status value"));
                } catch (Exception ex) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(ex.getMessage()));
                }
        }

        // ===== Upcoming / History / Reschedule =====

        @GetMapping("/upcoming")
        @Operation(summary = "Get upcoming bookings", description = "Retrieve future bookings in BOOKED status for the authenticated user")
        public ResponseEntity<ApiResponse<List<BookingResponse>>> getUpcomingBookings() {
                List<BookingResponse> bookings = bookingService.getUpcomingBookings();
                return ResponseEntity.ok(ApiResponse.success(bookings));
        }

        @GetMapping("/history")
        @Operation(summary = "Get booking history", description = "Retrieve past/completed/cancelled bookings for the authenticated user")
        public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingHistory() {
                List<BookingResponse> bookings = bookingService.getBookingHistory();
                return ResponseEntity.ok(ApiResponse.success(bookings));
        }

        @PostMapping("/{id}/reschedule")
        @Operation(summary = "Reschedule booking", description = "Change the date and time slot of an existing booking")
        public ResponseEntity<ApiResponse<BookingResponse>> rescheduleBooking(
                        @PathVariable Long id,
                        @RequestParam String date,
                        @RequestParam String timeSlot) {
                log.info("Reschedule booking {} to {} at {}", id, date, timeSlot);
                BookingResponse booking = bookingService.rescheduleBooking(
                                id, java.time.LocalDate.parse(date), timeSlot);
                return ResponseEntity.ok(ApiResponse.success("Booking rescheduled successfully", booking));
        }
}

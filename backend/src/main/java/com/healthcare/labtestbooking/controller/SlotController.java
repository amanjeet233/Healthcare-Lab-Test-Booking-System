package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.service.SlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Slot Booking", description = "Slot availability and booking management")
@SecurityRequirement(name = "bearerAuth")
public class SlotController {

    private final SlotService slotService;

    @GetMapping("/available")
    @Operation(summary = "Get available slots", description = "Get all available slots for a specific date and lab")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Slots retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date or lab ID"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long labId) {
        log.info("GET /api/slots/available - date: {}, labId: {}", date, labId);
        List<Map<String, Object>> slots = slotService.getAvailableSlots(date, labId);
        return ResponseEntity.ok(ApiResponse.success("Found " + slots.size() + " available slots", slots));
    }

    @PostMapping("/book")
    @PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
    @Operation(summary = "Book a slot", description = "Book an available time slot for a booking")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Slot booked successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid booking request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Slot or booking not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Slot is no longer available"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> bookSlot(@Valid @RequestBody BookSlotRequest request) {
        log.info("POST /api/slots/book - slotConfigId: {}, bookingId: {}, date: {}",
                request.getSlotConfigId(), request.getBookingId(), request.getDate());
        Map<String, Object> result = slotService.bookSlot(
                request.getSlotConfigId(),
                request.getBookingId(),
                request.getDate()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slot booked successfully", result));
    }

    @PostMapping("/release")
    @PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
    @Operation(summary = "Release a slot", description = "Release a previously booked slot")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Slot released successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No slot found for booking"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> releaseSlot(@Valid @RequestBody ReleaseSlotRequest request) {
        log.info("POST /api/slots/release - bookingId: {}", request.getBookingId());
        Map<String, Object> result = slotService.releaseSlot(request.getBookingId());
        return ResponseEntity.ok(ApiResponse.success("Slot released successfully", result));
    }

    @GetMapping("/check")
    @Operation(summary = "Check slot availability", description = "Check if a specific time slot is available")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Availability check complete"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid parameters"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> isSlotAvailable(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long labId,
            @RequestParam String time) {
        log.info("GET /api/slots/check - date: {}, labId: {}, time: {}", date, labId, time);
        Map<String, Object> result = slotService.isSlotAvailable(date, labId, time);
        return ResponseEntity.ok(ApiResponse.success("Slot availability checked", result));
    }

    @Data
    public static class BookSlotRequest {
        @NotNull(message = "Slot config ID is required")
        private Long slotConfigId;

        @NotNull(message = "Booking ID is required")
        private Long bookingId;

        @NotNull(message = "Date is required")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate date;
    }

    @Data
    public static class ReleaseSlotRequest {
        @NotNull(message = "Booking ID is required")
        private Long bookingId;
    }
}

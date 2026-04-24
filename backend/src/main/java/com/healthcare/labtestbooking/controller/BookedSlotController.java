package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.BookedSlotRequest;
import com.healthcare.labtestbooking.entity.BookedSlot;
import com.healthcare.labtestbooking.service.BookedSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/booked-slots")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booked Slots", description = "Management of booked time slots")
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
public class BookedSlotController {

    private final BookedSlotService bookedSlotService;

    @PostMapping
    @Operation(summary = "Book a time slot", description = "Book an available time slot for a booking")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Slot booked successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid slot or booking ID"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Slot or booking not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Slot is no longer available"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<BookedSlot>> bookSlot(@Valid @RequestBody BookedSlotRequest request) {
        log.info("Booking slot - slotId: {}, bookingId: {}", request.getSlotId(), request.getBookingId());
        BookedSlot bookedSlot = bookedSlotService.bookSlot(request.getSlotId(), request.getBookingId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slot booked successfully", bookedSlot));
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get booked slots for a specific date")
    public ResponseEntity<ApiResponse<List<BookedSlot>>> getBookedSlotsForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("Booked slots fetched successfully",
                bookedSlotService.getBookedSlotsForDate(date)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Release a booked slot")
    public ResponseEntity<ApiResponse<Void>> releaseSlot(@PathVariable Long id) {
        bookedSlotService.releaseSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Slot released successfully", null));
    }
}

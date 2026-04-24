package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.BookedSlot;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.SlotConfig;
import com.healthcare.labtestbooking.repository.BookedSlotRepository;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.SlotConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SlotService {

    private final SlotConfigRepository slotConfigRepository;
    private final BookedSlotRepository bookedSlotRepository;
    private final BookingRepository bookingRepository;

    /**
     * Get available slots for a specific date and lab
     * @param date Date to check availability
     * @param labId Lab ID (currently uses pincode-based slots)
     * @return List of available slot information
     */
    public List<Map<String, Object>> getAvailableSlots(LocalDate date, Long labId) {
        log.info("Finding available slots for date: {} and lab: {}", date, labId);

        DayOfWeek dayOfWeek = date.getDayOfWeek();
        List<SlotConfig> configs = slotConfigRepository.findAll().stream()
                .filter(c -> c.getDayOfWeek() == dayOfWeek && c.getIsActive())
                .collect(Collectors.toList());

        List<BookedSlot> bookedSlots = bookedSlotRepository.findBySlotDate(date);
        Map<Long, Long> bookingCountByConfig = bookedSlots.stream()
                .collect(Collectors.groupingBy(
                        bs -> bs.getSlotConfig().getId(),
                        Collectors.counting()
                ));

        List<Map<String, Object>> availableSlots = new ArrayList<>();

        for (SlotConfig config : configs) {
            long currentBookings = bookingCountByConfig.getOrDefault(config.getId(), 0L);
            int available = config.getCapacity() - (int) currentBookings;

            if (available > 0) {
                Map<String, Object> slotInfo = new LinkedHashMap<>();
                slotInfo.put("slotConfigId", config.getId());
                slotInfo.put("time", config.getSlotStart().toString() + " - " + config.getSlotEnd().toString());
                slotInfo.put("startTime", config.getSlotStart());
                slotInfo.put("endTime", config.getSlotEnd());
                slotInfo.put("capacity", config.getCapacity());
                slotInfo.put("booked", currentBookings);
                slotInfo.put("available", available);
                slotInfo.put("dayOfWeek", config.getDayOfWeek().toString());
                slotInfo.put("pincode", config.getPincode());
                availableSlots.add(slotInfo);
            }
        }

        log.info("Found {} available slots for {} at lab {}", availableSlots.size(), date, labId);
        return availableSlots;
    }

    /**
     * Book a slot for a booking
     * @param slotConfigId Slot configuration ID
     * @param bookingId Booking ID
     * @param date Date for the slot
     * @return Booking confirmation details
     */
    @Transactional
    public Map<String, Object> bookSlot(Long slotConfigId, Long bookingId, LocalDate date) {
        log.info("Booking slot {} for booking {} on date {}", slotConfigId, bookingId, date);

        SlotConfig config = slotConfigRepository.findById(slotConfigId)
                .orElseThrow(() -> new RuntimeException("Slot configuration not found: " + slotConfigId));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        // Check capacity
        List<BookedSlot> existingBookings = bookedSlotRepository.findBySlotDate(date).stream()
                .filter(bs -> bs.getSlotConfig().getId().equals(slotConfigId))
                .collect(Collectors.toList());

        if (existingBookings.size() >= config.getCapacity()) {
            throw new RuntimeException("Slot is fully booked. Capacity: " + config.getCapacity());
        }

        // Check if booking already has a slot on this date
        boolean alreadyBooked = existingBookings.stream()
                .anyMatch(bs -> bs.getBooking().getId().equals(bookingId));

        if (alreadyBooked) {
            throw new RuntimeException("Booking already has a slot on this date");
        }

        BookedSlot bookedSlot = BookedSlot.builder()
                .booking(booking)
                .slotConfig(config)
                .slotDate(date)
                .build();

        bookedSlot = bookedSlotRepository.save(bookedSlot);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("bookedSlotId", bookedSlot.getId());
        result.put("slotConfigId", slotConfigId);
        result.put("bookingId", bookingId);
        result.put("date", date);
        result.put("time", config.getSlotStart().toString() + " - " + config.getSlotEnd().toString());
        result.put("bookedAt", bookedSlot.getCreatedAt());
        result.put("status", "CONFIRMED");

        log.info("Slot booked successfully: {}", bookedSlot.getId());
        return result;
    }

    /**
     * Release a slot for a booking
     * @param bookingId Booking ID to release slot for
     * @return Release confirmation
     */
    @Transactional
    public Map<String, Object> releaseSlot(Long bookingId) {
        log.info("Releasing slot for booking: {}", bookingId);

        List<BookedSlot> bookedSlots = bookedSlotRepository.findByBookingId(bookingId);

        if (bookedSlots.isEmpty()) {
            throw new RuntimeException("No slot found for booking: " + bookingId);
        }

        List<Long> releasedSlotIds = new ArrayList<>();
        for (BookedSlot slot : bookedSlots) {
            releasedSlotIds.add(slot.getId());
            bookedSlotRepository.delete(slot);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("bookingId", bookingId);
        result.put("releasedSlotIds", releasedSlotIds);
        result.put("releasedCount", releasedSlotIds.size());
        result.put("released", true);

        log.info("Released {} slot(s) for booking {}", releasedSlotIds.size(), bookingId);
        return result;
    }

    /**
     * Check if a specific slot is available
     * @param date Date to check
     * @param labId Lab ID
     * @param time Time to check (HH:mm format)
     * @return Availability status
     */
    public Map<String, Object> isSlotAvailable(LocalDate date, Long labId, String time) {
        log.info("Checking slot availability for date: {}, lab: {}, time: {}", date, labId, time);

        LocalTime requestedTime = LocalTime.parse(time);
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        // Find matching slot config
        List<SlotConfig> matchingConfigs = slotConfigRepository.findAll().stream()
                .filter(c -> c.getDayOfWeek() == dayOfWeek && c.getIsActive())
                .filter(c -> !requestedTime.isBefore(c.getSlotStart()) && requestedTime.isBefore(c.getSlotEnd()))
                .collect(Collectors.toList());

        if (matchingConfigs.isEmpty()) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("available", false);
            result.put("reason", "No slot configuration found for the specified time");
            return result;
        }

        SlotConfig config = matchingConfigs.get(0);

        // Count existing bookings
        long currentBookings = bookedSlotRepository.findBySlotDate(date).stream()
                .filter(bs -> bs.getSlotConfig().getId().equals(config.getId()))
                .count();

        int available = config.getCapacity() - (int) currentBookings;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("available", available > 0);
        result.put("slotConfigId", config.getId());
        result.put("time", config.getSlotStart().toString() + " - " + config.getSlotEnd().toString());
        result.put("capacity", config.getCapacity());
        result.put("booked", currentBookings);
        result.put("remainingSlots", available);

        log.info("Slot availability check complete: {} slots remaining", available);
        return result;
    }
}

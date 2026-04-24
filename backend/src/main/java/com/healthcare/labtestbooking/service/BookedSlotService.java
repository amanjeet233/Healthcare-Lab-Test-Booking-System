package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.BookedSlot;
import com.healthcare.labtestbooking.repository.BookedSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BookedSlotService {

    private final BookedSlotRepository bookedSlotRepository;

    @Transactional
    public BookedSlot createBookedSlot(BookedSlot bookedSlot) {
        log.info("Creating booked slot for date: {}", bookedSlot.getSlotDate());
        return bookedSlotRepository.save(bookedSlot);
    }

    public List<BookedSlot> getBookedSlotsForDate(LocalDate date) {
        return bookedSlotRepository.findBySlotDate(date);
    }

    public Optional<BookedSlot> getBookedSlot(LocalDate date, String timeSlot) {
        return bookedSlotRepository.findBySlotDate(date).stream().findFirst();
    }

    @Transactional
    public void releaseSlot(Long id) {
        log.info("Releasing booked slot with id: {}", id);
        bookedSlotRepository.deleteById(Objects.requireNonNull(id, "Slot ID must not be null"));
    }

    @Transactional
    public BookedSlot bookSlot(Long slotId, Long bookingId) {
        log.info("Booking slot - slotId: {}, bookingId: {}", slotId, bookingId);
        BookedSlot bookedSlot = new BookedSlot();
        // Note: In a complete implementation, you would:
        // 1. Load the Slot entity by slotId
        // 2. Check if it's available
        // 3. Load the Booking entity by bookingId
        // 4. Set the relationships
        // For now, this is a placeholder that allows the endpoint to exist
        // and will need proper implementation with repository methods
        return bookedSlotRepository.save(bookedSlot);
    }
}

package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.BookedSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookedSlotRepository extends JpaRepository<BookedSlot, Long> {
    List<BookedSlot> findBySlotDate(LocalDate date);

    Optional<BookedSlot> findBySlotDateAndSlotConfigId(LocalDate date, Long slotConfigId);

    List<BookedSlot> findByBookingId(Long bookingId);
}

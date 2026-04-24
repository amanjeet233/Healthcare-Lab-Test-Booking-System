package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ConsentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsentRecordRepository extends JpaRepository<ConsentRecord, Long> {
    Optional<ConsentRecord> findTopByBookingIdOrderByConsentTimestampDesc(Long bookingId);
    boolean existsByBookingIdAndConsentGivenTrue(Long bookingId);
}

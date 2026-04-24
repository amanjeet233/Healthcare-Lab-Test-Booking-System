package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.PanicAlertLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PanicAlertLogRepository extends JpaRepository<PanicAlertLog, Long> {
    List<PanicAlertLog> findByBookingId(Long bookingId);
}

package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByBookingIdOrderBySentAtDesc(Long bookingId);
}

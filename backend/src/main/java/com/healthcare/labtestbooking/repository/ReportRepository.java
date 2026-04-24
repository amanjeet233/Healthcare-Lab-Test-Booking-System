package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Report;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    @EntityGraph(attributePaths = {"results", "results.parameter", "booking", "booking.test"})
    Optional<Report> findByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {
            "results",
            "results.parameter",
            "booking",
            "booking.patient",
            "booking.test",
            "booking.testPackage",
            "patient"
    })
    Optional<Report> findDetailedByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"results", "results.parameter", "booking", "booking.test"})
    Optional<Report> findByOrderId(Long orderId);

    @EntityGraph(attributePaths = {"booking", "booking.test", "booking.testPackage", "booking.patient"})
    List<Report> findByBookingPatientId(Long patientId);

    @EntityGraph(attributePaths = {"booking"})
    List<Report> findByBookingIdIn(List<Long> bookingIds);

    @EntityGraph(attributePaths = {"results", "results.parameter", "booking", "booking.patient", "booking.test"})
    Optional<Report> findByShareToken(String shareToken);

    Optional<Report> findByBookingIdAndBookingPatientId(Long bookingId, Long patientId);
    
    List<Report> findByBookingPatientIdAndShareTokenIsNotNull(Long patientId);
}

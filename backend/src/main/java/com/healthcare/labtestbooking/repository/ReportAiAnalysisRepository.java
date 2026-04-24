package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReportAiAnalysis;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportAiAnalysisRepository extends JpaRepository<ReportAiAnalysis, Long> {

    @EntityGraph(attributePaths = {"booking", "booking.patient"})
    Optional<ReportAiAnalysis> findByBookingId(Long bookingId);
}

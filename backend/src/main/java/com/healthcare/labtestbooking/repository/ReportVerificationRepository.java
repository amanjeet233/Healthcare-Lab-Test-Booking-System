package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.entity.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportVerificationRepository extends JpaRepository<ReportVerification, Long> {

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage", "booking.reportResults", "medicalOfficer"})
    @Query("SELECT rv FROM ReportVerification rv WHERE rv.status = 'PENDING' AND (" +
           "rv.booking.criticalFlag = true OR " +
           "EXISTS (SELECT rr FROM ReportResult rr WHERE rr.booking = rv.booking AND (rr.isCritical = true OR rr.isAbnormal = true)))")
    Page<ReportVerification> findCriticalPending(Pageable pageable);

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage", "booking.reportResults", "medicalOfficer"})
    Page<ReportVerification> findByStatusAndCreatedAtAfterOrderByCreatedAtDesc(VerificationStatus status, LocalDateTime since, Pageable pageable);

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage", "booking.reportResults", "medicalOfficer"})
    Page<ReportVerification> findByStatusAndPreviouslyRejectedTrueOrderByCreatedAtDesc(VerificationStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage", "booking.reportResults", "medicalOfficer"})
    List<ReportVerification> findByStatusOrderByCreatedAtDesc(VerificationStatus status);
    
    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage", "booking.reportResults", "medicalOfficer"})
    Page<ReportVerification> findByStatusOrderByCreatedAtDesc(VerificationStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage", "booking.reportResults", "medicalOfficer"})
    Page<ReportVerification> findByStatusInOrderByCreatedAtDesc(List<VerificationStatus> statuses, Pageable pageable);

    long countByStatus(VerificationStatus status);

    Optional<ReportVerification> findByBookingId(Long bookingId);
}

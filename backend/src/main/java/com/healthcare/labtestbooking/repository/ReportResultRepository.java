package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportResultRepository extends JpaRepository<ReportResult, Long> {

    @EntityGraph(attributePaths = {"parameter"})
    List<ReportResult> findByBookingId(Long bookingId);

    Optional<ReportResult> findByBookingIdAndParameterId(Long bookingId, Long parameterId);

    @EntityGraph(attributePaths = {"parameter"})
    List<ReportResult> findByBookingPatientIdOrderByCreatedAtDesc(Long patientId);

    @EntityGraph(attributePaths = {"parameter"})
    List<ReportResult> findByReportId(Long reportId);

    @EntityGraph(attributePaths = {"parameter"})
    List<ReportResult> findByReportIdAndIsCriticalTrue(Long reportId);

    @Query("""
            select b.id as bookingId,
                   b.bookingDate as bookingDate,
                   b.createdAt as bookingCreatedAt,
                   p.parameterName as parameterName,
                   rr.resultValue as resultValue,
                   coalesce(rr.unit, '') as unit
            from ReportResult rr
            join rr.booking b
            join rr.parameter p
            where b.patient.id = :patientId
              and b.status in :statuses
              and rr.resultValue is not null
              and rr.resultValue <> ''
            """)
    List<TrendResultRow> findTrendRowsByPatientIdAndStatusIn(@Param("patientId") Long patientId,
                                                             @Param("statuses") Collection<BookingStatus> statuses);

    interface TrendResultRow {
        Long getBookingId();
        LocalDate getBookingDate();
        LocalDateTime getBookingCreatedAt();
        String getParameterName();
        String getResultValue();
        String getUnit();
    }
}

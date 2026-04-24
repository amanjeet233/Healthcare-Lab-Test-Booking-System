package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician"})
    Optional<Booking> findByBookingReference(String bookingReference);

       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician"})
       Optional<Booking> findDetailedById(Long id);

       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician", "reportVerification", "recommendation"})
    List<Booking> findByPatientId(Long patientId);

       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician", "reportVerification", "recommendation"})
    Page<Booking> findByPatientId(Long patientId, Pageable pageable);

    @EntityGraph(attributePaths = {"test"})
    List<Booking> findByTestId(Long testId);

    @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician"})
    List<Booking> findByStatus(BookingStatus status);

    @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician"})
    List<Booking> findByPatientIdAndStatus(Long patientId, BookingStatus status);

    @EntityGraph(attributePaths = {"test"})
    List<Booking> findByBookingDate(LocalDate bookingDate);

    @EntityGraph(attributePaths = {"test"})
    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);

       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician"})
    List<Booking> findByTechnicianId(Long technicianId);

       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician", "reportVerification", "recommendation"})
       List<Booking> findByTechnicianIsNullAndStatusIn(List<BookingStatus> statuses);

       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician", "reportVerification", "recommendation"})
    Page<Booking> findByTechnicianId(Long technicianId, Pageable pageable);

    List<Booking> findByMedicalOfficerId(Long medicalOfficerId);

    List<Booking> findByBookingDateAndTimeSlot(LocalDate bookingDate, String timeSlot);

    long countByBookingDateBetween(LocalDate startDate, LocalDate endDate);

    long countByStatusAndBookingDateBetween(BookingStatus status, LocalDate startDate, LocalDate endDate);

    long countByStatus(BookingStatus status);
        long countByStatusNot(BookingStatus status);
       long countByStatusIn(List<BookingStatus> statuses);
    long countByCriticalFlagTrueAndStatusNot(BookingStatus status);

    long countByTestId(Long testId);

    long countByTestPackageId(Long testPackageId);

    long countByTechnicianIdAndBookingDateAndTimeSlot(Long technicianId, LocalDate bookingDate, String timeSlot);

    long countByTechnicianIdAndBookingDate(Long technicianId, LocalDate bookingDate);

    @Query("select DATE(b.createdAt), count(b) from Booking b " +
           "where DATE(b.createdAt) between :start and :end " +
           "group by DATE(b.createdAt) order by DATE(b.createdAt)")
    List<Object[]> countBookingsByCreatedDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("select DATE(b.createdAt), count(b) from Booking b " +
           "where DATE(b.createdAt) between :start and :end " +
           "group by DATE(b.createdAt) order by DATE(b.createdAt)")
    List<Object[]> countBookingsByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("select b.test.testName, count(b) from Booking b where b.test is not null group by b.test.testName order by count(b) desc")
    List<Object[]> findTopBookedTests(Pageable pageable);

    // Analytics queries for Doctor Test Management
    long countByTestIdAndCreatedAtBetween(Long testId, LocalDateTime start, LocalDateTime end);

    long countByCreatedAtAfter(LocalDateTime after);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.test.id = :testId AND b.createdAt >= :start")
    long countByTestIdAndCreatedAtAfter(@Param("testId") Long testId, @Param("start") LocalDateTime start);

    long countByBookingDate(LocalDate bookingDate);

    @Query("SELECT DATE(b.createdAt), COALESCE(SUM(b.finalAmount), 0) FROM Booking b " +
           "WHERE b.paymentStatus IN (com.healthcare.labtestbooking.entity.enums.PaymentStatus.PAID, " +
           "com.healthcare.labtestbooking.entity.enums.PaymentStatus.SUCCESS, " +
           "com.healthcare.labtestbooking.entity.enums.PaymentStatus.COMPLETED) " +
           "AND b.status <> com.healthcare.labtestbooking.entity.enums.BookingStatus.CANCELLED " +
           "AND DATE(b.createdAt) BETWEEN :start AND :end " +
           "GROUP BY DATE(b.createdAt) ORDER BY DATE(b.createdAt)")
    List<Object[]> sumRevenueByCreatedDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT DATE(b.createdAt), COALESCE(SUM(b.finalAmount), 0) FROM Booking b " +
           "WHERE b.paymentStatus IN (com.healthcare.labtestbooking.entity.enums.PaymentStatus.PAID, " +
           "com.healthcare.labtestbooking.entity.enums.PaymentStatus.SUCCESS, " +
           "com.healthcare.labtestbooking.entity.enums.PaymentStatus.COMPLETED) " +
           "AND b.status <> com.healthcare.labtestbooking.entity.enums.BookingStatus.CANCELLED " +
           "AND DATE(b.createdAt) BETWEEN :start AND :end " +
           "GROUP BY DATE(b.createdAt) ORDER BY DATE(b.createdAt)")
    List<Object[]> sumRevenueByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(b.finalAmount), 0) FROM Booking b " +
           "WHERE b.paymentStatus IN (com.healthcare.labtestbooking.entity.enums.PaymentStatus.PAID, " +
           "com.healthcare.labtestbooking.entity.enums.PaymentStatus.SUCCESS, " +
           "com.healthcare.labtestbooking.entity.enums.PaymentStatus.COMPLETED) " +
           "AND b.status <> com.healthcare.labtestbooking.entity.enums.BookingStatus.CANCELLED")
    java.math.BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.finalAmount), 0) FROM Booking b " +
           "WHERE b.status <> com.healthcare.labtestbooking.entity.enums.BookingStatus.CANCELLED")
    java.math.BigDecimal sumTotalBookedRevenue();

       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician", "reportVerification", "recommendation"})
       Page<Booking> findByStatusAndPatientDisplayNameContainingIgnoreCase(BookingStatus status, String patientName, Pageable pageable);

       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician", "reportVerification", "recommendation"})
       Page<Booking> findByPatientDisplayNameContainingIgnoreCase(String patientName, Pageable pageable);

       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician", "reportVerification", "recommendation"})
       Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

               @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician", "reportVerification", "recommendation"})
        Page<Booking> findByStatusIn(List<BookingStatus> statuses, Pageable pageable);

       @Override
       @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician", "reportVerification", "recommendation"})
       Page<Booking> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"patient", "test", "testPackage", "technician"})
    List<Booking> findByCriticalFlagTrueAndStatusNotOrderByCreatedAtDesc(BookingStatus status);

    /** Unassigned bookings eligible for MO technician suggestion, sorted by bookingDate asc. */
    @EntityGraph(attributePaths = {"patient", "test", "testPackage"})
    @Query("SELECT b FROM Booking b WHERE b.technician IS NULL " +
           "AND b.status IN :statuses " +
           "ORDER BY b.bookingDate ASC")
    List<Booking> findUnassignedBookingsByStatuses(@Param("statuses") List<BookingStatus> statuses);

    /** Count of bookings for a specific technician on a specific date (for load-balancing display). */
    @Query("SELECT b.technician.id, COUNT(b) FROM Booking b " +
           "WHERE b.bookingDate = :date AND b.technician IS NOT NULL " +
           "GROUP BY b.technician.id")
    List<Object[]> countBookingsByTechnicianForDate(@Param("date") LocalDate date);

    @EntityGraph(attributePaths = {"test"})
    @Query("SELECT b FROM Booking b WHERE b.patient.id = :patientId")
    List<Booking> findForTrendsByPatientId(@Param("patientId") Long patientId);
}

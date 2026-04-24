package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Payment;
import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage"})
    List<Payment> findByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage"})
    List<Payment> findByBookingIdOrderByPaymentDateDesc(Long bookingId);

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage"})
    List<Payment> findByBookingPatientIdOrderByPaymentDateDesc(Long patientId);

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage"})
    Page<Payment> findByBookingIdOrderByPaymentDateDesc(Long bookingId, Pageable pageable);

    @EntityGraph(attributePaths = {"booking", "booking.patient", "booking.test", "booking.testPackage"})
    Page<Payment> findByBookingPatientIdOrderByPaymentDateDesc(Long patientId, Pageable pageable);

    Optional<Payment> findByTransactionId(String transactionId);

        @Query("select function('date', p.paymentDate), sum(p.amount) "
            + "from Payment p "
            + "where p.paymentDate between :start and :end "
            + "and p.isRefund = false "
            + "and p.status in :statuses "
            + "group by function('date', p.paymentDate) "
            + "order by function('date', p.paymentDate)")
        List<Object[]> sumRevenueByDateRange(@Param("start") LocalDateTime start,
                         @Param("end") LocalDateTime end,
                         @Param("statuses") List<PaymentStatus> statuses);

        @Query("select function('year', p.paymentDate), function('month', p.paymentDate), sum(p.amount) "
            + "from Payment p "
            + "where p.paymentDate between :start and :end "
            + "and p.isRefund = false "
            + "and p.status in :statuses "
            + "group by function('year', p.paymentDate), function('month', p.paymentDate) "
            + "order by function('year', p.paymentDate), function('month', p.paymentDate)")
        List<Object[]> sumRevenueByMonth(@Param("start") LocalDateTime start,
                         @Param("end") LocalDateTime end,
                         @Param("statuses") List<PaymentStatus> statuses);
}

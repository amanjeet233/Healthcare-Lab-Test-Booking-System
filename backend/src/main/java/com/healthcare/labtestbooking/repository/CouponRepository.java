package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Coupon;
import com.healthcare.labtestbooking.entity.Coupon.ApplicableTo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    // Find by coupon code
    Optional<Coupon> findByCouponCode(String couponCode);

    // Find by coupon code (case insensitive)
    @Query("SELECT c FROM Coupon c WHERE UPPER(c.couponCode) = UPPER(:code)")
    Optional<Coupon> findByCouponCodeIgnoreCase(@Param("code") String code);

    // Find all active coupons
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND " +
           "(c.startDate IS NULL OR c.startDate <= :today) AND " +
           "(c.expiryDate IS NULL OR c.expiryDate >= :today) AND " +
           "(c.maxUses IS NULL OR c.currentUses < c.maxUses)")
    List<Coupon> findAllActiveCoupons(@Param("today") LocalDate today);

    // Find valid coupons for user
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND " +
           "(c.startDate IS NULL OR c.startDate <= :today) AND " +
           "(c.expiryDate IS NULL OR c.expiryDate >= :today) AND " +
           "(c.maxUses IS NULL OR c.currentUses < c.maxUses) AND " +
           "(c.isFirstOrderOnly = false OR :isFirstOrder = true)")
    List<Coupon> findValidCouponsForUser(@Param("today") LocalDate today, @Param("isFirstOrder") boolean isFirstOrder);

    // Find by applicable type
    List<Coupon> findByApplicableToAndIsActiveTrue(ApplicableTo applicableTo);

    // Find expired coupons
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.expiryDate < :today")
    List<Coupon> findExpiredCoupons(@Param("today") LocalDate today);

    // Find coupons expiring soon
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.expiryDate BETWEEN :today AND :futureDate")
    List<Coupon> findCouponsExpiringSoon(@Param("today") LocalDate today, @Param("futureDate") LocalDate futureDate);

    // Check if coupon code exists
    boolean existsByCouponCode(String couponCode);

    // Find first order coupons
    List<Coupon> findByIsFirstOrderOnlyTrueAndIsActiveTrue();

    // Count active coupons
    @Query("SELECT COUNT(c) FROM Coupon c WHERE c.isActive = true AND " +
           "(c.expiryDate IS NULL OR c.expiryDate >= :today)")
    long countActiveCoupons(@Param("today") LocalDate today);
}

package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    Optional<Recommendation> findByBookingId(Long bookingId);
}

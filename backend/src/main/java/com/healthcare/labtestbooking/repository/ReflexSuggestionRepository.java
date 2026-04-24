package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReflexSuggestion;
import com.healthcare.labtestbooking.entity.enums.ReflexPriority;
import com.healthcare.labtestbooking.entity.enums.ReflexSuggestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReflexSuggestionRepository extends JpaRepository<ReflexSuggestion, Long> {
    List<ReflexSuggestion> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
    Optional<ReflexSuggestion> findByBookingIdAndReflexRuleId(Long bookingId, Long reflexRuleId);
    long countByBookingIdAndPriorityAndStatus(Long bookingId, ReflexPriority priority, ReflexSuggestionStatus status);
}

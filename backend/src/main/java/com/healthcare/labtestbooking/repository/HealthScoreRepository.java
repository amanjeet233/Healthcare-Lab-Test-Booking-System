package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.HealthScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthScoreRepository extends JpaRepository<HealthScore, Long> {

    List<HealthScore> findByPatientId(Long patientId);

    List<HealthScore> findByPatientIdOrderByCalculatedDateDesc(Long patientId);

    List<HealthScore> findByPatientIdAndCreatedAtAfterOrderByCreatedAtDesc(Long patientId, LocalDateTime createdAt);

    Optional<HealthScore> findFirstByPatientIdOrderByCreatedAtDesc(Long patientId);
}

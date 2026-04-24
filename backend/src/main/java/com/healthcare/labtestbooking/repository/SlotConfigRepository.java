package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.SlotConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SlotConfigRepository extends JpaRepository<SlotConfig, Long> {
    Optional<SlotConfig> findByDayOfWeek(String dayOfWeek);
}

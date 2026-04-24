package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReflexRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReflexRuleRepository extends JpaRepository<ReflexRule, Long> {
    List<ReflexRule> findByIsActiveTrue();
}

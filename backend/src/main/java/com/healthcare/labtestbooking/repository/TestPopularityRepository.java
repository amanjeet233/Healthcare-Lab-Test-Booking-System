package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.TestPopularity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestPopularityRepository extends JpaRepository<TestPopularity, Long> {
    @Query("SELECT tp FROM TestPopularity tp WHERE tp.test.id = :testId")
    Optional<TestPopularity> findByTestId(@Param("testId") Long testId);
}

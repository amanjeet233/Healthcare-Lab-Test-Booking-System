package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestParameterRepository extends JpaRepository<TestParameter, Long> {

    List<TestParameter> findByTestOrderByDisplayOrder(LabTest test);
    List<TestParameter> findByTest_IdOrderByDisplayOrder(Long testId);
}

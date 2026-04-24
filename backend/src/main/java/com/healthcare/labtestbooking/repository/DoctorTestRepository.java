package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.DoctorTest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorTestRepository extends JpaRepository<DoctorTest, Long> {
    List<DoctorTest> findByDoctorId(Long doctorId);
    List<DoctorTest> findByTestId(Long testId);
    Optional<DoctorTest> findByDoctorAndTest(User doctor, LabTest test);
    boolean existsByDoctorAndTest(User doctor, LabTest test);
}

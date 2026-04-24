package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.LabLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabLocationRepository extends JpaRepository<LabLocation, Long> {
    List<LabLocation> findByIsActiveTrue();
    List<LabLocation> findByCityAndIsActiveTrue(String city);
}

package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {

    List<Technician> findByIsActiveTrue();

    List<Technician> findDistinctByIsActiveTrueAndServicePincodesContaining(String pincode);
}

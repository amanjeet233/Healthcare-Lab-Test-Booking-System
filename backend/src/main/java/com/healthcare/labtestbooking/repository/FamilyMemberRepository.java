package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {

    @Query("SELECT f FROM FamilyMember f WHERE f.patient.id = :userId")
    List<FamilyMember> findByUserId(@Param("userId") Long userId);
    
    List<FamilyMember> findByPatientId(Long patientId);
}

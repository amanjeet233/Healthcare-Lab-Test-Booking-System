package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Consultation;
import com.healthcare.labtestbooking.entity.enums.ConsultationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByPatientId(Long patientId);
    List<Consultation> findByDoctorId(Long doctorId);
    List<Consultation> findByDoctorIdAndConsultationDate(Long doctorId, LocalDate consultationDate);
    List<Consultation> findByDoctorIdAndStatus(Long doctorId, ConsultationStatus status);
}

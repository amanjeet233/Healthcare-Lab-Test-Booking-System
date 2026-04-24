package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.DoctorTest;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.DoctorTestRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DoctorTestService {

    private final DoctorTestRepository doctorTestRepository;
    private final UserRepository userRepository;
    private final LabTestRepository labTestRepository;

    public List<DoctorTest> getAllAssignments() {
        return doctorTestRepository.findAll();
    }

    public List<DoctorTest> getAssignmentsByDoctor(Long doctorId) {
        return doctorTestRepository.findByDoctorId(doctorId);
    }

    @Transactional
    public DoctorTest assignTest(Long doctorId, Long testId) {
        log.info("Assigning test {} to doctor {}", testId, doctorId);
        
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        LabTest test = labTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        if (doctorTestRepository.existsByDoctorAndTest(doctor, test)) {
            return doctorTestRepository.findByDoctorAndTest(doctor, test).get();
        }

        DoctorTest assignment = DoctorTest.builder()
                .doctor(doctor)
                .test(test)
                .isActive(true)
                .build();

        return doctorTestRepository.save(assignment);
    }

    @Transactional
    public void removeAssignment(Long id) {
        log.info("Removing assignment {}", id);
        doctorTestRepository.deleteById(id);
    }
}

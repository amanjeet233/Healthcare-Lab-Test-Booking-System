package com.healthcare.labtestbooking.config;

import com.healthcare.labtestbooking.entity.*;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DataInitializer Component
 * 
 * This component runs on Spring Boot startup and seeds the database with:
 * 1. Lab tests (if not already present)
 * 2. Users with correct roles (if not already present)
 * 
 * It uses CommandLineRunner to execute after all beans are initialized
 * and the database schema has been created by Hibernate.
 * 
 * This ensures test data exists for Postman tests and local development
 * without overwriting existing data multiple times.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DataInitializer implements CommandLineRunner {

    private final LabTestRepository labTestRepository;
    private final UserRepository userRepository;
    private final TestParameterRepository testParameterRepository;
    private final PasswordEncoder passwordEncoder;

    private String allocateAvailablePhone(String preferredPhone) {
        if (preferredPhone == null || preferredPhone.isBlank()) {
            return null;
        }

        if (!Boolean.TRUE.equals(userRepository.existsByPhone(preferredPhone))) {
            return preferredPhone;
        }

        try {
            long base = Long.parseLong(preferredPhone);
            // Try a small range of nearby numbers to find an unused phone.
            for (int offset = 1; offset <= 200; offset++) {
                String candidate = String.valueOf(base + offset);
                if (!Boolean.TRUE.equals(userRepository.existsByPhone(candidate))) {
                    return candidate;
                }
            }
        } catch (NumberFormatException ignored) {
            // fall through
        }

        // As a last resort, return null (MySQL UNIQUE allows multiple NULLs).
        return null;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("========== DATA INITIALIZER STARTED ==========");

        try {
            initializeLabTests();
            initializeTestParameters();
            initializeUsers();
            log.info("========== DATA INITIALIZER COMPLETED ==========");
        } catch (Exception e) {
            log.warn("========== DATA INITIALIZER FAILED ==========");
            log.warn("Error during initialization: {}", e.getMessage());
            // Don't propagate - allow app to continue even if initialization fails
        }
    }

    /**
     * Initialize lab tests if they don't already exist
     * This prevents duplicate inserts on every startup
     */
    private void initializeLabTests() {
        log.info("Checking lab tests in database...");

        long existingCount = labTestRepository.count();
        if (existingCount > 0) {
            log.info("✓ Lab tests already exist (count: {}). Skipping initialization.", existingCount);
            return;
        }

        log.info("Lab tests will be initialized via data.sql on next application startup");
    }

    /**
     * Initialize test parameters if they don't already exist
     * This fixes the 500 Internal Server error during Result Submission
     */
    private void initializeTestParameters() {
        log.info("Checking test parameters in database...");

        long existingCount = testParameterRepository.count();
        if (existingCount > 0) {
            log.info("✓ Test parameters already exist (count: {}). Skipping initialization.", existingCount);
            return;
        }

        log.info("Inserting missing test parameters for existing Lab Tests...");
        labTestRepository.findAll().forEach(test -> {
            // Seed 1-2 parameters per test to ensure Postman collection tests can succeed
            if (test.getTestName().contains("Glucose")) {
                testParameterRepository.save(TestParameter.builder()
                        .test(test)
                        .parameterName("Fasting Blood Sugar")
                        .unit("mg/dL")
                        .normalRangeMin(new BigDecimal("70.00"))
                        .normalRangeMax(new BigDecimal("99.00"))
                        .criticalLow(new BigDecimal("50.00"))
                        .criticalHigh(new BigDecimal("400.00"))
                        .build());
            } else if (test.getTestName().contains("Complete Blood Count")) {
                testParameterRepository.save(TestParameter.builder()
                        .test(test)
                        .parameterName("Hemoglobin (Hb)")
                        .unit("g/dL")
                        .normalRangeMin(new BigDecimal("13.5"))
                        .normalRangeMax(new BigDecimal("17.5"))
                        .build());
            } else {
                testParameterRepository.save(TestParameter.builder()
                        .test(test)
                        .parameterName("Standard Parameter for " + test.getTestName())
                        .unit("Unit")
                        .normalRangeMin(new BigDecimal("10.00"))
                        .normalRangeMax(new BigDecimal("50.00"))
                        .build());
            }
        });
        log.info("✓ Missing test parameters inserted successfully.");
    }

    /**
     * Initialize users with correct roles if they don't already exist
     * This ensures:
     * - technician@test.com has ROLE_TECHNICIAN
     * - doctor@test.com has ROLE_MEDICAL_OFFICER
     * - patient@test.com has ROLE_PATIENT
     */
    private void initializeUsers() {
        log.info("Checking users in database...");

        // Check if patient user exists - use existsByEmail to avoid loading
        // relationships
        if (!userRepository.existsByEmail("patient@test.com")) {
            log.info("Creating patient@test.com with PATIENT role");
            String phone = allocateAvailablePhone("9876543210");
            userRepository.save(User.builder()
                    .name("Patient User")
                    .email("patient@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(UserRole.PATIENT)
                    .phone(phone)
                    .address("123 Patient Street")
                    .gender(Gender.MALE)
                    .bloodGroup("O+")
                    .dateOfBirth(LocalDate.of(1990, 1, 15))
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
            log.info("✓ Patient user created");
        } else {
            log.info("✓ Patient user already exists");
        }

        // Check if technician user exists with CORRECT ROLE
        if (!userRepository.existsByEmail("technician@test.com")) {
            try {
                String phone = allocateAvailablePhone("9876543211");
                log.info("Creating technician@test.com with TECHNICIAN role (phone: {})", phone);
                userRepository.save(User.builder()
                        .name("Technician User")
                        .email("technician@test.com")
                        .password(passwordEncoder.encode("password123"))
                        .role(UserRole.TECHNICIAN) // ✓ CORRECT ROLE
                        .phone(phone)
                        .address("456 Lab Tech Avenue")
                        .gender(Gender.FEMALE)
                        .bloodGroup("B+")
                        .dateOfBirth(LocalDate.of(1992, 5, 20))
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build());
                log.info("✓ Technician user created with TECHNICIAN role");
            } catch (Exception e) {
                log.error("Error creating technician: {}", e.getMessage());
            }
        } else {
            // Check if existing technician has correct role
            var existingTech = userRepository.findByEmailWithoutRelationships("technician@test.com").get();
            boolean updated = false;
            if (existingTech.getRole() != UserRole.TECHNICIAN) {
                log.warn("Technician user exists but has role: {}. Updating to TECHNICIAN...", existingTech.getRole());
                existingTech.setRole(UserRole.TECHNICIAN);
                updated = true;
                log.info("✓ Technician user role updated to TECHNICIAN");
            } else {
                log.info("✓ Technician user already exists with TECHNICIAN role");
            }

            if (!existingTech.getPassword().startsWith("$2a$")
                    || !passwordEncoder.matches("password123", existingTech.getPassword())) {
                log.warn("Technician user password is not correct (not matching 'password123'). Resetting now...");
                existingTech.setPassword(passwordEncoder.encode("password123"));
                updated = true;
                log.info("✓ Technician password secured successfully");
            }

            if (updated) {
                userRepository.save(existingTech);
            }
        }

        // Check if medical officer user exists with CORRECT ROLE
        if (!userRepository.existsByEmail("doctor@test.com")) {
            log.info("Creating doctor@test.com with MEDICAL_OFFICER role");
            String phone = allocateAvailablePhone("9876543212");
            userRepository.save(User.builder()
                    .name("Medical Officer User")
                    .email("doctor@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(UserRole.MEDICAL_OFFICER) // ✓ CORRECT ROLE
                    .phone(phone)
                    .address("789 Doctor Plaza")
                    .gender(Gender.MALE)
                    .bloodGroup("AB+")
                    .dateOfBirth(LocalDate.of(1985, 8, 30))
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
            log.info("✓ Medical Officer user created with MEDICAL_OFFICER role");
        } else {
            // Check if existing doctor has correct role
            var existingDoctor = userRepository.findByEmailWithoutRelationships("doctor@test.com").get();
            boolean updated = false;
            if (existingDoctor.getRole() != UserRole.MEDICAL_OFFICER) {
                log.warn("Doctor user exists but has role: {}. Updating to MEDICAL_OFFICER...",
                        existingDoctor.getRole());
                existingDoctor.setRole(UserRole.MEDICAL_OFFICER);
                updated = true;
                log.info("✓ Doctor user role updated to MEDICAL_OFFICER");
            } else {
                log.info("✓ Doctor user already exists with MEDICAL_OFFICER role");
            }

            if (!existingDoctor.getPassword().startsWith("$2a$")
                    || !passwordEncoder.matches("password123", existingDoctor.getPassword())) {
                log.warn("Doctor user password is not correct (not matching 'password123'). Resetting now...");
                existingDoctor.setPassword(passwordEncoder.encode("password123"));
                updated = true;
                log.info("✓ Doctor password secured successfully");
            }

            if (updated) {
                userRepository.save(existingDoctor);
            }
        }

        // ── Admin user ────────────────────────────────────────────────
        if (!userRepository.existsByEmail("admin@healthcarelab.com")) {
            log.info("Creating admin@healthcarelab.com with ADMIN role");
            String phone = allocateAvailablePhone("9000000000");
            userRepository.save(User.builder()
                    .email("admin@healthcarelab.com")
                    .name("System Admin")
                    .password(passwordEncoder.encode("admin"))
                    .role(UserRole.ADMIN)
                    .phone(phone)
                    .isActive(true)
                    .isVerified(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
            log.info("✓ Admin user created — email: admin@healthcarelab.com  password: admin");
        } else {
            // Ensure existing admin has correct role AND password
            userRepository.findByEmail("admin@healthcarelab.com").ifPresent(u -> {
                boolean updated = false;
                if (u.getRole() != UserRole.ADMIN) {
                    u.setRole(UserRole.ADMIN);
                    updated = true;
                    log.info("✓ Fixed admin role for admin@healthcarelab.com");
                }
                // Always ensure password matches "admin"
                if (!u.getPassword().startsWith("$2a$")
                        || !passwordEncoder.matches("admin", u.getPassword())) {
                    log.warn("Admin password incorrect. Resetting to 'admin'...");
                    u.setPassword(passwordEncoder.encode("admin"));
                    updated = true;
                    log.info("✓ Admin password reset successfully");
                }
                if (updated) {
                    userRepository.save(u);
                } else {
                    log.info("✓ Admin user already exists with correct role and password");
                }
            });
        }

        log.info("✓ All users initialized successfully with correct roles");
    }
}

package com.healthcare.labtestbooking.util;

import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.logging.Logger;

@Component
@RequiredArgsConstructor
public class TestDataCleaner implements CommandLineRunner {

    private static final Logger log = Logger.getLogger(TestDataCleaner.class.getName());

    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only run in development mode
        if (args.length > 0 && "clean".equals(args[0])) {
            log.info("Cleaning test data...");
            
            // Delete test users
            userRepository.findByEmail("patient@test.com").ifPresent(user -> {
                userRepository.delete(user);
                log.info("Deleted test patient");
            });
            
            userRepository.findByEmail("tech@test.com").ifPresent(user -> {
                userRepository.delete(user);
                log.info("Deleted test technician");
            });
            
            userRepository.findByEmail("doctor@test.com").ifPresent(user -> {
                userRepository.delete(user);
                log.info("Deleted test doctor");
            });
            
            log.info("Test data cleaned successfully");
        }
    }
}

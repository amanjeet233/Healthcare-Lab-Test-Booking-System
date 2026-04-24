package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.LoginAttempt;
import com.healthcare.labtestbooking.repository.LoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LoginAttemptService {

    private final LoginAttemptRepository loginAttemptRepository;

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 30;

    public void recordFailedAttempt(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        LoginAttempt attempt = loginAttemptRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> LoginAttempt.builder()
                        .email(normalizedEmail)
                        .failedAttempts(0)
                        .build());

        attempt.setFailedAttempts(attempt.getFailedAttempts() + 1);
        attempt.setUpdatedAt(LocalDateTime.now());

        if (attempt.getFailedAttempts() >= MAX_ATTEMPTS) {
            attempt.setLockUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            log.warn("Account locked for {} due to {} failed attempts. Locked until: {}",
                    normalizedEmail, attempt.getFailedAttempts(), attempt.getLockUntil());
        } else {
            log.info("Failed login attempt {} of {} for: {}",
                    attempt.getFailedAttempts(), MAX_ATTEMPTS, normalizedEmail);
        }

        loginAttemptRepository.save(attempt);
    }

    public void clearFailedAttempts(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        if (loginAttemptRepository.existsByEmail(normalizedEmail)) {
            loginAttemptRepository.deleteByEmail(normalizedEmail);
            log.debug("Cleared failed login attempts for: {}", normalizedEmail);
        }
    }

    @Transactional(readOnly = true)
    public boolean isAccountLocked(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        Optional<LoginAttempt> attemptOpt = loginAttemptRepository.findByEmail(normalizedEmail);

        if (attemptOpt.isEmpty()) {
            return false;
        }

        LoginAttempt attempt = attemptOpt.get();

        if (attempt.getLockUntil() == null) {
            return false;
        }

        if (LocalDateTime.now().isBefore(attempt.getLockUntil())) {
            log.debug("Account {} is locked until {}", normalizedEmail, attempt.getLockUntil());
            return true;
        }

        return false;
    }

    public long getRemainingLockoutMinutes(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        return loginAttemptRepository.findByEmail(normalizedEmail)
                .filter(a -> a.getLockUntil() != null && LocalDateTime.now().isBefore(a.getLockUntil()))
                .map(a -> java.time.Duration.between(LocalDateTime.now(), a.getLockUntil()).toMinutes())
                .orElse(0L);
    }

    public int getRemainingAttempts(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        return loginAttemptRepository.findByEmail(normalizedEmail)
                .map(a -> Math.max(0, MAX_ATTEMPTS - a.getFailedAttempts()))
                .orElse(MAX_ATTEMPTS);
    }
}

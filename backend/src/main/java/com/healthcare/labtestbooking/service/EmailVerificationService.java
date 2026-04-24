package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.exception.InvalidCredentialsException;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmailVerificationService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final NotificationService notificationService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private static final long VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

    public void sendVerificationEmail(User user) {
        String email = user.getEmail();
        log.info("Generating verification token for: {}", email);

        String verificationToken = jwtService.generateVerificationToken(email);
        LocalDateTime expiry = LocalDateTime.now().plusHours(VERIFICATION_TOKEN_EXPIRY_HOURS);

        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(expiry);
        userRepository.save(user);

        String verificationLink = frontendUrl + "/verify-email?token=" + verificationToken;
        notificationService.sendVerificationEmail(email, verificationLink);

        log.info("Verification email sent to: {}. Token expires at: {}", email, expiry);
    }

    public void sendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (user.getIsVerified() != null && user.getIsVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        sendVerificationEmail(user);
    }

    public void verifyEmail(String token) {
        log.info("Processing email verification request");

        if (token == null || token.isBlank()) {
            throw new InvalidCredentialsException("Verification token is required");
        }

        if (!jwtService.isVerificationToken(token)) {
            throw new InvalidCredentialsException("Invalid or expired verification token");
        }

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired verification token"));

        if (user.getVerificationTokenExpiry() == null ||
                user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Verification token has expired. Please request a new one.");
        }

        if (user.getIsVerified() != null && user.getIsVerified()) {
            log.info("Email already verified for: {}", user.getEmail());
            return;
        }

        user.setIsVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);

        log.info("Email successfully verified for user: {}", user.getEmail());
    }

    @Transactional(readOnly = true)
    public boolean isEmailVerified(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim())
                .map(user -> user.getIsVerified() != null && user.getIsVerified())
                .orElse(false);
    }
}

package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.AuthResponse;
import com.healthcare.labtestbooking.dto.LoginRequest;
import com.healthcare.labtestbooking.dto.RegisterRequest;
import com.healthcare.labtestbooking.dto.ResetPasswordRequest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.exception.InvalidCredentialsException;
import com.healthcare.labtestbooking.exception.RegistrationFailedException;
import com.healthcare.labtestbooking.exception.UserAlreadyExistsException;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

        private static final Pattern EMAIL_PATTERN = Pattern
                        .compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
        private static final Pattern PASSWORD_PATTERN = Pattern
                        .compile("^(?=.*[A-Z])(?=.*\\d).{8,}$");
        private static final Pattern INDIAN_PHONE_PATTERN = Pattern.compile("^\\d{10}$");

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final NotificationService notificationService;
        private final LoginAttemptService loginAttemptService;
        private final EmailVerificationService emailVerificationService;
        private final AuditService auditService;

        public AuthResponse register(RegisterRequest request) {
                return registerUser(request);
        }

        public AuthResponse registerUser(RegisterRequest request) {
                log.info("========== REGISTER ATTEMPT ==========");

                try {
                        validateRegistrationRequest(request);

                        String email = request.getEmail().trim().toLowerCase();
                        String firstName = request.getFirstName().trim();
                        String lastName = request.getLastName().trim();
                        String fullName = firstName + " " + lastName;
                        String phoneNumber = request.getPhoneNumber().trim();

                        if (userRepository.existsByEmail(email)) {
                                log.info("Registration attempt with existing email - sending verification email to original owner");
                                // Generic success message to prevent email enumeration
                                return AuthResponse.builder()
                                                .message("User registered successfully. Please check your email for verification.")
                                                .build();
                        }

                        if (userRepository.existsByPhone(phoneNumber)) {
                                throw new UserAlreadyExistsException("Phone number already registered");
                        }

                        User user = new User();
                        user.setEmail(email);
                        user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
                        user.setName(fullName);
                        user.setPhone(phoneNumber);
                        user.setGender(request.getGender() != null
                                        ? Gender.valueOf(request.getGender().trim().toUpperCase())
                                        : null);
                        user.setAddress(request.getAddress());
                        user.setDateOfBirth(request.getDateOfBirth());
                        user.setBloodGroup(request.getBloodGroup());
                        user.setRole(UserRole.PATIENT); // Self-registration is ALWAYS Patient. Staff accounts created by Admin only.
                        user.setIsActive(true);
                        user.setIsVerified(false);
                        user.setCreatedAt(LocalDateTime.now());
                        user.setUpdatedAt(LocalDateTime.now());

                        User savedUser;
                        try {
                                savedUser = userRepository.save(user);
                                userRepository.flush();
                        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                                throw new UserAlreadyExistsException("Email or phone already registered");
                        }

                        sendVerificationEmail(savedUser);

                        String accessToken = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());
                        String refreshToken = jwtService.generateRefreshToken(savedUser.getEmail());

                        return AuthResponse.builder()
                                        .userId(savedUser.getId())
                                        .email(savedUser.getEmail())
                                        .name(savedUser.getName())
                                        .role(savedUser.getRole().name())
                                        .accessToken(accessToken)
                                        .refreshToken(refreshToken)
                                        .tokenType("Bearer")
                                        .message("User registered successfully")
                                        .build();
                } catch (UserAlreadyExistsException | IllegalArgumentException ex) {
                        log.warn("Registration failed: {}", ex.getMessage());
                        throw ex;
                } catch (Exception ex) {
                        log.error("Registration failed", ex);
                        throw new RegistrationFailedException("Registration failed: " + ex.getMessage(), ex);
                }
        }

        private void validateRegistrationRequest(RegisterRequest request) {
                if (request == null) {
                        throw new IllegalArgumentException("Request body is required");
                }

                String email = safeTrim(request.getEmail());
                String password = safeTrim(request.getPassword());
                String firstName = safeTrim(request.getFirstName());
                String lastName = safeTrim(request.getLastName());
                String phoneNumber = safeTrim(request.getPhoneNumber());

                if (firstName == null || firstName.length() < 2) {
                        throw new IllegalArgumentException("First name must be at least 2 characters");
                }
                if (lastName == null || lastName.length() < 2) {
                        throw new IllegalArgumentException("Last name must be at least 2 characters");
                }
                if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
                        throw new IllegalArgumentException("Email must be a valid format (user@domain.com)");
                }
                if (password == null || !PASSWORD_PATTERN.matcher(password).matches()) {
                        throw new IllegalArgumentException(
                                        "Password must be at least 8 characters and include one uppercase letter and one number");
                }
                if (phoneNumber == null || !INDIAN_PHONE_PATTERN.matcher(phoneNumber).matches()) {
                        throw new IllegalArgumentException("Phone number must be exactly 10 digits");
                }

                request.setEmail(email);
                request.setPassword(password);
                request.setFirstName(firstName);
                request.setLastName(lastName);
                request.setPhoneNumber(phoneNumber);
                request.setName(firstName + " " + lastName);
                request.setPhone(phoneNumber);
        }

        private String safeTrim(String value) {
                if (value == null) {
                        return null;
                }
                String trimmed = value.trim();
                return trimmed.isEmpty() ? null : trimmed;
        }

        private void sendVerificationEmail(User user) {
                try {
                        emailVerificationService.sendVerificationEmail(user);
                } catch (Exception e) {
                        // Don't fail registration if verification email fails
                        log.error("Failed to send verification email: {}", e.getMessage());
                }
        }

        public AuthResponse login(LoginRequest request) {
                return authenticateUser(request);
        }

        public AuthResponse authenticateUser(LoginRequest request) {
                log.info("========== LOGIN ATTEMPT ==========");

                // 1. Validate inputs
                String email = safeTrim(request == null ? null : request.getEmail());
                String password = request == null ? null : request.getPassword();

                if (email == null) {
                        throw new IllegalArgumentException("Email is required");
                }
                if (password == null || password.isEmpty()) {
                        throw new IllegalArgumentException("Password is required");
                }

                String normalizedEmail = email.toLowerCase();

                // 2. Check if account is locked due to failed attempts
                if (loginAttemptService.isAccountLocked(normalizedEmail)) {
                        long remainingMinutes = loginAttemptService.getRemainingLockoutMinutes(normalizedEmail);
                        log.warn("Login blocked - account locked");
                        throw new InvalidCredentialsException(
                                "Account temporarily locked due to multiple failed login attempts. " +
                                "Try again in " + remainingMinutes + " minutes or reset your password.");
                }

                // 3. Look up user – generic message to prevent email enumeration
                User user = userRepository.findByEmail(normalizedEmail)
                                .orElseGet(() -> {
                                        loginAttemptService.recordFailedAttempt(normalizedEmail);
                                        return null;
                                });

                if (user == null) {
                        throw new InvalidCredentialsException("Invalid email or password");
                }

                // 4. Active-account check
                if (user.getIsActive() == null || !user.getIsActive()) {
                        log.warn("Login attempt on disabled account");
                        throw new InvalidCredentialsException("Account disabled");
                }

                // 5. Email verification check (BYPASSED FOR TESTING - REMOVE COMMENTS TO RE-ENABLE)
                // if (user.getIsVerified() == null || !user.getIsVerified()) {
                //         log.warn("Login attempt on unverified account: {}", normalizedEmail);
                //         throw new InvalidCredentialsException(
                //                 "Please verify your email before logging in. " +
                //                 "Check your inbox for the verification link or request a new one.");
                // }

                // 6. BCrypt password comparison
                if (!passwordEncoder.matches(password, user.getPassword())) {
                        log.warn("Password mismatch");
                        loginAttemptService.recordFailedAttempt(normalizedEmail);
                        int remaining = loginAttemptService.getRemainingAttempts(normalizedEmail);
                        if (remaining > 0) {
                                throw new InvalidCredentialsException(
                                        "Invalid email or password. " + remaining + " attempt(s) remaining.");
                        }
                        throw new InvalidCredentialsException("Invalid email or password");
                }

                // 7. Success - clear failed attempts
                loginAttemptService.clearFailedAttempts(normalizedEmail);

                // 8. Generate tokens
                String roleName = user.getRole() != null ? user.getRole().name() : UserRole.PATIENT.name();
                String accessToken = jwtService.generateToken(user.getEmail(), roleName);
                String refreshToken = jwtService.generateRefreshToken(user.getEmail());

                // 9. Update last login timestamp
                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);

                // 10. Audit trail
                auditService.logAction(
                        user.getId(), user.getEmail(), roleName,
                        "USER_LOGIN", "AUTH", String.valueOf(user.getId()),
                        "User logged in successfully");

                log.info("========== LOGIN SUCCESS ==========");

                return AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .tokenType("Bearer")
                                .userId(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(roleName)
                                .message("Login successful")
                                .build();
        }

        public AuthResponse refreshToken(String refreshToken) {
                log.info("========== TOKEN REFRESH ATTEMPT ==========");

                if (refreshToken == null || refreshToken.isBlank()) {
                        throw new InvalidCredentialsException("Invalid or expired refresh token");
                }

                // Strip Bearer prefix if caller sends it
                String rawToken = refreshToken.startsWith("Bearer ") ? refreshToken.substring(7) : refreshToken;

                // 1. Validate token signature and expiry
                if (!jwtService.isTokenValid(rawToken)) {
                        log.warn("Refresh token failed validation");
                        throw new InvalidCredentialsException("Invalid or expired refresh token");
                }

                // 2. Extract username
                String username = jwtService.extractUsername(rawToken);
                if (username == null || username.isBlank()) {
                        throw new InvalidCredentialsException("Invalid or expired refresh token");
                }

                // 3. Confirm user still exists and is active
                User user = userRepository.findByEmail(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired refresh token"));

                if (user.getIsActive() == null || !user.getIsActive()) {
                        log.warn("Refresh token rejected – account disabled");
                        throw new InvalidCredentialsException("Account disabled");
                }

                // 4. Issue new access token; the refresh token itself is unchanged
                String roleName = user.getRole() != null ? user.getRole().name() : UserRole.PATIENT.name();
                String newAccessToken = jwtService.generateToken(user.getEmail(), roleName);

                log.info("========== TOKEN REFRESH SUCCESS ==========");

                return AuthResponse.builder()
                                .accessToken(newAccessToken)
                                .refreshToken(rawToken)
                                .tokenType("Bearer")
                                .userId(user.getId())
                                .email(user.getEmail())
                                .role(roleName)
                                .message("Token refreshed successfully")
                                .build();
        }

        /** Legacy alias – delegates to the new method so existing callers are unaffected. */
        public void forgotPassword(String email) {
                requestPasswordReset(email);
        }

        public String requestPasswordReset(String email) {
                log.info("========== PASSWORD RESET REQUEST ==========");

                if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException("Email is required");
                }
                String normalizedEmail = email.trim().toLowerCase();

                User user = userRepository.findByEmail(normalizedEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "No account found for email: " + normalizedEmail));

                // Generate a JWT whose 'type' claim is RESET – valid for exactly 1 hour
                String resetToken = jwtService.generatePasswordResetToken(normalizedEmail);
                LocalDateTime expiry = LocalDateTime.now().plusHours(1);

                user.setResetPasswordToken(resetToken);
                user.setResetPasswordTokenExpiry(expiry);
                userRepository.save(user);

                // Build the reset link and dispatch the notification
                String resetLink = "http://localhost:8080/reset-password?token=" + resetToken;
                notificationService.sendPasswordResetEmail(normalizedEmail, resetLink);

                log.info("Password reset token stored and email dispatched");
                log.info("Token expires at: {}", expiry);

                return "Password reset link has been sent to your email address";
        }

        public void resetPassword(ResetPasswordRequest request) {
                String rawToken = request.getToken();

                // Validate JWT signature, expiry, and RESET type claim
                if (!jwtService.isPasswordResetToken(rawToken)) {
                        throw new RuntimeException("Invalid or expired reset token");
                }

                User user = userRepository.findByResetPasswordToken(rawToken)
                                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

                // Double-check DB-stored expiry as a second layer of defence
                if (user.getResetPasswordTokenExpiry() == null
                                || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("Reset token has expired");
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                user.setResetPasswordToken(null);
                user.setResetPasswordTokenExpiry(null);
                userRepository.save(user);

                // Clear any lockouts so user can login immediately
                loginAttemptService.clearFailedAttempts(user.getEmail());

                log.info("Password successfully reset for user");
        }

        public boolean validateToken(String token) {
                try {
                        String tokenWithoutBearer = token.startsWith("Bearer ") ? token.substring(7) : token;
                        return jwtService.validateToken(tokenWithoutBearer);
                } catch (Exception e) {
                        return false;
                }
        }

        @Transactional
        public void changePassword(String currentPassword, String newPassword) {
                UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                                .getAuthentication().getPrincipal();
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                        throw new RuntimeException("Current password is incorrect");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
        }

        public String extractEmailFromToken(String token) {
                try {
                        String tokenWithoutBearer = token.startsWith("Bearer ") ? token.substring(7) : token;
                        return jwtService.extractUsername(tokenWithoutBearer);
                } catch (Exception e) {
                        log.error("Failed to extract email from token: {}", e.getMessage());
                        return null;
                }
        }
}

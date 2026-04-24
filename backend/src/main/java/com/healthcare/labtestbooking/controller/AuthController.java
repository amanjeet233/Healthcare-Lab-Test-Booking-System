package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.*;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.service.AuditService;
import com.healthcare.labtestbooking.service.AuthService;
import com.healthcare.labtestbooking.service.EmailVerificationService;
import com.healthcare.labtestbooking.service.TokenBlacklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.healthcare.labtestbooking.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User registration, login, and password management")
public class AuthController {

        private final AuthService authService;
        private final EmailVerificationService emailVerificationService;
        private final TokenBlacklistService tokenBlacklistService;
        private final AuditService auditService;
        private final UserRepository userRepository;

        @PostMapping("/register")
        @Operation(summary = "Register a new user", description = "Create a new user account with email and password")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.healthcare.labtestbooking.dto.ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or email already exists"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
                log.info("Received registration request");
                AuthResponse response = authService.register(request);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("User registered successfully", response));
        }

        @PostMapping("/login")
        @Operation(summary = "User login", description = "Authenticate user with email and password, returns JWT token")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid email or password"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
                log.info("Received login request");
                AuthResponse response = authService.login(request);
                return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        }

        @PostMapping("/forgot-password")
        @Operation(summary = "Request password reset", description = "Generate a JWT reset token and send it to the user's email")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset link sent"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User email not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
                log.info("Password reset request for user");
                String message = authService.requestPasswordReset(email);
                return ResponseEntity.ok(ApiResponse.success(message, "Check your email for reset instructions"));
        }

        @PostMapping("/reset-password")
        @Operation(summary = "Reset password", description = "Reset user password with reset token")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired token"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
                log.info("Reset password request with token");
                authService.resetPassword(request);
                return ResponseEntity.ok(ApiResponse.success("Password reset successfully",
                                "You can now login with your new password"));
        }

        @PostMapping("/refresh-token")
        @Operation(summary = "Refresh access token", description = "Exchange a valid refresh token for a new access token")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Refresh token is required"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
        })
        public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
                        @RequestHeader(value = "Refresh-Token", required = false) String refreshToken) {
                log.info("Token refresh request received");
                if (refreshToken == null || refreshToken.isBlank()) {
                        log.warn("Refresh token endpoint called without Refresh-Token header");
                        return ResponseEntity.badRequest()
                                .body(ApiResponse.error("Refresh token is required in Refresh-Token header"));
                }
                AuthResponse response = authService.refreshToken(refreshToken);
                return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
        }

        @PostMapping("/verify-email")
        @Operation(summary = "Verify email address", description = "Verify user email using the token sent to their email")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Email verified successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired token"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
                log.info("Email verification request received");
                emailVerificationService.verifyEmail(token);
                return ResponseEntity.ok(ApiResponse.success("Email verified successfully",
                                "You can now login with your account"));
        }

        @PostMapping("/resend-verification")
        @Operation(summary = "Resend verification email", description = "Request a new verification email to be sent")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Verification email sent"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Email already verified or user not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<String>> resendVerificationEmail(@RequestParam String email) {
                log.info("Received request to generate password reset token");
                emailVerificationService.sendVerificationEmail(email);
                return ResponseEntity.ok(ApiResponse.success("Verification email sent",
                                "Check your inbox for the verification link"));
        }

        @PostMapping("/change-password")
        @Operation(summary = "Change password", description = "Change user password with current password verification")
        @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "Bearer Authentication")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password changed successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid currentPassword or passwords don't match"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized - user not authenticated"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<String>> changePassword(
                        @Valid @RequestBody ChangePasswordRequest request,
                        @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
                log.info("Change password request for user");
                try {
                        authService.changePassword(request.getCurrentPassword(), request.getNewPassword());
                        return ResponseEntity.ok(ApiResponse.success("Password changed successfully",
                                        "Your password has been updated. Please use your new password for future logins."));
                } catch (RuntimeException e) {
                        log.warn("Password change failed: {}", e.getMessage());
                        return ResponseEntity.badRequest().body(ApiResponse.error(
                                        e.getMessage() != null ? e.getMessage() : "Failed to change password"));
                }
        }

        @PostMapping("/logout")
        @Operation(summary = "Logout user", description = "Invalidate the current access token")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logged out successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "No token provided")
        })
        public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        tokenBlacklistService.blacklistToken(token);
                        String email = authService.extractEmailFromToken(token);
                        log.info("User logged out, token blacklisted");
                        Long userId = null;
                        String role = null;
                        if (email != null) {
                                var user = userRepository.findByEmail(email).orElse(null);
                                if (user != null) {
                                        userId = user.getId();
                                        role = user.getRole() != null ? user.getRole().name() : null;
                                }
                        }
                        auditService.logAction(
                                userId, email, role,
                                "USER_LOGOUT", "AUTH", email != null ? email : "N/A",
                                "User logged out", request.getRemoteAddr());
                }
                return ResponseEntity.ok(ApiResponse.success("Logged out successfully",
                                "Your session has been terminated"));
        }

        @PostMapping("/logout-all")
        @Operation(summary = "Logout from all devices", description = "Invalidate all tokens for the current user")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Logged out from all devices"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "No token provided")
        })
        public ResponseEntity<ApiResponse<String>> logoutAll(HttpServletRequest request) {
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        String email = authService.extractEmailFromToken(token);
                        if (email != null) {
                                tokenBlacklistService.blacklistAllUserTokens(email);
                                log.info("User {} logged out from all devices", email);
                        }
                }
                return ResponseEntity.ok(ApiResponse.success("Logged out from all devices",
                                "All your sessions have been terminated"));
        }
}


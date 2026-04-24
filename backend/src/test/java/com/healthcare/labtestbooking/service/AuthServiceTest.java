package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.AuthResponse;
import com.healthcare.labtestbooking.dto.LoginRequest;
import com.healthcare.labtestbooking.dto.RegisterRequest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.exception.InvalidCredentialsException;
import com.healthcare.labtestbooking.exception.UserAlreadyExistsException;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private LoginAttemptService loginAttemptService;

    @Mock
    private EmailVerificationService emailVerificationService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("Password123")
                .firstName("Test")
                .lastName("User")
                .phoneNumber("9876543210")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("Password123")
                .build();

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setName("Test User");
        user.setPhone("9876543210");
        user.setRole(UserRole.PATIENT);
        user.setIsActive(true);
        user.setIsVerified(true);
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhoneNumber())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(anyString(), anyString())).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(anyString())).thenReturn("refreshToken");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo(registerRequest.getEmail());
        assertThat(response.getName()).isEqualTo("Test User");
        assertThat(response.getRole()).isEqualTo(UserRole.PATIENT.name());
        verify(userRepository).save(any(User.class));
        verify(userRepository).flush();
    }

    @Test
    void register_UserAlreadyExists_ThrowsException() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(registerRequest));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        when(loginAttemptService.isAccountLocked(loginRequest.getEmail())).thenReturn(false);
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtService.generateToken(user.getEmail(), user.getRole().name())).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(user.getEmail())).thenReturn("refreshToken");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo(user.getEmail());
        assertThat(response.getName()).isEqualTo(user.getName());
        verify(loginAttemptService).clearFailedAttempts(loginRequest.getEmail());
        verify(userRepository).save(user);
    }

    @Test
    void login_InvalidCredentials_ThrowsException() {
        when(loginAttemptService.isAccountLocked(loginRequest.getEmail())).thenReturn(false);
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(false);
        when(loginAttemptService.getRemainingAttempts(loginRequest.getEmail())).thenReturn(4);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequest));

        verify(loginAttemptService).recordFailedAttempt(loginRequest.getEmail());
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        when(loginAttemptService.isAccountLocked(loginRequest.getEmail())).thenReturn(false);
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequest));

        verify(loginAttemptService).recordFailedAttempt(loginRequest.getEmail());
    }
}

package com.healthcare.labtestbooking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.LoginRequest;
import com.healthcare.labtestbooking.dto.RegisterRequest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ApiFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Clean up any test data before each test to adhere to the independent tests
        // principle
        userRepository.findByEmail("testpatient_e2e@test.com").ifPresent(userRepository::delete);
    }

    @AfterEach
    void tearDown() {
        // Clean up after each test
        userRepository.findByEmail("testpatient_e2e@test.com").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Should successfully register a new patient (AAA Pattern)")
    void shouldRegisterNewPatient() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("E2E");
        request.setLastName("Patient");
        request.setName("E2E Patient");
        request.setEmail("testpatient_e2e@test.com");
        request.setPassword("Password123");
        request.setPhoneNumber("9998887776");
        request.setRole(UserRole.PATIENT);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    @DisplayName("Should return 409 Conflict when registering duplicate email")
    void shouldRejectDuplicateRegistration() throws Exception {
        // Arrange - Register first time
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("E2E");
        request.setLastName("Patient");
        request.setName("E2E Patient");
        request.setEmail("testpatient_e2e@test.com");
        request.setPassword("Password123");
        request.setPhoneNumber("9998887776");
        request.setRole(UserRole.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Act - Attempt duplicate registration
        // Modify phone to ensure we hit email duplication error, not phone
        request.setPhoneNumber("9112223334");

        // Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    @DisplayName("Should authenticate and return JWT token for valid credentials")
    void shouldLoginSuccessfully() throws Exception {
        // Arrange - Register a user first
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("E2E");
        request.setLastName("Patient");
        request.setName("E2E Patient");
        request.setEmail("testpatient_e2e@test.com");
        request.setPassword("Password123");
        request.setPhoneNumber("9998887776");
        request.setRole(UserRole.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("testpatient_e2e@test.com");
        loginRequest.setPassword("Password123");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    @Test
    @DisplayName("Should return 401 Unauthorized for invalid password")
    void shouldRejectInvalidPassword() throws Exception {
        // Arrange - Register a user first
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("E2E");
        request.setLastName("Patient");
        request.setName("E2E Patient");
        request.setEmail("testpatient_e2e@test.com");
        request.setPassword("Password123");
        request.setPhoneNumber("9998887776");
        request.setRole(UserRole.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("testpatient_e2e@test.com");
        loginRequest.setPassword("wrongpassword");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value(true));
    }
}

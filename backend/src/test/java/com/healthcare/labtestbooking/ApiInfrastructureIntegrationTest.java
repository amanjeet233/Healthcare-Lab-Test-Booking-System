package com.healthcare.labtestbooking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.RegisterRequest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.security.admin-ip-whitelist.enabled=true",
        "app.security.admin-ip-whitelist.ips=10.10.10.10",
        "app.features.api-v1-enabled=true",
        "app.features.request-correlation-enabled=true"
})
class ApiInfrastructureIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    void cleanup() {
        userRepository.findByEmail("versioned_user@test.com").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Should allow /api/v1 auth endpoint via versioning shim")
    void shouldSupportApiV1Prefix() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Versioned");
        request.setLastName("User");
        request.setName("Versioned User");
        request.setEmail("versioned_user@test.com");
        request.setPassword("Password123");
        request.setPhoneNumber("9991112233");
        request.setRole(UserRole.PATIENT);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Should block /api/admin path when caller IP is not allowlisted")
    void shouldBlockAdminPathForNonAllowlistedIp() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .with(remoteAddr("192.168.10.15")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should include correlation id header")
    void shouldIncludeCorrelationIdHeader() throws Exception {
        mockMvc.perform(get("/api/health/public"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Correlation-Id"));
    }

    private RequestPostProcessor remoteAddr(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }
}


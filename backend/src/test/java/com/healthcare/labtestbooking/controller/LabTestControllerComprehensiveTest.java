package com.healthcare.labtestbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.LabTestDTO;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.service.LabTestService;
import com.healthcare.labtestbooking.service.TestPackageService;
import com.healthcare.labtestbooking.service.TestPopularityService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Lab Test Controller - Comprehensive API Tests")
class LabTestControllerComprehensiveTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LabTestService labTestService;

    @MockBean
    private TestPackageService testPackageService;

    @MockBean
    private TestPopularityService testPopularityService;

    @Test
    @DisplayName("GET /api/lab-tests - Should retrieve all active tests with pagination")
    void testGetAllTests() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD01")
                .description("Complete blood count")
                .price(new BigDecimal("500"))
                .build();

        Page<LabTestDTO> page = new PageImpl<>(Arrays.asList(testDTO), PageRequest.of(0, 20), 1);
        when(labTestService.getAllActiveTests(any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].testName").value("Blood Test"));
    }

    @Test
    @DisplayName("GET /api/lab-tests/{id} - Should retrieve test by ID")
    void testGetTestById() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD01")
                .build();
        when(labTestService.getTestById(1L)).thenReturn(testDTO);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.testName").value("Blood Test"));
    }

    @Test
    @DisplayName("GET /api/lab-tests/code/{code} - Should retrieve test by code")
    void testGetTestByCode() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD01")
                .build();
        when(labTestService.getTestByCode("BLOOD01")).thenReturn(testDTO);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/code/BLOOD01")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.testCode").value("BLOOD01"));
    }

    @Test
    @DisplayName("GET /api/lab-tests/slug/{slug} - Should retrieve test by slug")
    void testGetTestBySlug() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("blood-test-101")
                .build();
        when(labTestService.getTestByCode("blood-test-101")).thenReturn(testDTO);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/slug/blood-test-101")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.testCode").value("blood-test-101"));
    }

    @Test
    @DisplayName("GET /api/lab-tests/search - Should search tests by keyword")
    void testSearchTests() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD01")
                .build();

        Page<LabTestDTO> page = new PageImpl<>(Arrays.asList(testDTO), PageRequest.of(0, 20), 1);
        when(labTestService.searchTests(anyString(), any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/search?keyword=blood")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].testName").value("Blood Test"));
    }

    @Test
    @DisplayName("GET /api/lab-tests/popular - Should retrieve popular tests")
    void testGetPopularTests() throws Exception {
        // Arrange
        List<LabTestDTO> tests = Arrays.asList(
                LabTestDTO.builder().id(1L).testName("Blood Test").testCode("BLOOD01").build(),
                LabTestDTO.builder().id(2L).testName("Thyroid Test").testCode("THY01").build()
        );
        when(labTestService.getPopularTests()).thenReturn(tests);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/popular")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    @DisplayName("GET /api/lab-tests/packages - Should retrieve all packages")
    void testGetAllPackages() throws Exception {
        // Arrange
        TestPackage pkg = TestPackage.builder()
                .id(1L)
                .packageName("Basic Health Package")
                .totalPrice(new BigDecimal("2000"))
                .build();
        
        when(testPackageService.getAllPackages()).thenReturn(Arrays.asList(pkg));

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/packages")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("Basic Health Package"));
    }

    @Test
    @DisplayName("GET /api/lab-tests/advanced - Should perform advanced search with filters")
    void testAdvancedSearch() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD01")
                .price(new BigDecimal("500"))
                .build();

        Page<LabTestDTO> page = new PageImpl<>(Arrays.asList(testDTO), PageRequest.of(0, 18), 1);
        when(labTestService.getAdvancedSearchTests(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/advanced?search=blood&min_price=400&max_price=600")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

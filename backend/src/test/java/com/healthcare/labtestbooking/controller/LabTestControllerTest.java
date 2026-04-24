package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.LabTestDTO;
import com.healthcare.labtestbooking.service.LabTestService;
import com.healthcare.labtestbooking.service.TestPackageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Lab Test Controller Tests")
class LabTestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LabTestService labTestService;

    @MockBean
    private TestPackageService testPackageService;

    @Test
    @DisplayName("Should get all tests with pagination")
    void testGetAllTests() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD001")
                .price(BigDecimal.valueOf(499.00))
                .build();

        Page<LabTestDTO> page = new PageImpl<>(List.of(testDTO));
        when(labTestService.getAllActiveTests(any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests")
                .param("page", "0")
                .param("size", "20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].testName").value("Blood Test"));
    }

    @Test
    @DisplayName("Should get test by ID")
    void testGetTestById() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD001")
                .price(BigDecimal.valueOf(499.00))
                .build();

        when(labTestService.getTestById(1L)).thenReturn(testDTO);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.testName").value("Blood Test"));
    }

    @Test
    @DisplayName("Should get test by code")
    void testGetTestByCode() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD001")
                .price(BigDecimal.valueOf(499.00))
                .build();

        when(labTestService.getTestByCode("BLOOD001")).thenReturn(testDTO);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/code/BLOOD001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.testCode").value("BLOOD001"));
    }

    @Test
    @DisplayName("Should get test by slug")
    void testGetTestBySlug() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("blood-test")
                .price(BigDecimal.valueOf(499.00))
                .build();

        when(labTestService.getTestByCode("blood-test")).thenReturn(testDTO);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/slug/blood-test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.testCode").value("blood-test"));
    }

    @Test
    @DisplayName("Should search tests by keyword")
    void testSearchTests() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD001")
                .price(BigDecimal.valueOf(499.00))
                .build();

        Page<LabTestDTO> page = new PageImpl<>(List.of(testDTO));
        when(labTestService.searchTests(eq("blood"), any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/search")
                .param("keyword", "blood"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)));
    }

    @Test
    @DisplayName("Should get popular tests")
    void testGetPopularTests() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD001")
                .price(BigDecimal.valueOf(499.00))
                .build();

        when(labTestService.getPopularTests()).thenReturn(List.of(testDTO));

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @DisplayName("Should get trending tests")
    void testGetTrendingTests() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD001")
                .price(BigDecimal.valueOf(499.00))
                .build();

        when(labTestService.getTrendingTests()).thenReturn(List.of(testDTO));

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/trending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @DisplayName("Should get tests by price range")
    void testGetTestsByPriceRange() throws Exception {
        // Arrange
        LabTestDTO testDTO = LabTestDTO.builder()
                .id(1L)
                .testName("Blood Test")
                .testCode("BLOOD001")
                .price(BigDecimal.valueOf(499.00))
                .build();

        Page<LabTestDTO> page = new PageImpl<>(List.of(testDTO));
        when(labTestService.getTestsByPriceRange(
                eq(BigDecimal.valueOf(400)),
                eq(BigDecimal.valueOf(600)),
                any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/price-range")
                .param("min", "400")
                .param("max", "600"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)));
    }

    @Test
    @DisplayName("Should return 404 when test not found")
    void testGetTestNotFound() throws Exception {
        // Arrange
        when(labTestService.getTestById(999L))
                .thenThrow(new RuntimeException("Test not found"));

        // Act & Assert
        mockMvc.perform(get("/api/lab-tests/999"))
                .andExpect(status().isInternalServerError());
    }
}

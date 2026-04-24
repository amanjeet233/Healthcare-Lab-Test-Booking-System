package com.healthcare.labtestbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.config.TestSecurityConfig;
import com.healthcare.labtestbooking.dto.BookingRequest;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.entity.enums.CollectionType;
import com.healthcare.labtestbooking.security.JwtUtil;
import com.healthcare.labtestbooking.security.UserDetailsServiceImpl;
import com.healthcare.labtestbooking.service.BookingService;
import com.healthcare.labtestbooking.service.TokenBlacklistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingController.class)
@Import(TestSecurityConfig.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @WithMockUser(roles = "PATIENT")
    void createBooking_Success() throws Exception {
        BookingRequest request = new BookingRequest();
        request.setTestId(1L);
        request.setPatientId(1L);
        request.setBookingDate(LocalDate.now().plusDays(1));
        request.setTimeSlot("09:00-10:00");
        request.setCollectionType(CollectionType.LAB.name());

        BookingResponse response = new BookingResponse();
        response.setId(1L);
        response.setBookingReference("BOOK123");

        when(bookingService.createBooking(any(BookingRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void assignTechnician_Success() throws Exception {
        BookingResponse response = new BookingResponse();
        response.setId(1L);
        response.setTechnicianId(7L);
        response.setTechnicianName("Tech One");

        when(bookingService.assignTechnician(eq(1L), eq(7L))).thenReturn(response);

        mockMvc.perform(put("/api/bookings/1/technician")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("technicianId", 7L))))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void assignTechnician_BadRequest_WhenMissingTechnicianId() throws Exception {
        mockMvc.perform(put("/api/bookings/1/technician")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of())))
                .andExpect(status().isBadRequest());
    }
}

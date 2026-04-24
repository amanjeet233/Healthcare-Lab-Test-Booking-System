package com.healthcare.labtestbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.CreatePaymentOrderRequest;
import com.healthcare.labtestbooking.dto.PaymentResponse;
import com.healthcare.labtestbooking.dto.PaymentLinkResponse;
import com.healthcare.labtestbooking.service.PaymentService;
import com.healthcare.labtestbooking.entity.enums.PaymentMethod;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Payment Controller Tests")
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentService paymentService;

    @Test
    @DisplayName("Should create payment order")
    @WithMockUser(roles = "USER")
    void testCreatePaymentOrder() throws Exception {
        // Arrange
        CreatePaymentOrderRequest request = CreatePaymentOrderRequest.builder()
                .orderId(1L)
                .amount(new BigDecimal("500"))
                .build();

        PaymentResponse response = PaymentResponse.builder()
                .transactionId("TXN-12345")
                .bookingId(1L)
                .amount(new BigDecimal("500"))
                .status("PENDING")
                .build();

        when(paymentService.createGatewayPayment(any())).thenReturn(PaymentLinkResponse.builder().paymentLink("https://mock").build());

        // Act & Assert
        mockMvc.perform(post("/api/payments/create-order")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @DisplayName("Should get payment status")
    @WithMockUser(roles = "USER")
    void testGetPaymentStatus() throws Exception {
        // Arrange
        PaymentResponse response = PaymentResponse.builder()
                .transactionId("TXN-12345")
                .bookingId(1L)
                .amount(new BigDecimal("500"))
                .status("SUCCESS")
                .build();

        when(paymentService.processPayment(any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/payments/status/ORDER-12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("Should handle payment webhook")
    void testPaymentWebhook() throws Exception {
        // Arrange
        String webhookPayload = "{" +
                "\"event\": \"payment.success\"," +
                "\"payload\": {" +
                "\"payment_id\": \"pay_123\"," +
                "\"order_id\": \"ORDER-12345\"," +
                "\"amount\": 50000," +
                "\"status\": \"captured\"" +
                "}" +
                "}";

        // Act & Assert
        mockMvc.perform(post("/api/payments/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(webhookPayload))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle payment failure webhook")
    void testPaymentFailureWebhook() throws Exception {
        // Arrange
        String webhookPayload = "{" +
                "\"event\": \"payment.failed\"," +
                "\"payload\": {" +
                "\"payment_id\": \"pay_123\"," +
                "\"order_id\": \"ORDER-12345\"," +
                "\"status\": \"failed\"" +
                "}" +
                "}";

        // For webhook testing, we can skip detailed verification
        // Act & Assert
        mockMvc.perform(post("/api/payments/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(webhookPayload))
                .andExpect(status().isOk());
    }
}

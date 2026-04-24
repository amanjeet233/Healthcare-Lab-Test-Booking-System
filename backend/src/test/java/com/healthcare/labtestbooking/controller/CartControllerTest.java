package com.healthcare.labtestbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.CartRequest;
import com.healthcare.labtestbooking.dto.CartResponse;
import com.healthcare.labtestbooking.service.CartService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Cart Controller Tests")
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CartService cartService;

    @Test
    @DisplayName("Should get user cart")
    @WithMockUser(roles = "USER")
    void testGetCart() throws Exception {
        // Arrange
        when(cartService.getCart(any())).thenReturn(CartResponse.builder()
                .items(java.util.Collections.emptyList())
                .totalPrice(new java.math.BigDecimal("2500.0"))
                .build());

        // Act & Assert
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should add test to cart")
    @WithMockUser(roles = "USER")
    void testAddToCart() throws Exception {
        // Arrange
        when(cartService.addTestToCart(any(), any())).thenReturn(CartResponse.builder()
                .items(java.util.Collections.emptyList())
                .totalPrice(new java.math.BigDecimal("500"))
                .build());

        // Act & Assert
        mockMvc.perform(post("/api/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"testId\": 1, \"quantity\": 1}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should remove item from cart")
    @WithMockUser(roles = "USER")
    void testRemoveFromCart() throws Exception {
        // Arrange
        when(cartService.removeFromCart(any(), any())).thenReturn(CartResponse.builder()
                .items(java.util.Collections.emptyList())
                .totalPrice(new java.math.BigDecimal("1500"))
                .build());

        // Act & Assert
        mockMvc.perform(delete("/api/cart/items/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should clear entire cart")
    @WithMockUser(roles = "USER")
    void testClearCart() throws Exception {
        // Arrange
        when(cartService.clearCart(any())).thenReturn(CartResponse.builder()
                .items(java.util.Collections.emptyList())
                .totalPrice(new java.math.BigDecimal("0"))
                .build());

        // Act & Assert
        mockMvc.perform(delete("/api/cart/clear"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update cart item quantity")
    @WithMockUser(roles = "USER")
    void testUpdateQuantity() throws Exception {
        // Arrange
        when(cartService.updateQuantity(any(), any(), any())).thenReturn(CartResponse.builder()
                .items(java.util.Collections.emptyList())
                .totalPrice(new java.math.BigDecimal("1000"))
                .build());

        // Act & Assert
        mockMvc.perform(put("/api/cart/items/1/quantity")
                .param("quantity", "2"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle empty cart")
    @WithMockUser(roles = "USER")
    void testEmptyCart() throws Exception {
        // Arrange
        when(cartService.getCart(any())).thenReturn(CartResponse.builder()
                .items(java.util.Collections.emptyList())
                .totalPrice(new java.math.BigDecimal("0"))
                .build());

        // Act & Assert
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk());
    }
}

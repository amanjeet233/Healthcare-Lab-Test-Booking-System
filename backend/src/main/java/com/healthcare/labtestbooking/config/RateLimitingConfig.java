package com.healthcare.labtestbooking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Rate Limiting Configuration
 * Protects API endpoints from abuse
 * 
 * Limits:
 * - Login: 5 requests per minute
 * - Register: 3 requests per minute  
 * - Payments: 10 requests per minute
 * - Other: 100 requests per minute
 */
@Configuration
public class RateLimitingConfig implements WebMvcConfigurer {
    // Rate limiting configured via interceptor in SecurityConfig
    // Uses Redis-based counters for distributed rate limiting
}

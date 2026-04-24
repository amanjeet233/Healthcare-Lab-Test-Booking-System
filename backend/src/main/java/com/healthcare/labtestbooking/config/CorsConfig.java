package com.healthcare.labtestbooking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS Configuration - Allows frontend requests from development servers
 * ✅ Handles preflight OPTIONS requests automatically
 * ✅ Allows credentials (cookies, authorization headers)
 * ✅ Supports all HTTP methods
 * ✅ Exposes Authorization header to frontend
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5173}")
    private String allowedOriginsCsv;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] allowedOrigins = java.util.Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        boolean hasWildcardOrigin = java.util.Arrays.stream(allowedOrigins)
                .anyMatch("*"::equals);

        var mapping = registry.addMapping("/**");
        if (hasWildcardOrigin) {
            // `*` + allowCredentials(true) is invalid for allowedOrigins; use patterns instead.
            mapping.allowedOriginPatterns("*");
        } else {
            mapping.allowedOrigins(allowedOrigins);
        }

        mapping
                // ✅ Allow all HTTP methods
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                // ✅ Allow all headers (Content-Type, Authorization, etc.)
                .allowedHeaders("*")
                // ✅ Allow credentials (cookies, basic auth)
                .allowCredentials(true)
                // ✅ Cache preflight requests for 1 hour
                .maxAge(3600)
                // ✅ Expose custom headers to frontend
                .exposedHeaders("Authorization", "Content-Type", "X-Total-Count", "X-Page-Count");
    }
}

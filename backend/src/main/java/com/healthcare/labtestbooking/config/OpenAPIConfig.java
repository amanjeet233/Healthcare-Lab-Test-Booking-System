package com.healthcare.labtestbooking.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "JWT token for API authentication"
)
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        Contact contact = new Contact()
                .name("Healthcare Lab Test Booking Support")
                .email("support@labtestbooking.com")
                .url("https://labtestbooking.com");

        Info info = new Info()
                .title("Healthcare Lab Test Booking API")
                .version("1.0.0")
                .description("Complete REST API documentation for the Healthcare Lab Test Booking System. " +
                        "This API provides comprehensive endpoints for managing lab test bookings, user authentication, " +
                        "payments, medical officers, technicians, reports, and administrative analytics.")
                .contact(contact)
                .license(new License()
                        .name("Apache 2.0")
                        .url("https://www.apache.org/licenses/LICENSE-2.0.html"));

        return new OpenAPI().info(info);
    }
}

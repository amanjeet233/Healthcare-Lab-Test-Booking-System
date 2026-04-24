package com.healthcare.labtestbooking.config;

import com.healthcare.labtestbooking.filter.RateLimitingFilter;
import com.healthcare.labtestbooking.security.JwtAuthenticationEntryPoint;
import com.healthcare.labtestbooking.security.JwtAuthenticationFilter;
import com.healthcare.labtestbooking.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final UserDetailsServiceImpl userDetailsService;
    private final RateLimitingFilter rateLimitingFilter;
    @Value("${app.security.h2-console.enabled:false}")
    private boolean h2ConsoleEnabled;
    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:5174,http://127.0.0.1:5173}")
    private String allowedOriginsCsv;

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> allowedOrigins = Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        boolean hasWildcardOrigin = allowedOrigins.stream().anyMatch("*"::equals);
        if (hasWildcardOrigin) {
            // `*` + allowCredentials(true) is invalid for allowedOrigins; use patterns instead.
            configuration.setAllowedOriginPatterns(List.of("*"));
        } else {
            configuration.setAllowedOrigins(allowedOrigins);
        }

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "X-Total-Count",
                "X-Page-Number"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("Configuring security filter chain");

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                        auth.requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/api/public/**").permitAll()
                                .requestMatchers("/api/health/**").permitAll()
                                .requestMatchers("/actuator/health").permitAll()
                                .requestMatchers("/actuator/info").permitAll()
                                .requestMatchers("/swagger-ui/**").permitAll()
                                .requestMatchers("/swagger-ui.html").permitAll()
                                .requestMatchers("/api-docs/**").permitAll()
                                .requestMatchers("/v3/api-docs/**").permitAll()
                                .requestMatchers("/error").permitAll()
                                .requestMatchers("/").permitAll()
                                .requestMatchers("/index.html").permitAll()
                                .requestMatchers("/api/bookings/slots").permitAll()

                                // Protected lab-test endpoint used by technician result entry
                                .requestMatchers(HttpMethod.GET, "/api/lab-tests/*/parameters")
                                .hasAnyRole("TECHNICIAN", "MEDICAL_OFFICER", "ADMIN")

                                // Public catalog endpoints
                                .requestMatchers(HttpMethod.GET, "/api/lab-tests/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/labs/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/tests/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/test-packages/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/packages/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/slots/available").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/slots/check").permitAll()
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                // External callbacks
                                .requestMatchers(HttpMethod.POST, "/api/payments/webhook").permitAll()

                                .requestMatchers("/api/reports/booking/**")
                                .hasAnyRole("PATIENT", "TECHNICIAN", "MEDICAL_OFFICER")
                                .requestMatchers("/api/reports/results").hasRole("TECHNICIAN")
                                .requestMatchers("/api/cart/**")
                                .hasAnyRole("PATIENT", "ADMIN")
                                .requestMatchers("/api/bookings/**")
                                .hasAnyRole("PATIENT", "TECHNICIAN", "MEDICAL_OFFICER", "ADMIN")
                                .requestMatchers("/api/users/**")
                                .hasAnyRole("PATIENT", "TECHNICIAN", "MEDICAL_OFFICER", "ADMIN")
                                .requestMatchers("/api/admin/**").hasRole("ADMIN");

                        if (h2ConsoleEnabled) {
                            auth.requestMatchers("/h2-console/**").permitAll();
                        }

                        auth.anyRequest().authenticated();
                    })
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(rateLimitingFilter, JwtAuthenticationFilter.class);

        http.headers(headers -> {
            if (h2ConsoleEnabled) {
                headers.frameOptions(frameOptions -> frameOptions.disable());
            } else {
                headers.frameOptions(frameOptions -> frameOptions.sameOrigin());
            }
        });

        return http.build();
    }
}

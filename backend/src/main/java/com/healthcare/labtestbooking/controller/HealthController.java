package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * Kubernetes probes: liveness, readiness
 * Public health status endpoint
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
public class HealthController {

    private final DataSource dataSource;
    private final RedisTemplate<String, String> redisTemplate;

    /**
     * Liveness probe - is the application running?
     */
    @GetMapping("/live")
    public ResponseEntity<?> liveness() {
        log.debug("Liveness probe called");
        return ResponseEntity.ok(ApiResponse.success("UP", null));
    }

    /**
     * Readiness probe - is the application ready to accept traffic?
     */
    @GetMapping("/ready")
    public ResponseEntity<?> readiness() {
        try {
            // Check database
            try (Connection connection = dataSource.getConnection()) {
                if (!connection.isValid(5)) {
                    return ResponseEntity.status(503)
                            .body(ApiResponse.error("Database not ready"));
                }
            }

            // Check Redis
            try {
                redisTemplate.getConnectionFactory().getConnection().ping();
            } catch (Exception e) {
                return ResponseEntity.status(503)
                        .body(ApiResponse.error("Redis not ready"));
            }

            log.debug("Readiness probe: all systems OK");
            return ResponseEntity.ok(ApiResponse.success("Ready"));

        } catch (Exception e) {
            log.error("Readiness check failed", e);
            return ResponseEntity.status(503)
                    .body(ApiResponse.error("Not ready"));
        }
    }

    /**
     * Public health status - no authentication required
     */
    @GetMapping("/public")
    public ResponseEntity<?> publicHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        response.put("uptime", getUptime());

        return ResponseEntity.ok(ApiResponse.success("Health check", response));
    }

    /**
     * Detailed health metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<?> healthMetrics() {
        try {
            Map<String, Object> metrics = new HashMap<>();

            // Database metrics
            try (Connection connection = dataSource.getConnection()) {
                metrics.put("database", connection.isValid(5) ? "OK" : "FAILED");
            }

            // Redis metrics
            try {
                redisTemplate.getConnectionFactory().getConnection().ping();
                metrics.put("redis", "OK");
            } catch (Exception e) {
                metrics.put("redis", "FAILED");
            }

            metrics.put("timestamp", LocalDateTime.now());
            metrics.put("jvm_memory_used", Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory());
            metrics.put("jvm_memory_max", Runtime.getRuntime().maxMemory());
            metrics.put("jvm_threads", Thread.activeCount());

            return ResponseEntity.ok(ApiResponse.success("Health metrics", metrics));

        } catch (Exception e) {
            log.error("Error retrieving health metrics", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Error retrieving metrics"));
        }
    }

    private String getUptime() {
        long uptime = System.currentTimeMillis() / 1000; // seconds
        long hours = uptime / 3600;
        long minutes = (uptime % 3600) / 60;
        return String.format("%d hours %d minutes", hours, minutes);
    }
}

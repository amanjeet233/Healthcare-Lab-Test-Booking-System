package com.healthcare.labtestbooking.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisHealthIndicator implements HealthIndicator {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisHealthIndicator(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Health health() {
        try {
            // Test Redis connection with PING command
            var factory = redisTemplate.getConnectionFactory();
            if (factory == null) {
                return Health.down().withDetail("reason", "Connection factory is null").build();
            }
            
            var connection = factory.getConnection();
            if (connection == null) {
                return Health.down().withDetail("reason", "Connection is null").build();
            }
            
            String result = connection.ping();

            if ("PONG".equals(result)) {
                return Health.up()
                        .withDetail("cache", "Redis")
                        .withDetail("status", "Connected")
                        .build();
            } else {
                return Health.down()
                        .withDetail("cache", "Redis")
                        .withDetail("reason", "Unexpected response: " + result)
                        .build();
            }
        } catch (Exception e) {
            return Health.down()
                    .withDetail("cache", "Redis")
                    .withDetail("reason", "Connection failed: " + e.getMessage())
                    .withException(e)
                    .build();
        }
    }
}


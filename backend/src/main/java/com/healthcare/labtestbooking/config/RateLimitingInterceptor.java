package com.healthcare.labtestbooking.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

/**
 * Rate Limiting Interceptor
 * Uses Redis for distributed rate limiting across multiple servers
 */
@Component
@Slf4j
public class RateLimitingInterceptor implements HandlerInterceptor {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String RATE_LIMIT_PREFIX = "rate_limit:";
    
    @Value("${app.rate-limit.login-requests-per-minute:5}")
    private int maxRequestsLogin;

    @Value("${app.rate-limit.register-requests-per-minute:3}")
    private int maxRequestsRegister;

    @Value("${app.rate-limit.payment-requests-per-minute:10}")
    private int maxRequestsPayments;

    @Value("${app.rate-limit.default-requests-per-minute:100}")
    private int maxRequestsDefault;

    @Value("${app.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    private static final long WINDOW_SIZE_MS = 60000; // 1 minute

    public RateLimitingInterceptor(@Autowired(required = false) RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        
        String clientIp = getClientIp(request);
        String path = request.getRequestURI();

        if (!rateLimitEnabled) {
            return true;
        }

        // Whitelist localhost for development stability
        if (clientIp.equals("127.0.0.1") || clientIp.equals("0:0:0:0:0:0:0:1") || clientIp.equals("localhost") || clientIp.equals("unknown")) {
            return true;
        }

        // If Redis is unavailable (e.g. local/dev tests), skip distributed limiting.
        if (redisTemplate == null) {
            return true;
        }
        
        // Determine rate limit based on endpoint
        int maxRequests = maxRequestsDefault;
        if (path.contains("/auth/login")) {
            maxRequests = maxRequestsLogin;
        } else if (path.contains("/auth/register")) {
            maxRequests = maxRequestsRegister;
        } else if (path.contains("/payments")) {
            maxRequests = maxRequestsPayments;
        }
        
        // Check rate limit
        String key = RATE_LIMIT_PREFIX + clientIp + ":" + path;
        Long currentRequests = redisTemplate.opsForValue().increment(key);
        
        if (currentRequests == 1) {
            // First request in window, set expiration
            redisTemplate.expire(key, WINDOW_SIZE_MS, TimeUnit.MILLISECONDS);
        }
        
        if (currentRequests > maxRequests) {
            log.warn("Rate limit exceeded for {} from {}: {} requests in 1 minute",
                    path, clientIp, currentRequests);
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Try again later.\"}");
            return false;
        }
        
        // Add rate limit info to response headers
        response.addHeader("X-RateLimit-Limit", String.valueOf(maxRequests));
        response.addHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, maxRequests - currentRequests)));
        
        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        // Handle multiple IPs in X-Forwarded-For
        if (ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}

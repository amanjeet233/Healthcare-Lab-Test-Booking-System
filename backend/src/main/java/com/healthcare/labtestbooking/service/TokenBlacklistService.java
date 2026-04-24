package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtService jwtService;

    private static final String BLACKLIST_PREFIX = "token:blacklist:";
    private static final String USER_BLACKLIST_PREFIX = "user:logout:";

    /**
     * Blacklist a single token. It will be stored until token's natural expiry.
     */
    public void blacklistToken(String token) {
        try {
            if (token == null || token.isBlank()) {
                log.warn("Attempted to blacklist null/empty token");
                return;
            }

            String email = jwtService.extractUsername(token);
            Date expiration = jwtService.extractClaim(token, claims -> claims.getExpiration());

            if (expiration == null) {
                log.warn("Token has no expiration, using default 24h TTL");
                redisTemplate.opsForValue().set(
                        BLACKLIST_PREFIX + token,
                        email != null ? email : "unknown",
                        Duration.ofHours(24)
                );
                return;
            }

            long ttlMillis = expiration.getTime() - System.currentTimeMillis();
            if (ttlMillis <= 0) {
                log.debug("Token already expired, no need to blacklist");
                return;
            }

            redisTemplate.opsForValue().set(
                    BLACKLIST_PREFIX + token,
                    email != null ? email : "unknown",
                    Duration.ofMillis(ttlMillis)
            );

            log.info("Token blacklisted for user: {}. TTL: {} minutes", email, ttlMillis / 60000);
        } catch (Exception e) {
            log.error("Failed to blacklist token: {}", e.getMessage());
        }
    }

    /**
     * Check if a token has been blacklisted.
     */
    public boolean isTokenBlacklisted(String token) {
        try {
            if (token == null || token.isBlank()) {
                return false;
            }

            // Check direct token blacklist
            Boolean hasKey = redisTemplate.hasKey(BLACKLIST_PREFIX + token);
            if (Boolean.TRUE.equals(hasKey)) {
                log.debug("Token found in blacklist");
                return true;
            }

            // Check if user has logged out (all tokens revoked)
            String email = jwtService.extractUsername(token);
            if (email != null) {
                Object logoutTime = redisTemplate.opsForValue().get(USER_BLACKLIST_PREFIX + email);
                if (logoutTime != null) {
                    // Token was issued before logout - consider blacklisted
                    Date tokenIssuedAt = jwtService.extractClaim(token, claims -> claims.getIssuedAt());
                    if (tokenIssuedAt != null) {
                        long logoutTimestamp = Long.parseLong(logoutTime.toString());
                        if (tokenIssuedAt.getTime() < logoutTimestamp) {
                            log.debug("Token issued before user logout, treating as blacklisted");
                            return true;
                        }
                    }
                }
            }

            return false;
        } catch (Exception e) {
            log.error("Error checking token blacklist: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Blacklist all tokens for a user (logout from all devices).
     * Stores current timestamp; any token issued before this time is considered invalid.
     */
    public void blacklistAllUserTokens(String email) {
        try {
            if (email == null || email.isBlank()) {
                return;
            }

            String normalizedEmail = email.toLowerCase().trim();
            redisTemplate.opsForValue().set(
                    USER_BLACKLIST_PREFIX + normalizedEmail,
                    String.valueOf(System.currentTimeMillis()),
                    Duration.ofDays(7) // Keep for max refresh token lifetime
            );

            log.info("All tokens blacklisted for user: {}", normalizedEmail);
        } catch (Exception e) {
            log.error("Failed to blacklist all user tokens: {}", e.getMessage());
        }
    }

    /**
     * Remove user from blacklist (e.g., after password reset completes).
     */
    public void clearUserBlacklist(String email) {
        try {
            if (email == null || email.isBlank()) {
                return;
            }

            String normalizedEmail = email.toLowerCase().trim();
            redisTemplate.delete(USER_BLACKLIST_PREFIX + normalizedEmail);

            log.debug("User blacklist cleared for: {}", normalizedEmail);
        } catch (Exception e) {
            log.error("Failed to clear user blacklist: {}", e.getMessage());
        }
    }
}

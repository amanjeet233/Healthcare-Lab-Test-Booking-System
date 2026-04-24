package com.healthcare.labtestbooking.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @PostConstruct
    public void validateSecret() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                "FATAL: jwt.secret must be configured. Set JWT_SECRET environment variable or jwt.secret property.");
        }
        if (secretKey.length() < 32) {
            throw new IllegalStateException(
                "FATAL: jwt.secret must be at least 32 characters for HS256 security.");
        }
        log.info("JWT secret validated successfully ({} characters)", secretKey.length());
    }

    @Value("${jwt.expiration:86400000}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshTokenExpiration;

    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return buildToken(claims, username, accessTokenExpiration);
    }

    public String generateRefreshToken(String username) {
        return buildToken(new HashMap<>(), username, refreshTokenExpiration);
    }

    /** Generates a single-purpose password-reset JWT valid for 1 hour. */
    public String generatePasswordResetToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "RESET");
        return buildToken(claims, username, 3_600_000L); // 1 hour
    }

    /**
     * Returns true only when the token is valid AND carries {@code type=RESET}.
     * This ensures access / refresh tokens cannot be reused as reset tokens.
     */
    public boolean isPasswordResetToken(String token) {
        try {
            if (!isTokenValid(token)) {
                return false;
            }
            Claims claims = extractAllClaims(token);
            return "RESET".equals(claims.get("type"));
        } catch (Exception e) {
            log.debug("isPasswordResetToken check failed", e);
            return false;
        }
    }

    /** Generates a single-purpose email verification JWT valid for 24 hours. */
    public String generateVerificationToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "VERIFY");
        return buildToken(claims, username, 86_400_000L); // 24 hours
    }

    /**
     * Returns true only when the token is valid AND carries {@code type=VERIFY}.
     * This ensures access / refresh tokens cannot be reused as verification tokens.
     */
    public boolean isVerificationToken(String token) {
        try {
            if (!isTokenValid(token)) {
                return false;
            }
            Claims claims = extractAllClaims(token);
            return "VERIFY".equals(claims.get("type"));
        } catch (Exception e) {
            log.debug("isVerificationToken check failed", e);
            return false;
        }
    }

    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (Exception e) {
            log.error("Error extracting username from token", e);
            return null;
        }
    }

    public String extractRole(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Object role = claims.get("role");
            if (role != null) {
                return role.toString();
            }

            Object roles = claims.get("roles");
            if (roles instanceof List<?> roleList && !roleList.isEmpty()) {
                return String.valueOf(roleList.get(0));
            }
            return null;
        } catch (Exception e) {
            log.error("Error extracting role from token", e);
            return null;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .collect(Collectors.toList());
        claims.put("roles", roles);
        String primaryRole = roles.isEmpty() ? null : roles.get(0);
        if (primaryRole != null) {
            claims.put("role", primaryRole);
        }
        return generateToken(claims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, accessTokenExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        log.debug("Generating JWT for subject(email): {} with claims: {}", userDetails.getUsername(), extraClaims);
        return buildToken(extraClaims, userDetails.getUsername(), expiration);
    }

    private String buildToken(Map<String, Object> extraClaims, String username, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token, String username) {
        try {
            String extractedUsername = extractUsername(token);
            return extractedUsername != null && extractedUsername.equals(username) && !isTokenExpired(token);
        } catch (Exception e) {
            log.error("Token validation with username failed", e);
            return false;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            if (token == null || token.isBlank()) {
                return false;
            }
            Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token", e);
            return false;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return validateToken(token, userDetails.getUsername());
    }

    public boolean validateToken(String token) {
        return isTokenValid(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
            .parserBuilder()
            .setSigningKey(getSignInKey())
                .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

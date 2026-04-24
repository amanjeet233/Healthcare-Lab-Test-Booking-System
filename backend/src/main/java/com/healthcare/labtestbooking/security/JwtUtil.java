package com.healthcare.labtestbooking.security;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtService jwtService;

    public String generateToken(UserDetails userDetails) {
        return jwtService.generateToken(userDetails);
    }

    public String generateToken(Map<String, Object> claims, String subject) {
        org.springframework.security.core.userdetails.UserDetails userDetails =
                org.springframework.security.core.userdetails.User.withUsername(subject)
                        .password("")
                        .authorities(java.util.Collections.emptyList())
                        .build();
        return jwtService.generateToken(claims, userDetails);
    }

    public Boolean validateToken(String token) {
        return jwtService.validateToken(token);
    }

    public String extractUsername(String token) {
        return jwtService.extractUsername(token);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return jwtService.extractClaim(token, claimsResolver);
    }

    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}

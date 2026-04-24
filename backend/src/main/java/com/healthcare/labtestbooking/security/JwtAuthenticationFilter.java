package com.healthcare.labtestbooking.security;

import com.healthcare.labtestbooking.service.TokenBlacklistService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();

        // Public / infrastructure endpoints that should not require JWT parsing
        boolean isProtectedLabTestParametersEndpoint = path.matches("^/api/lab-tests/\\d+/parameters/?$");

        return path.startsWith("/api/auth/")
                || path.startsWith("/api/public/")
                || path.startsWith("/api/health")
                || path.startsWith("/api/labs/")           // Lab catalog is public
                || (path.startsWith("/api/lab-tests/") && !isProtectedLabTestParametersEndpoint) // Lab tests catalog is public except parameter entry endpoint
                || path.startsWith("/api/doctors/")        // Doctors list is public (browsing)
                || path.startsWith("/api/locations/")      // Locations are public (browsing)
                || path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/api-docs")
                || path.startsWith("/h2-console")
                || "/swagger-ui.html".equals(path)
                || "/error".equals(path);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            // Only log if we're processing a protected endpoint with token
            if (StringUtils.hasText(jwt)) {
                log.debug("JWT filter processing token for {} {}",
                    request.getMethod(), request.getRequestURI());
            }

            if (StringUtils.hasText(jwt)) {
                // Check if token is blacklisted (logged out)
                if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                    log.debug("Token is blacklisted for request {} {}", request.getMethod(), request.getRequestURI());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"success\":false,\"message\":\"Token has been revoked. Please login again.\"}");
                    return;
                }

                if (jwtUtil.validateToken(jwt)) {
                    String email = jwtUtil.extractUsername(jwt);
                    log.debug("JWT validated successfully. Subject(email): {}", email);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    log.debug("Loaded user details for {} with authorities {}", email, userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("SecurityContext updated for {}", email);
                } else {
                    log.debug("JWT validation failed for request {} {} - Token may be expired or invalid",
                            request.getMethod(), request.getRequestURI());
                }
            }
        } catch (ExpiredJwtException ex) {
            log.debug("JWT token has expired for request {} {}", request.getMethod(), request.getRequestURI());
        } catch (Exception ex) {
            log.debug("Could not set user authentication in security context: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

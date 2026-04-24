package com.healthcare.labtestbooking.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.*;

/**
 * Aspect for comprehensive API request/response logging.
 * 
 * Logs:
 * - Incoming requests: Method, URL, Headers (excluding Authorization), Body
 * - Outgoing responses: Status code, Time taken
 * - Performance: Warns on slow requests (> 2 seconds)
 */
@Aspect
@Component
@Slf4j
public class LoggingAspect {

    private static final long SLOW_REQUEST_THRESHOLD = 2000; // 2 seconds in milliseconds
    private static final String AUTHORIZATION_HEADER = "Authorization";

    /**
     * AOP Around advice for all controller methods to log request/response details
     */
    @Around("execution(* com.healthcare.labtestbooking.controller.*.*(..))")
    public Object logAroundControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = null;
        HttpServletResponse response = null;

        // Extract request and response from context
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                request = attributes.getRequest();
                response = attributes.getResponse();
            }
        } catch (Exception e) {
            log.debug("Could not extract HTTP request/response info", e);
        }

        // Log incoming request details
        if (request != null) {
            logIncomingRequest(request, joinPoint);
        }

        // Execute the controller method and measure execution time
        long startTime = System.currentTimeMillis();
        Object result = null;
        Exception executionException = null;

        try {
            result = joinPoint.proceed();
        } catch (Exception e) {
            executionException = e;
            long timeTaken = System.currentTimeMillis() - startTime;
            log.error("[ERROR] Request execution failed | Time: {}ms | Error: {}", timeTaken, e.getMessage());
            throw e;
        }

        // Calculate response time
        long timeTaken = System.currentTimeMillis() - startTime;

        // Log outgoing response and performance metrics
        logOutgoingResponse(result, timeTaken, response);

        return result;
    }

    /**
     * Logs incoming request details including method, URL, headers, and body
     */
    private void logIncomingRequest(HttpServletRequest request, ProceedingJoinPoint joinPoint) {
        try {
            String method = request.getMethod();
            String requestURI = request.getRequestURI();
            String queryString = request.getQueryString();

            // Build complete URL
            StringBuilder urlBuilder = new StringBuilder(requestURI);
            if (queryString != null && !queryString.isEmpty()) {
                urlBuilder.append("?").append(queryString);
            }

            // Extract headers (excluding Authorization for security)
            Map<String, String> headers = extractHeadersExcludingAuthorization(request);

            // Log request initiation
            log.info("");
            log.info("================================================");
            log.info("[REQUEST] -> INCOMING REQUEST");
            log.info("================================================");
            log.info("Method: {} | URL: {}", method, urlBuilder.toString());
            log.info("Controller: {}.{}",
                    joinPoint.getTarget().getClass().getSimpleName(),
                    joinPoint.getSignature().getName());

            if (!headers.isEmpty()) {
                log.info("Headers:");
                headers.forEach((key, value) -> log.info("  {}: {}", key, value));
            }

            // Log content type if present
            String contentType = request.getContentType();
            if (contentType != null) {
                log.info("Content-Type: {}", contentType);
            }

            log.info("================================================");

        } catch (Exception e) {
            log.debug("Error logging incoming request", e);
        }
    }

    /**
     * Extracts headers from request, excluding Authorization header for security
     */
    private Map<String, String> extractHeadersExcludingAuthorization(HttpServletRequest request) {
        Map<String, String> headers = new LinkedHashMap<>();

        try {
            Enumeration<String> headerNames = request.getHeaderNames();
            if (headerNames != null) {
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();

                    // Skip Authorization header for security reasons
                    if (!AUTHORIZATION_HEADER.equalsIgnoreCase(headerName)) {
                        String headerValue = request.getHeader(headerName);
                        headers.put(headerName, headerValue);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting headers", e);
        }

        return headers;
    }

    private void logOutgoingResponse(Object result, long timeTaken, HttpServletResponse response) {
        try {
            boolean isSlowRequest = timeTaken > SLOW_REQUEST_THRESHOLD;
            int statusCode = response != null ? response.getStatus() : 0;

            // Log response with visual indicators
            log.info("");
            log.info("================================================");

            if (isSlowRequest) {
                log.warn("[SLOW] RESPONSE TIME WARNING");
                log.warn("================================================");
                log.warn("Response Time: {}ms (WARNING - Threshold: {}ms)", timeTaken, SLOW_REQUEST_THRESHOLD);
            } else {
                log.info("[RESPONSE] <- OUTGOING RESPONSE");
                log.info("================================================");
                log.info("Response Time: {}ms", timeTaken);
            }

            if (statusCode > 0) {
                String statusIndicator = statusCode >= 400 ? "FAILED" : "SUCCESS";
                log.info("Status Code: [{}] {}", statusIndicator, statusCode);
            }

            if (result != null) {
                log.debug("Response Body: {}", summarizeResponse(result));
            }

            log.info("================================================");
            log.info("");

        } catch (Exception e) {
            log.debug("Error logging outgoing response", e);
        }
    }

    /**
     * Build a shallow response summary so logging never walks lazy JPA proxies.
     */
    private String summarizeResponse(Object result) {
        try {
            if (result instanceof ResponseEntity<?> responseEntity) {
                Object body = responseEntity.getBody();
                return String.format("ResponseEntity(status=%s, body=%s)",
                        responseEntity.getStatusCode(),
                        summarizeObject(body));
            }
            return summarizeObject(result);
        } catch (Exception ex) {
            return "<unavailable: " + ex.getClass().getSimpleName() + ">";
        }
    }

    private String summarizeObject(Object value) {
        if (value == null) {
            return "null";
        }
        if (value instanceof CharSequence text) {
            int max = 160;
            return text.length() > max ? text.subSequence(0, max) + "..." : text.toString();
        }
        if (value instanceof Collection<?> collection) {
            return value.getClass().getSimpleName() + "(size=" + collection.size() + ")";
        }
        if (value instanceof Map<?, ?> map) {
            return value.getClass().getSimpleName() + "(size=" + map.size() + ")";
        }
        if (value.getClass().isArray()) {
            return value.getClass().getComponentType().getSimpleName() + "[]";
        }
        // For DTO/entity objects, log type only to avoid triggering lazy loaders.
        return value.getClass().getSimpleName();
    }
}

package com.healthcare.labtestbooking.filter;

import com.healthcare.labtestbooking.service.FeatureFlagService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class ApiVersioningFilter extends OncePerRequestFilter {

    private static final String VERSIONED_PREFIX = "/api/v1";
    private static final String BASE_PREFIX = "/api";
    private final FeatureFlagService featureFlagService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!featureFlagService.isApiV1Enabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String contextPath = request.getContextPath() == null ? "" : request.getContextPath();
        String uri = request.getRequestURI();
        String rawPath = uri.substring(contextPath.length());

        if (rawPath.equals(VERSIONED_PREFIX) || rawPath.startsWith(VERSIONED_PREFIX + "/")) {
            String rewrittenPath = BASE_PREFIX + rawPath.substring(VERSIONED_PREFIX.length());
            HttpServletRequest wrapped = new VersionedPathRequestWrapper(request, contextPath, rewrittenPath);
            filterChain.doFilter(wrapped, response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static class VersionedPathRequestWrapper extends HttpServletRequestWrapper {
        private final String requestUri;
        private final String servletPath;

        VersionedPathRequestWrapper(HttpServletRequest request, String contextPath, String rewrittenPath) {
            super(request);
            this.requestUri = contextPath + rewrittenPath;
            this.servletPath = rewrittenPath;
        }

        @Override
        public String getRequestURI() {
            return requestUri;
        }

        @Override
        public StringBuffer getRequestURL() {
            HttpServletRequest req = (HttpServletRequest) getRequest();
            StringBuffer original = req.getRequestURL();
            int schemeAndHostEnd = original.indexOf(req.getRequestURI());
            String prefix = schemeAndHostEnd >= 0 ? original.substring(0, schemeAndHostEnd) : "";
            return new StringBuffer(prefix + requestUri);
        }

        @Override
        public String getServletPath() {
            return servletPath;
        }
    }
}


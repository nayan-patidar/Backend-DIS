package com.Internship.Complaint_Management_Portal.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityHeadersFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(SecurityHeadersFilter.class);

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        // Security headers
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("Content-Security-Policy", "default-src 'self'");
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

        // Deprecated but sometimes useful for older clients
        response.setHeader("X-XSS-Protection", "1; mode=block");

        logger.debug("Applied security headers to response for {}", request.getRequestURI());

        filterChain.doFilter(request, response);
    }
}

package com.Internship.Complaint_Management_Portal.security;

import com.Internship.Complaint_Management_Portal.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory IP-based rate limiter.
 * Protects the /api/auth endpoints from brute-force and abuse.
 * Note: This is best-effort and not distributed; for production use a distributed rate limiter.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(RateLimitingFilter.class);

    @org.springframework.beans.factory.annotation.Value("${app.rate-limit.limit:10}")
    private int limit;

    @org.springframework.beans.factory.annotation.Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    private static final long WINDOW_MS = 60_000L; // 1 minute
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    private static class Window {
        AtomicInteger count = new AtomicInteger(0);
        long windowStart = Instant.now().toEpochMilli();
    }

    private final Map<String, Window> ipWindows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        // Only rate-limit auth endpoints if enabled
        if (enabled && path.startsWith("/api/auth")) {
            String ip = extractClientIp(request);
            Window window = ipWindows.computeIfAbsent(ip, k -> new Window());
            long now = Instant.now().toEpochMilli();
            synchronized (window) {
                if (now - window.windowStart > WINDOW_MS) {
                    window.windowStart = now;
                    window.count.set(1);
                } else {
                    int current = window.count.incrementAndGet();
                    if (current > limit) {
                        logger.warn("Rate limit exceeded for IP {} on path {}", ip, path);
                        response.setStatus(429);
                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                        ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(429)
                                .error("TOO_MANY_REQUESTS")
                                .message("Too many requests - try again later")
                                .path(path)
                                .traceId(UUID.randomUUID().toString())
                                .build();

                        objectMapper.writeValue(response.getOutputStream(), errorResponse);
                        return;
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

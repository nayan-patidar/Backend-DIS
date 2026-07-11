package com.Internship.Complaint_Management_Portal.security.jwt;

import com.Internship.Complaint_Management_Portal.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter.
 * Executed once per request to validate JWT tokens and set authentication context.
 * Logs security events for audit and debugging purposes.
 */
@Component
public class AuthTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);
    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY");

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthTokenFilter(JwtUtils jwtUtils, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Filters incoming requests and validates JWT tokens.
     * If a valid JWT is found, sets the authentication context.
     * Logs security-related events for monitoring.
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            String requestUri = request.getRequestURI();

            if (jwt != null) {
                // Validate JWT token
                if (jwtUtils.validateJwtToken(jwt)) {
                    String email = jwtUtils.getEmailFromJwtToken(jwt);
                    if (!StringUtils.hasText(email)) {
                        logger.warn("JWT token missing required email claim for request to: {}", requestUri);
                        securityLogger.warn("JWT token rejected because required email claim is missing on path: {}", requestUri);
                        filterChain.doFilter(request, response);
                        return;
                    }
                    logger.debug("Valid JWT token extracted for email: {}", email);

                    // Load user details from database using verified email address from claims
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    securityLogger.info("Authentication successful for email: {} on path: {}", email, requestUri);
                } else {
                    logger.warn("JWT validation failed for request to: {}", requestUri);
                    securityLogger.warn("Invalid JWT token detected on path: {}", requestUri);
                }
            } else {
                logger.debug("No JWT token found in Authorization header for request to: {}", requestUri);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage(), e);
            securityLogger.error("Authentication error: {}", e.getMessage());
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Extracts JWT token from Authorization header.
     * Expected format: "Bearer {token}"
     * 
     * @param request HTTP request
     * @return JWT token or null if not found
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}

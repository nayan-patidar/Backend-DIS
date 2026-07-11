package com.Internship.Complaint_Management_Portal.security;

import com.Internship.Complaint_Management_Portal.dto.ErrorResponse;
import com.Internship.Complaint_Management_Portal.security.jwt.AuthEntryPointJwt;
import com.Internship.Complaint_Management_Portal.security.jwt.AuthTokenFilter;
import com.Internship.Complaint_Management_Portal.security.services.UserDetailsServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;

/**
 * Spring Security configuration.
 * Configures authentication, authorization, JWT filter chain, and CORS policies.
 * Implements best practices for a JWT-based REST API.
 */
@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {
    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final AuthTokenFilter authenticationJwtTokenFilter;
    private final SecurityHeadersFilter securityHeadersFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final ObjectMapper objectMapper;

    @Value("${app.cors.allowed-origins:https://example.com}")
    private String allowedOrigins;

    public WebSecurityConfig(UserDetailsServiceImpl userDetailsService, AuthEntryPointJwt unauthorizedHandler,
                             AuthTokenFilter authenticationJwtTokenFilter, SecurityHeadersFilter securityHeadersFilter,
                             RateLimitingFilter rateLimitingFilter, ObjectMapper objectMapper) {
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
        this.authenticationJwtTokenFilter = authenticationJwtTokenFilter;
        this.securityHeadersFilter = securityHeadersFilter;
        this.rateLimitingFilter = rateLimitingFilter;
        this.objectMapper = objectMapper;
    }

    /**
     * Configures the authentication provider with user details service and password encoder.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Exposes the AuthenticationManager as a bean for use in controllers.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Configures BCrypt password encoder with strength 12.
     * Higher strength = slower hashing, better security against brute force.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Configures CORS settings to allow specific origins and methods.
     * Restrictive CORS policy prevents unauthorized cross-origin requests.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins (restrict in production)
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        
        // Set allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Set allowed headers
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        // Allow credentials (if needed, remove * from origins)
        configuration.setAllowCredentials(false);
        
        // Set max age for preflight requests (12 hours)
        configuration.setMaxAge(43200L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Configures the security filter chain.
     * - CSRF protection is disabled for stateless JWT-based API
     * - Session management is stateless (no server-side sessions)
     * - Exception handling routes unauthorized requests to JWT entry point
     * - Specific paths are permitted; all others require authentication
     * - JWT filter is added to filter chain
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless JWT API
                .csrf(csrf -> csrf.disable())

                // CORS configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Exception handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler)
                        .accessDeniedHandler(restAccessDeniedHandler()))
                
                // Stateless session management
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // Configure authorization rules
                .authorizeHttpRequests(auth ->
                        auth
                                // Public endpoints
                                .requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                                .requestMatchers("/actuator/health").permitAll() // For health checks
                                
                                // All other endpoints require authentication
                                .anyRequest().authenticated()
                );

        // Register authentication provider and JWT filter
        http.authenticationProvider(authenticationProvider());
            // Rate limiting applied early on auth endpoints
            http.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);
            // Security headers applied to all responses
            http.addFilterBefore(securityHeadersFilter, RateLimitingFilter.class);
            http.addFilterBefore(authenticationJwtTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private AccessDeniedHandler restAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);

            ErrorResponse errorResponse = ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(HttpServletResponse.SC_FORBIDDEN)
                    .error("FORBIDDEN")
                    .message("Access denied")
                    .path(request.getRequestURI())
                    .traceId(UUID.randomUUID().toString())
                    .build();

            objectMapper.writeValue(response.getOutputStream(), errorResponse);
        };
    }
}

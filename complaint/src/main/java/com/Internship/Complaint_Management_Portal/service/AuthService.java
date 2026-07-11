package com.Internship.Complaint_Management_Portal.service;

import com.Internship.Complaint_Management_Portal.dto.JwtResponse;
import com.Internship.Complaint_Management_Portal.dto.LoginRequest;
import com.Internship.Complaint_Management_Portal.dto.MessageResponse;
import com.Internship.Complaint_Management_Portal.dto.RegisterRequest;
import com.Internship.Complaint_Management_Portal.exception.DuplicateResourceException;
import com.Internship.Complaint_Management_Portal.model.Role;
import com.Internship.Complaint_Management_Portal.model.User;
import com.Internship.Complaint_Management_Portal.repository.UserRepository;
import com.Internship.Complaint_Management_Portal.security.jwt.JwtUtils;
import com.Internship.Complaint_Management_Portal.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service layer for authentication and registration management.
 * Contains business logic for authenticating users and managing registrations.
 */
@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       PasswordEncoder encoder, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Authenticates a user, sets the SecurityContext, and generates a JWT.
     */
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        logger.debug("Authentication service call for email: {}", loginRequest.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        logger.info("Successful authentication for email: {}", loginRequest.getEmail());

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                role
        );
    }

    /**
     * Registers a new user with secure role mapping and duplicate checking.
     */
    @Transactional
    public MessageResponse registerUser(RegisterRequest signUpRequest) {
        logger.debug("Registration service call for email: {}", signUpRequest.getEmail());

        // Check for duplicate email
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            logger.warn("Registration failed: Email already in use: {}", signUpRequest.getEmail());
            throw new DuplicateResourceException("User", "email", signUpRequest.getEmail());
        }

        // Validate and assign role (only allow ROLE_USER from registration, ROLE_ADMIN requires manual assignment)
        Role role = Role.ROLE_USER; // Default role for new users
        if (signUpRequest.getRole() != null && !signUpRequest.getRole().isEmpty()) {
            try {
                Role requestedRole = Role.valueOf(signUpRequest.getRole());
                // Security: Only allow ROLE_USER to be self-assigned during registration
                if (requestedRole == Role.ROLE_USER) {
                    role = requestedRole;
                } else {
                    logger.warn("Registration attempt with elevated role: {}", signUpRequest.getRole());
                    // Silently ignore and default to USER to prevent privilege escalation
                }
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid role provided during registration: {}", signUpRequest.getRole());
                // Silently ignore invalid role and default to USER
            }
        }

        // Create and save user
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
        logger.info("User registered successfully via service: {}", signUpRequest.getEmail());

        return new MessageResponse("User registered successfully!");
    }
}

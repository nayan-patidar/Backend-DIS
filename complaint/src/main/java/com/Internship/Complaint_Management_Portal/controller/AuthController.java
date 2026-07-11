package com.Internship.Complaint_Management_Portal.controller;

import com.Internship.Complaint_Management_Portal.dto.JwtResponse;
import com.Internship.Complaint_Management_Portal.dto.LoginRequest;
import com.Internship.Complaint_Management_Portal.dto.MessageResponse;
import com.Internship.Complaint_Management_Portal.dto.RegisterRequest;
import com.Internship.Complaint_Management_Portal.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller.
 * Handles HTTP request/response concerns for user login and registration.
 * All business logic is delegated to AuthService.
 * All input is validated via @Valid annotation on DTOs.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Authenticates a user and returns a JWT token.
     * Validates input via @Valid on LoginRequest DTO.
     * 
     * @param loginRequest validated login credentials
     * @return JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("POST /api/auth/login - Email: {}", loginRequest.getEmail());
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    /**
     * Registers a new user.
     * Validates input via @Valid on RegisterRequest DTO.
     * 
     * @param signUpRequest validated registration data
     * @return success or error message
     */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        logger.info("POST /api/auth/register - Email: {}", signUpRequest.getEmail());
        MessageResponse messageResponse = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(messageResponse);
    }
}

package com.Internship.Complaint_Management_Portal.controller;

import com.Internship.Complaint_Management_Portal.dto.ComplaintDTO;
import com.Internship.Complaint_Management_Portal.dto.ComplaintRequest;
import com.Internship.Complaint_Management_Portal.service.ComplaintService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Complaint Controller.
 * Handles HTTP request/response concerns.
 * All business logic is delegated to ComplaintService.
 * All input is validated via @Valid annotation.
 * All responses are DTOs to prevent over-posting.
 */
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {
    private static final Logger logger = LoggerFactory.getLogger(ComplaintController.class);

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /**
     * Creates a new complaint for the authenticated user.
     * Accessible only to users with ROLE_USER.
     * Input validated via @Valid on ComplaintRequest DTO.
     * 
     * @param request validated complaint data
     * @param authentication authenticated user context
     * @return created complaint DTO
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ComplaintDTO> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication) {
        logger.info("POST /api/complaints - User: {}", authentication.getName());
        
        ComplaintDTO createdComplaint = complaintService.createComplaint(
                request,
                authentication.getName()
        );
        
        return new ResponseEntity<>(createdComplaint, HttpStatus.CREATED);
    }

    /**
     * Retrieves all complaints created by the authenticated user.
     * Accessible only to users with ROLE_USER.
     * 
     * @param authentication authenticated user context
     * @return list of complaint DTOs
     */
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ComplaintDTO>> getMyComplaints(
            Authentication authentication) {
        logger.info("GET /api/complaints - User: {}", authentication.getName());
        
        List<ComplaintDTO> complaints = complaintService.getComplaintsByUser(
                authentication.getName()
        );
        
        return ResponseEntity.ok(complaints);
    }

    /**
     * Updates a complaint owned by the authenticated user.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ComplaintDTO> updateMyComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication) {
        logger.info("PUT /api/complaints/{} - User: {}", id, authentication.getName());

        ComplaintDTO updatedComplaint = complaintService.updateUserComplaint(
                id,
                request,
                authentication.getName()
        );

        return ResponseEntity.ok(updatedComplaint);
    }

    /**
     * Deletes a complaint owned by the authenticated user.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteMyComplaint(
            @PathVariable Long id,
            Authentication authentication) {
        logger.info("DELETE /api/complaints/{} - User: {}", id, authentication.getName());

        complaintService.deleteUserComplaint(id, authentication.getName());

        return ResponseEntity.noContent().build();
    }
}

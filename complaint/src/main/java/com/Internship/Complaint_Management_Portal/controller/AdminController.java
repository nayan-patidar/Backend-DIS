package com.Internship.Complaint_Management_Portal.controller;

import com.Internship.Complaint_Management_Portal.dto.ComplaintDTO;
import com.Internship.Complaint_Management_Portal.dto.StatusUpdateRequest;
import com.Internship.Complaint_Management_Portal.service.ComplaintService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Admin Controller.
 * Handles HTTP request/response concerns for admin operations.
 * All business logic is delegated to ComplaintService.
 * All endpoints require ROLE_ADMIN.
 * All responses are DTOs to prevent over-posting.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final ComplaintService complaintService;

    public AdminController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    /**
     * Retrieves all complaints with pagination.
     * Accessible only to users with ROLE_ADMIN.
     * 
     * @param pageable pagination parameters
     * @return paginated complaint DTOs
     */
    @GetMapping("/complaints")
    public ResponseEntity<Page<ComplaintDTO>> getAllComplaints(Pageable pageable) {
        logger.info("GET /api/admin/complaints - Pageable: page={}, size={}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        Page<ComplaintDTO> complaints = complaintService.getAllComplaints(pageable);
        return ResponseEntity.ok(complaints);
    }

    /**
     * Updates the status of a complaint.
     * Accessible only to users with ROLE_ADMIN.
     * Status value is validated at service layer.
     * 
     * @param id complaint ID
     * @param request map containing 'status' field
     * @return updated complaint DTO
     */
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        logger.info("PUT /api/admin/complaints/{}/status - New status: {}", id, request.getStatus());

        ComplaintDTO updatedComplaint = complaintService.updateStatus(
                id,
                request.getStatus()
        );
        
        return ResponseEntity.ok(updatedComplaint);
    }

    /**
     * Assigns a complaint to the current admin user.
     * Sets complaint status to IN_PROGRESS.
     * Accessible only to users with ROLE_ADMIN.
     * 
     * @param id complaint ID
     * @param authentication authenticated admin user context
     * @return updated complaint DTO
     */
    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintDTO> assignComplaint(
            @PathVariable Long id,
            Authentication authentication) {
        logger.info("PUT /api/admin/complaints/{}/assign - Admin: {}", id, authentication.getName());
        
        ComplaintDTO assignedComplaint = complaintService.assignComplaint(
                id,
                authentication.getName()
        );
        
        return ResponseEntity.ok(assignedComplaint);
    }
}

package com.Internship.Complaint_Management_Portal.service;

import com.Internship.Complaint_Management_Portal.dto.ComplaintDTO;
import com.Internship.Complaint_Management_Portal.dto.ComplaintRequest;
import com.Internship.Complaint_Management_Portal.exception.BadRequestException;
import com.Internship.Complaint_Management_Portal.exception.ResourceNotFoundException;
import com.Internship.Complaint_Management_Portal.exception.UnauthorizedException;
import com.Internship.Complaint_Management_Portal.model.*;
import com.Internship.Complaint_Management_Portal.repository.ComplaintRepository;
import com.Internship.Complaint_Management_Portal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for complaint management.
 * Contains all business logic, validation, and authorization checks.
 * Controllers should only handle HTTP concerns and delegate to this service.
 */
@Service
public class ComplaintService {
    private static final Logger logger = LoggerFactory.getLogger(ComplaintService.class);

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new complaint for the authenticated user.
     * Validates priority enum and ensures user exists.
     */
    @Transactional
    public ComplaintDTO createComplaint(ComplaintRequest request, String email) {
        logger.debug("Creating complaint for user: {}", email);

        // Validate user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Priority priority = parsePriority(request.getPriority());

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(priority)
                .status(Status.OPEN)
                .createdBy(user)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        logger.info("Complaint created with ID: {} by user: {}", saved.getId(), email);
        return mapToDTO(saved);
    }

    /**
     * Retrieves all complaints created by the authenticated user.
     */
    public List<ComplaintDTO> getComplaintsByUser(String email) {
        logger.debug("Fetching complaints for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return complaintRepository.findByCreatedBy(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Updates a complaint owned by the authenticated user.
     */
    @Transactional
    public ComplaintDTO updateUserComplaint(Long id, ComplaintRequest request, String email) {
        logger.debug("Updating complaint ID: {} for user: {}", id, email);

        Complaint complaint = getOwnedComplaint(id, email);
        ensureOpenForUserChanges(complaint);
        Priority priority = parsePriority(request.getPriority());

        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        complaint.setPriority(priority);

        Complaint updated = complaintRepository.save(complaint);
        logger.info("Complaint ID: {} updated by user: {}", id, email);
        return mapToDTO(updated);
    }

    /**
     * Deletes a complaint owned by the authenticated user.
     */
    @Transactional
    public void deleteUserComplaint(Long id, String email) {
        logger.debug("Deleting complaint ID: {} for user: {}", id, email);

        Complaint complaint = getOwnedComplaint(id, email);
        ensureOpenForUserChanges(complaint);
        complaintRepository.delete(complaint);
        logger.info("Complaint ID: {} deleted by user: {}", id, email);
    }

    /**
     * Retrieves all complaints with pagination.
     * Should only be accessible by ADMIN role (enforced at controller level).
     */
    public Page<ComplaintDTO> getAllComplaints(Pageable pageable) {
        logger.debug("Fetching all complaints with pagination");
        return complaintRepository.findAll(pageable).map(this::mapToDTO);
    }

    /**
     * Updates the status of a complaint.
     * Validates status enum and ensures complaint exists.
     * Should only be accessible by ADMIN role (enforced at controller level).
     */
    @Transactional
    public ComplaintDTO updateStatus(Long id, String statusString) {
        logger.debug("Updating status of complaint ID: {} to: {}", id, statusString);

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        // Validate status enum
        Status status;
        try {
            status = Status.valueOf(statusString.toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid status value: {}", statusString);
            throw new BadRequestException("Invalid status. Allowed values: OPEN, IN_PROGRESS, RESOLVED, CLOSED");
        }

        complaint.setStatus(status);
        Complaint updated = complaintRepository.save(complaint);
        logger.info("Complaint ID: {} status updated to: {}", id, status);
        return mapToDTO(updated);
    }

    /**
     * Assigns a complaint to an admin.
     * Validates both complaint and admin exist.
     * Sets status to IN_PROGRESS.
     */
    @Transactional
    public ComplaintDTO assignComplaint(Long id, String adminEmail) {
        logger.debug("Assigning complaint ID: {} to admin: {}", id, adminEmail);

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "email", adminEmail));

        // Optional: Validate that the user assigning has ADMIN role (can be enforced at controller)
        if (!admin.getRole().equals(Role.ROLE_ADMIN)) {
            logger.warn("Attempted to assign complaint to non-admin user: {}", adminEmail);
            throw new UnauthorizedException("Only admins can be assigned complaints");
        }

        complaint.setAssignedTo(admin);
        complaint.setStatus(Status.IN_PROGRESS);
        Complaint updated = complaintRepository.save(complaint);
        logger.info("Complaint ID: {} assigned to admin: {}", id, adminEmail);
        return mapToDTO(updated);
    }

    /**
     * Maps Complaint entity to ComplaintDTO.
     * Ensures only safe fields are exposed to clients.
     * Prevents accidental data leakage of internal fields.
     */
    public ComplaintDTO mapToDTO(Complaint complaint) {
        return ComplaintDTO.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .createdByEmail(complaint.getCreatedBy().getEmail())
                .assignedToEmail(complaint.getAssignedTo() != null ? complaint.getAssignedTo().getEmail() : null)
                .assignedToName(complaint.getAssignedTo() != null ? complaint.getAssignedTo().getName() : null)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }

    private Complaint getOwnedComplaint(Long id, String email) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        if (!complaint.getCreatedBy().getEmail().equals(email)) {
            logger.warn("User {} attempted to access complaint ID: {} owned by {}",
                    email, id, complaint.getCreatedBy().getEmail());
            throw new UnauthorizedException("You can only manage complaints you created");
        }

        return complaint;
    }

    private void ensureOpenForUserChanges(Complaint complaint) {
        if (complaint.getStatus() != Status.OPEN) {
            logger.warn("Rejected user modification for complaint ID: {} with status: {}",
                    complaint.getId(), complaint.getStatus());
            throw new UnauthorizedException("Complaint can only be changed while it is OPEN");
        }
    }

    private Priority parsePriority(String priorityString) {
        try {
            return Priority.valueOf(priorityString.toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid priority value: {}", priorityString);
            throw new BadRequestException("Invalid priority. Allowed values: LOW, MEDIUM, HIGH, CRITICAL");
        }
    }
}

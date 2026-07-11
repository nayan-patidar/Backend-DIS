package com.Internship.Complaint_Management_Portal.dto;

import com.Internship.Complaint_Management_Portal.model.Priority;
import com.Internship.Complaint_Management_Portal.model.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Complaint responses.
 * Prevents over-posting and protects internal entity structure.
 * Only safe fields are exposed to clients.
 */
@Data
@Builder
public class ComplaintDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Priority priority;
    private Status status;
    private String createdByEmail;
    private String assignedToEmail;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

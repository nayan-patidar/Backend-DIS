package com.Internship.Complaint_Management_Portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for creating/updating complaints.
 * Enforces strict validation at controller entry point.
 * All fields are validated before reaching service layer.
 */
@Data
public class ComplaintRequest {
    @NotBlank(message = "Title is required and cannot be blank")
    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;

    @NotBlank(message = "Description is required and cannot be blank")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotBlank(message = "Category is required and cannot be blank")
    @Size(min = 2, max = 50, message = "Category must be between 2 and 50 characters")
    private String category;

    @NotBlank(message = "Priority is required and cannot be blank")
    @Pattern(
            regexp = "LOW|MEDIUM|HIGH|CRITICAL",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL"
    )
    private String priority;
}

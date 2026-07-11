package com.Internship.Complaint_Management_Portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotBlank(message = "Status is required and cannot be blank")
    @Pattern(
            regexp = "OPEN|IN_PROGRESS|RESOLVED|CLOSED",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Status must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED"
    )
    private String status;
}

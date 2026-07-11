package com.Internship.Complaint_Management_Portal.exception;

/**
 * Exception thrown when attempting to create a duplicate resource.
 * Typically used for unique constraint violations (e.g., duplicate email).
 */
public class DuplicateResourceException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s already exists with %s: %s", resourceName, fieldName, fieldValue));
    }

    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}

package com.Internship.Complaint_Management_Portal.exception;

/**
 * Exception thrown when a resource conflict occurs (e.g. duplicate state, state conflict).
 */
public class ConflictException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}

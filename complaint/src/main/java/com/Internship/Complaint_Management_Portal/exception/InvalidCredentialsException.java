package com.Internship.Complaint_Management_Portal.exception;

/**
 * Exception thrown when provided credentials are invalid.
 * This is a security exception for authentication failures.
 */
public class InvalidCredentialsException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public InvalidCredentialsException(String message) {
        super(message);
    }

    public InvalidCredentialsException(String message, Throwable cause) {
        super(message, cause);
    }
}

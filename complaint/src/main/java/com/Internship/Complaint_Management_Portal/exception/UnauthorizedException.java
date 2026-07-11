package com.Internship.Complaint_Management_Portal.exception;

/**
 * Exception thrown when a user is not authorized to perform an action.
 * This is a security-related exception indicating insufficient privileges.
 */
public class UnauthorizedException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}

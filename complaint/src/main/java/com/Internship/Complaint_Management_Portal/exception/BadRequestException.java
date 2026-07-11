package com.Internship.Complaint_Management_Portal.exception;

/**
 * Thrown when a request contains invalid business data (400).
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

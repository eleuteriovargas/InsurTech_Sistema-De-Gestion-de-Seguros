package com.vargas.insurtech.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    public ResourceNotFoundException(String recurso, Long id) {
        super(recurso + " no encontrado con ID: " + id);
    }
}

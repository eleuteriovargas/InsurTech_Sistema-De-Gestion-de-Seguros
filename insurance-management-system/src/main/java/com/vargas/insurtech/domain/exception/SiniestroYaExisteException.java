package com.vargas.insurtech.domain.exception;

public class SiniestroYaExisteException extends DomainException {
    public SiniestroYaExisteException(String numeroSiniestro) {
        super("Ya existe un siniestro con numero: " + numeroSiniestro);
    }
}

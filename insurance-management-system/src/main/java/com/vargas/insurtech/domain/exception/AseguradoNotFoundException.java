package com.vargas.insurtech.domain.exception;

public class AseguradoNotFoundException extends DomainException {
    public AseguradoNotFoundException(Long id) {
        super("Asegurado no encontrado con ID: " + id);
    }
    public AseguradoNotFoundException(String campo, String valor) {
        super("Asegurado no encontrado con " + campo + ": " + valor);
    }
}

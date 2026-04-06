package com.vargas.insurtech.domain.valueobject;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactoPersonal {

    @Column(name = "contacto_email")
    private String email;

    @Column(name = "contacto_telefono")
    private String telefono;

    @Column(name = "contacto_telefono_alt")
    private String telefonoAlternativo;
}

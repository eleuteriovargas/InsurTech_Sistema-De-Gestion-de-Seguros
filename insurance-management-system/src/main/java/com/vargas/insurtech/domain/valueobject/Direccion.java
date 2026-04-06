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
public class Direccion {

    @Column(name = "direccion_calle")
    private String calle;

    @Column(name = "direccion_ciudad")
    private String ciudad;

    @Column(name = "direccion_estado")
    private String estado;

    @Column(name = "direccion_codigo_postal")
    private String codigoPostal;

    @Column(name = "direccion_pais")
    private String pais;
}

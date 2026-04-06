package com.vargas.insurtech.application.dto;

import com.vargas.insurtech.domain.enums.EstadoAsegurado;
import com.vargas.insurtech.domain.enums.NivelRiesgo;
import com.vargas.insurtech.domain.enums.TipoAsegurado;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AseguradoResponseDTO {

    private Long id;
    private TipoAsegurado tipoAsegurado;
    private String numeroDocumento;
    private String nombre;
    private String apellido;
    private String razonSocial;
    private LocalDate fechaNacimiento;
    private String email;
    private String telefono;
    private String direccionCalle;
    private String direccionCiudad;
    private String direccionEstado;
    private String direccionCodigoPostal;
    private String direccionPais;
    private EstadoAsegurado estado;
    private NivelRiesgo nivelRiesgo;
    private int totalPolizas;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

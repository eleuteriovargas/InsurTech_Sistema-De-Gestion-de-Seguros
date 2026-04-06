package com.vargas.insurtech.application.dto;

import com.vargas.insurtech.domain.enums.EstadoSiniestro;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiniestroResponseDTO {

    private Long id;
    private String numeroSiniestro;
    private Long polizaId;
    private String numeroPoliza;
    private String descripcion;
    private LocalDate fechaEvento;
    private BigDecimal montoSolicitado;
    private BigDecimal montoAprobado;
    private EstadoSiniestro estado;
    private String motivoRechazo;
    private Long evaluadorId;
    private int totalDocumentos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.vargas.insurtech.application.dto;

import com.vargas.insurtech.domain.enums.EstadoPoliza;
import com.vargas.insurtech.domain.enums.TipoPoliza;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolizaResponseDTO {

    private Long id;
    private String numeroPoliza;
    private Long aseguradoId;
    private String aseguradoNombre;
    private TipoPoliza tipoPoliza;
    private BigDecimal sumaAsegurada;
    private BigDecimal primaBase;
    private BigDecimal primaTotal;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private EstadoPoliza estado;
    private String observaciones;
    private List<CoberturaResponseDTO> coberturas;
    private int totalPrimas;
    private int totalSiniestros;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoberturaResponseDTO {
        private Long id;
        private String nombre;
        private BigDecimal limiteCobertura;
        private BigDecimal deducible;
    }
}

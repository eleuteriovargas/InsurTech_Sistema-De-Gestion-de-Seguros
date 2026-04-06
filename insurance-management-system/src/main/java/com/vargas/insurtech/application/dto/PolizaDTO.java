package com.vargas.insurtech.application.dto;

import com.vargas.insurtech.domain.enums.TipoPoliza;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolizaDTO {

    @NotNull(message = "El ID del asegurado es obligatorio")
    private Long aseguradoId;

    @NotNull(message = "El tipo de poliza es obligatorio")
    private TipoPoliza tipoPoliza;

    @NotNull(message = "La suma asegurada es obligatoria")
    @DecimalMin(value = "0.01", message = "La suma asegurada debe ser mayor a cero")
    private BigDecimal sumaAsegurada;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    private String observaciones;

    private List<Long> coberturaIds;

    private int numeroCuotas;
}

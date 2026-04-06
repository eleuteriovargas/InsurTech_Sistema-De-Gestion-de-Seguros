package com.vargas.insurtech.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiniestroDTO {

    @NotNull(message = "El ID de la poliza es obligatorio")
    private Long polizaId;

    @NotBlank(message = "La descripcion es obligatoria")
    private String descripcion;

    @NotNull(message = "La fecha del evento es obligatoria")
    private LocalDate fechaEvento;

    @NotNull(message = "El monto solicitado es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto solicitado debe ser mayor a cero")
    private BigDecimal montoSolicitado;
}

package com.vargas.insurtech.application.dto;

import com.vargas.insurtech.domain.enums.EstadoPrima;
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
public class PrimaResponseDTO {

    private Long id;
    private Long polizaId;
    private String numeroPoliza;
    private Integer numeroCuota;
    private BigDecimal monto;
    private LocalDate fechaVencimiento;
    private EstadoPrima estado;
    private Integer diasVencida;
    private BigDecimal interesMora;
    private LocalDateTime createdAt;
}

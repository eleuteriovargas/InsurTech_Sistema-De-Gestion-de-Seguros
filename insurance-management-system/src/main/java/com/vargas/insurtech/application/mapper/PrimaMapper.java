package com.vargas.insurtech.application.mapper;

import com.vargas.insurtech.application.dto.PrimaResponseDTO;
import com.vargas.insurtech.domain.entity.Prima;
import org.springframework.stereotype.Component;

@Component
public class PrimaMapper {

    public PrimaResponseDTO toResponseDTO(Prima entity) {
        return PrimaResponseDTO.builder()
                .id(entity.getId())
                .polizaId(entity.getPoliza().getId())
                .numeroPoliza(entity.getPoliza().getNumeroPoliza())
                .numeroCuota(entity.getNumeroCuota())
                .monto(entity.getMonto())
                .fechaVencimiento(entity.getFechaVencimiento())
                .estado(entity.getEstado())
                .diasVencida(entity.getDiasVencida())
                .interesMora(entity.getInteresMora())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

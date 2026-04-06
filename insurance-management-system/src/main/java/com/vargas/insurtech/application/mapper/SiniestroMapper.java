package com.vargas.insurtech.application.mapper;

import com.vargas.insurtech.application.dto.SiniestroResponseDTO;
import com.vargas.insurtech.domain.entity.Siniestro;
import org.springframework.stereotype.Component;

@Component
public class SiniestroMapper {

    public SiniestroResponseDTO toResponseDTO(Siniestro entity) {
        return SiniestroResponseDTO.builder()
                .id(entity.getId())
                .numeroSiniestro(entity.getNumeroSiniestro())
                .polizaId(entity.getPoliza().getId())
                .numeroPoliza(entity.getPoliza().getNumeroPoliza())
                .descripcion(entity.getDescripcion())
                .fechaEvento(entity.getFechaEvento())
                .montoSolicitado(entity.getMontoSolicitado())
                .montoAprobado(entity.getMontoAprobado())
                .estado(entity.getEstado())
                .motivoRechazo(entity.getMotivoRechazo())
                .evaluadorId(entity.getEvaluadorId())
                .totalDocumentos(entity.getDocumentos() != null ? entity.getDocumentos().size() : 0)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

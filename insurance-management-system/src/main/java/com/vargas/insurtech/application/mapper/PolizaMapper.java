package com.vargas.insurtech.application.mapper;

import com.vargas.insurtech.application.dto.PolizaResponseDTO;
import com.vargas.insurtech.domain.entity.Cobertura;
import com.vargas.insurtech.domain.entity.Poliza;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class PolizaMapper {

    public PolizaResponseDTO toResponseDTO(Poliza entity) {
        return PolizaResponseDTO.builder()
                .id(entity.getId())
                .numeroPoliza(entity.getNumeroPoliza())
                .aseguradoId(entity.getAsegurado().getId())
                .aseguradoNombre(entity.getAsegurado().getNombre() + " " +
                        (entity.getAsegurado().getApellido() != null ? entity.getAsegurado().getApellido() : ""))
                .tipoPoliza(entity.getTipoPoliza())
                .sumaAsegurada(entity.getSumaAsegurada())
                .primaBase(entity.getPrimaBase())
                .primaTotal(entity.getPrimaTotal())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .estado(entity.getEstado())
                .observaciones(entity.getObservaciones())
                .coberturas(entity.getCoberturas() != null
                        ? entity.getCoberturas().stream().map(this::toCoberturaDTO).collect(Collectors.toList())
                        : Collections.emptyList())
                .totalPrimas(entity.getPrimas() != null ? entity.getPrimas().size() : 0)
                .totalSiniestros(entity.getSiniestros() != null ? entity.getSiniestros().size() : 0)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private PolizaResponseDTO.CoberturaResponseDTO toCoberturaDTO(Cobertura cobertura) {
        return PolizaResponseDTO.CoberturaResponseDTO.builder()
                .id(cobertura.getId())
                .nombre(cobertura.getNombre())
                .limiteCobertura(cobertura.getLimiteCobertura())
                .deducible(cobertura.getDeducible())
                .build();
    }
}

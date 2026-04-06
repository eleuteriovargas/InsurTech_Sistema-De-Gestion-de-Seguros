package com.vargas.insurtech.application.service;

import com.vargas.insurtech.application.dto.SiniestroDTO;
import com.vargas.insurtech.application.dto.SiniestroResponseDTO;
import com.vargas.insurtech.application.mapper.SiniestroMapper;
import com.vargas.insurtech.domain.entity.Poliza;
import com.vargas.insurtech.domain.entity.Siniestro;
import com.vargas.insurtech.domain.enums.EstadoPoliza;
import com.vargas.insurtech.domain.enums.EstadoSiniestro;
import com.vargas.insurtech.domain.exception.PolizaInvalidaException;
import com.vargas.insurtech.domain.port.in.SiniestroUseCase;
import com.vargas.insurtech.domain.port.out.PolizaRepository;
import com.vargas.insurtech.domain.port.out.SiniestroRepository;
import com.vargas.insurtech.exception.BusinessException;
import com.vargas.insurtech.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SiniestroService implements SiniestroUseCase {

    private final SiniestroRepository siniestroRepository;
    private final PolizaRepository polizaRepository;
    private final SiniestroMapper siniestroMapper;

    @Override
    public SiniestroResponseDTO reportar(SiniestroDTO dto) {
        log.info("Reportando siniestro para poliza ID: {}", dto.getPolizaId());

        Poliza poliza = polizaRepository.findById(dto.getPolizaId())
                .orElseThrow(() -> new ResourceNotFoundException("Poliza", dto.getPolizaId()));

        if (poliza.getEstado() != EstadoPoliza.VIGENTE) {
            throw new PolizaInvalidaException("Solo se pueden reportar siniestros en polizas vigentes");
        }

        if (dto.getFechaEvento().isAfter(LocalDate.now())) {
            throw new BusinessException("La fecha del evento no puede ser futura");
        }

        if (dto.getFechaEvento().isBefore(poliza.getFechaInicio()) || dto.getFechaEvento().isAfter(poliza.getFechaFin())) {
            throw new BusinessException("La fecha del evento debe estar dentro del periodo de vigencia de la poliza");
        }

        if (dto.getMontoSolicitado().compareTo(poliza.getSumaAsegurada()) > 0) {
            throw new BusinessException("El monto solicitado excede la suma asegurada de la poliza");
        }

        Siniestro siniestro = Siniestro.builder()
                .numeroSiniestro(generarNumeroSiniestro())
                .poliza(poliza)
                .descripcion(dto.getDescripcion())
                .fechaEvento(dto.getFechaEvento())
                .montoSolicitado(dto.getMontoSolicitado())
                .estado(EstadoSiniestro.REPORTADO)
                .build();

        Siniestro saved = siniestroRepository.save(siniestro);
        log.info("Siniestro reportado: {} para poliza: {}", saved.getNumeroSiniestro(), poliza.getNumeroPoliza());
        return siniestroMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SiniestroResponseDTO obtenerPorId(Long id) {
        Siniestro siniestro = siniestroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Siniestro", id));
        return siniestroMapper.toResponseDTO(siniestro);
    }

    @Override
    @Transactional(readOnly = true)
    public SiniestroResponseDTO obtenerPorNumero(String numeroSiniestro) {
        Siniestro siniestro = siniestroRepository.findByNumeroSiniestro(numeroSiniestro)
                .orElseThrow(() -> new ResourceNotFoundException("Siniestro no encontrado: " + numeroSiniestro));
        return siniestroMapper.toResponseDTO(siniestro);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SiniestroResponseDTO> listar(Pageable pageable) {
        return siniestroRepository.findAll(pageable).map(siniestroMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SiniestroResponseDTO> listarPorPoliza(Long polizaId, Pageable pageable) {
        return siniestroRepository.findByPolizaId(polizaId, pageable).map(siniestroMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SiniestroResponseDTO> listarPorEstado(EstadoSiniestro estado, Pageable pageable) {
        return siniestroRepository.findByEstado(estado, pageable).map(siniestroMapper::toResponseDTO);
    }

    @Override
    public SiniestroResponseDTO evaluar(Long id, EstadoSiniestro nuevoEstado, String motivo, BigDecimal montoAprobado) {
        log.info("Evaluando siniestro ID: {} -> {}", id, nuevoEstado);

        Siniestro siniestro = siniestroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Siniestro", id));

        if (siniestro.getEstado() != EstadoSiniestro.REPORTADO && siniestro.getEstado() != EstadoSiniestro.EVALUACION) {
            throw new BusinessException("Solo se pueden evaluar siniestros en estado REPORTADO o EVALUACION");
        }

        if (nuevoEstado == EstadoSiniestro.RECHAZADO && (motivo == null || motivo.isBlank())) {
            throw new BusinessException("Se requiere un motivo de rechazo");
        }

        if (nuevoEstado == EstadoSiniestro.APROBADO) {
            if (montoAprobado == null || montoAprobado.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("El monto aprobado debe ser mayor a cero");
            }
            if (montoAprobado.compareTo(siniestro.getMontoSolicitado()) > 0) {
                throw new BusinessException("El monto aprobado no puede exceder el monto solicitado");
            }
            siniestro.setMontoAprobado(montoAprobado);
        }

        siniestro.setEstado(nuevoEstado);
        siniestro.setMotivoRechazo(motivo);

        Siniestro updated = siniestroRepository.save(siniestro);
        log.info("Siniestro evaluado: {} -> {}", updated.getNumeroSiniestro(), nuevoEstado);
        return siniestroMapper.toResponseDTO(updated);
    }

    @Override
    public void eliminar(Long id) {
        siniestroRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Siniestro", id));
        siniestroRepository.deleteById(id);
    }

    private String generarNumeroSiniestro() {
        return "SIN-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

package com.vargas.insurtech.application.service;

import com.vargas.insurtech.application.dto.PolizaDTO;
import com.vargas.insurtech.application.dto.PolizaResponseDTO;
import com.vargas.insurtech.application.mapper.PolizaMapper;
import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.entity.Cobertura;
import com.vargas.insurtech.domain.entity.Poliza;
import com.vargas.insurtech.domain.enums.EstadoAsegurado;
import com.vargas.insurtech.domain.enums.EstadoPoliza;
import com.vargas.insurtech.domain.enums.TipoPoliza;
import com.vargas.insurtech.domain.exception.AseguradoNotFoundException;
import com.vargas.insurtech.domain.exception.PolizaInvalidaException;
import com.vargas.insurtech.domain.port.in.PolizaUseCase;
import com.vargas.insurtech.domain.port.out.AseguradoRepository;
import com.vargas.insurtech.domain.port.out.CoberturaRepository;
import com.vargas.insurtech.domain.port.out.PolizaRepository;
import com.vargas.insurtech.exception.BusinessException;
import com.vargas.insurtech.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PolizaService implements PolizaUseCase {

    private final PolizaRepository polizaRepository;
    private final AseguradoRepository aseguradoRepository;
    private final CoberturaRepository coberturaRepository;
    private final PrimeCalculatorService primeCalculatorService;
    private final PolizaMapper polizaMapper;

    @Override
    public PolizaResponseDTO crear(PolizaDTO dto) {
        log.info("Creando poliza para asegurado ID: {}", dto.getAseguradoId());

        Asegurado asegurado = aseguradoRepository.findById(dto.getAseguradoId())
                .orElseThrow(() -> new AseguradoNotFoundException(dto.getAseguradoId()));

        if (asegurado.getEstado() != EstadoAsegurado.ACTIVO) {
            throw new BusinessException("El asegurado debe estar activo para crear una poliza");
        }

        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new PolizaInvalidaException("La fecha de fin debe ser posterior a la fecha de inicio");
        }

        var primaBase = primeCalculatorService.calcularPrimaBase(dto.getSumaAsegurada(), dto.getTipoPoliza());
        var primaTotal = primeCalculatorService.calcularPrimaTotal(primaBase, asegurado);

        Poliza poliza = Poliza.builder()
                .numeroPoliza(generarNumeroPoliza(dto.getTipoPoliza()))
                .asegurado(asegurado)
                .tipoPoliza(dto.getTipoPoliza())
                .sumaAsegurada(dto.getSumaAsegurada())
                .primaBase(primaBase)
                .primaTotal(primaTotal)
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .observaciones(dto.getObservaciones())
                .build();

        if (dto.getCoberturaIds() != null && !dto.getCoberturaIds().isEmpty()) {
            List<Cobertura> coberturas = coberturaRepository.findByIdIn(dto.getCoberturaIds());
            poliza.setCoberturas(coberturas);
        }

        Poliza saved = polizaRepository.save(poliza);
        log.info("Poliza creada: {} para asegurado ID: {}", saved.getNumeroPoliza(), dto.getAseguradoId());
        return polizaMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PolizaResponseDTO obtenerPorId(Long id) {
        Poliza poliza = polizaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poliza", id));
        return polizaMapper.toResponseDTO(poliza);
    }

    @Override
    @Transactional(readOnly = true)
    public PolizaResponseDTO obtenerPorNumero(String numeroPoliza) {
        Poliza poliza = polizaRepository.findByNumeroPoliza(numeroPoliza)
                .orElseThrow(() -> new ResourceNotFoundException("Poliza no encontrada: " + numeroPoliza));
        return polizaMapper.toResponseDTO(poliza);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PolizaResponseDTO> listar(Pageable pageable) {
        return polizaRepository.findAll(pageable).map(polizaMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PolizaResponseDTO> listarPorAsegurado(Long aseguradoId, Pageable pageable) {
        return polizaRepository.findByAseguradoId(aseguradoId, pageable).map(polizaMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PolizaResponseDTO> listarPorEstado(EstadoPoliza estado, Pageable pageable) {
        return polizaRepository.findByEstado(estado, pageable).map(polizaMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PolizaResponseDTO> listarPorTipo(TipoPoliza tipo, Pageable pageable) {
        return polizaRepository.findByTipoPoliza(tipo, pageable).map(polizaMapper::toResponseDTO);
    }

    @Override
    public PolizaResponseDTO renovar(Long id) {
        log.info("Renovando poliza ID: {}", id);
        Poliza poliza = polizaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poliza", id));

        if (poliza.getEstado() == EstadoPoliza.CANCELADA) {
            throw new PolizaInvalidaException("No se puede renovar una poliza cancelada");
        }

        poliza.setFechaFin(poliza.getFechaFin().plusYears(1));
        poliza.setEstado(EstadoPoliza.VIGENTE);

        var nuevaPrimaBase = primeCalculatorService.calcularPrimaBase(poliza.getSumaAsegurada(), poliza.getTipoPoliza());
        var nuevaPrimaTotal = primeCalculatorService.calcularPrimaTotal(nuevaPrimaBase, poliza.getAsegurado());
        poliza.setPrimaBase(nuevaPrimaBase);
        poliza.setPrimaTotal(nuevaPrimaTotal);

        Poliza updated = polizaRepository.save(poliza);
        log.info("Poliza renovada: {}", updated.getNumeroPoliza());
        return polizaMapper.toResponseDTO(updated);
    }

    @Override
    public PolizaResponseDTO cancelar(Long id) {
        log.info("Cancelando poliza ID: {}", id);
        Poliza poliza = polizaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poliza", id));

        if (poliza.getEstado() == EstadoPoliza.CANCELADA) {
            throw new PolizaInvalidaException("La poliza ya esta cancelada");
        }

        poliza.setEstado(EstadoPoliza.CANCELADA);
        Poliza updated = polizaRepository.save(poliza);
        log.info("Poliza cancelada: {}", updated.getNumeroPoliza());
        return polizaMapper.toResponseDTO(updated);
    }

    @Override
    public PolizaResponseDTO modificarCoberturas(Long id, List<Long> coberturaIds) {
        log.info("Modificando coberturas de poliza ID: {}", id);
        Poliza poliza = polizaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Poliza", id));

        if (poliza.getEstado() != EstadoPoliza.VIGENTE) {
            throw new PolizaInvalidaException("Solo se pueden modificar coberturas de polizas vigentes");
        }

        List<Cobertura> nuevasCoberturas = coberturaRepository.findByIdIn(coberturaIds);
        poliza.setCoberturas(nuevasCoberturas);

        Poliza updated = polizaRepository.save(poliza);
        log.info("Coberturas actualizadas para poliza: {}", updated.getNumeroPoliza());
        return polizaMapper.toResponseDTO(updated);
    }

    @Override
    public void eliminar(Long id) {
        log.info("Eliminando poliza ID: {}", id);
        polizaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Poliza", id));
        polizaRepository.deleteById(id);
    }

    private String generarNumeroPoliza(TipoPoliza tipo) {
        String prefix = switch (tipo) {
            case AUTO -> "AUT";
            case HOGAR -> "HOG";
            case SALUD -> "SAL";
            case VIDA -> "VID";
        };
        return prefix + "-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

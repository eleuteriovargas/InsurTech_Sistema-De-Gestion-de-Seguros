package com.vargas.insurtech.application.service;

import com.vargas.insurtech.application.dto.AseguradoDTO;
import com.vargas.insurtech.application.dto.AseguradoResponseDTO;
import com.vargas.insurtech.application.mapper.AseguradoMapper;
import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.enums.EstadoAsegurado;
import com.vargas.insurtech.domain.exception.AseguradoNotFoundException;
import com.vargas.insurtech.domain.port.in.AseguradoUseCase;
import com.vargas.insurtech.domain.port.out.AseguradoRepository;
import com.vargas.insurtech.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AseguradoService implements AseguradoUseCase {

    private final AseguradoRepository aseguradoRepository;
    private final AseguradoMapper aseguradoMapper;

    @Override
    public AseguradoResponseDTO crear(AseguradoDTO dto) {
        log.info("Creando asegurado con documento: {}", dto.getNumeroDocumento());

        if (aseguradoRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new BusinessException("Ya existe un asegurado con documento: " + dto.getNumeroDocumento());
        }
        if (aseguradoRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Ya existe un asegurado con email: " + dto.getEmail());
        }

        Asegurado asegurado = aseguradoMapper.toEntity(dto);
        Asegurado saved = aseguradoRepository.save(asegurado);

        log.info("Asegurado creado con ID: {}", saved.getId());
        return aseguradoMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AseguradoResponseDTO obtenerPorId(Long id) {
        log.debug("Buscando asegurado por ID: {}", id);
        Asegurado asegurado = aseguradoRepository.findById(id)
                .orElseThrow(() -> new AseguradoNotFoundException(id));
        return aseguradoMapper.toResponseDTO(asegurado);
    }

    @Override
    @Transactional(readOnly = true)
    public AseguradoResponseDTO obtenerPorDocumento(String numeroDocumento) {
        log.debug("Buscando asegurado por documento: {}", numeroDocumento);
        Asegurado asegurado = aseguradoRepository.findByNumeroDocumento(numeroDocumento)
                .orElseThrow(() -> new AseguradoNotFoundException("numeroDocumento", numeroDocumento));
        return aseguradoMapper.toResponseDTO(asegurado);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AseguradoResponseDTO> listar(Pageable pageable) {
        log.debug("Listando asegurados, pagina: {}", pageable.getPageNumber());
        return aseguradoRepository.findAll(pageable)
                .map(aseguradoMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AseguradoResponseDTO> listarPorEstado(EstadoAsegurado estado, Pageable pageable) {
        return aseguradoRepository.findByEstado(estado, pageable)
                .map(aseguradoMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AseguradoResponseDTO> buscarPorNombre(String nombre, Pageable pageable) {
        return aseguradoRepository.findByNombreContainingIgnoreCase(nombre, pageable)
                .map(aseguradoMapper::toResponseDTO);
    }

    @Override
    public AseguradoResponseDTO actualizar(Long id, AseguradoDTO dto) {
        log.info("Actualizando asegurado ID: {}", id);
        Asegurado asegurado = aseguradoRepository.findById(id)
                .orElseThrow(() -> new AseguradoNotFoundException(id));

        aseguradoMapper.updateEntity(asegurado, dto);
        Asegurado updated = aseguradoRepository.save(asegurado);

        log.info("Asegurado actualizado ID: {}", id);
        return aseguradoMapper.toResponseDTO(updated);
    }

    @Override
    public AseguradoResponseDTO cambiarEstado(Long id, EstadoAsegurado nuevoEstado) {
        log.info("Cambiando estado de asegurado ID: {} a {}", id, nuevoEstado);
        Asegurado asegurado = aseguradoRepository.findById(id)
                .orElseThrow(() -> new AseguradoNotFoundException(id));

        validarTransicionEstado(asegurado.getEstado(), nuevoEstado);
        asegurado.setEstado(nuevoEstado);
        Asegurado updated = aseguradoRepository.save(asegurado);

        log.info("Estado cambiado exitosamente para asegurado ID: {}", id);
        return aseguradoMapper.toResponseDTO(updated);
    }

    @Override
    public void eliminar(Long id) {
        log.info("Eliminando asegurado ID: {}", id);
        if (aseguradoRepository.findById(id).isEmpty()) {
            throw new AseguradoNotFoundException(id);
        }
        aseguradoRepository.deleteById(id);
        log.info("Asegurado eliminado ID: {}", id);
    }

    private void validarTransicionEstado(EstadoAsegurado actual, EstadoAsegurado nuevo) {
        if (actual == EstadoAsegurado.CANCELADO) {
            throw new BusinessException("No se puede cambiar el estado de un asegurado cancelado");
        }
        if (actual == EstadoAsegurado.ACTIVO && nuevo == EstadoAsegurado.CANCELADO) {
            throw new BusinessException("Debe suspender al asegurado antes de cancelarlo");
        }
    }
}

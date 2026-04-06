package com.vargas.insurtech.domain.port.in;

import com.vargas.insurtech.application.dto.SiniestroDTO;
import com.vargas.insurtech.application.dto.SiniestroResponseDTO;
import com.vargas.insurtech.domain.enums.EstadoSiniestro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SiniestroUseCase {

    SiniestroResponseDTO reportar(SiniestroDTO dto);

    SiniestroResponseDTO obtenerPorId(Long id);

    SiniestroResponseDTO obtenerPorNumero(String numeroSiniestro);

    Page<SiniestroResponseDTO> listar(Pageable pageable);

    Page<SiniestroResponseDTO> listarPorPoliza(Long polizaId, Pageable pageable);

    Page<SiniestroResponseDTO> listarPorEstado(EstadoSiniestro estado, Pageable pageable);

    SiniestroResponseDTO evaluar(Long id, EstadoSiniestro nuevoEstado, String motivo, java.math.BigDecimal montoAprobado);

    void eliminar(Long id);
}

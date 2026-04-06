package com.vargas.insurtech.domain.port.in;

import com.vargas.insurtech.application.dto.PolizaDTO;
import com.vargas.insurtech.application.dto.PolizaResponseDTO;
import com.vargas.insurtech.domain.enums.EstadoPoliza;
import com.vargas.insurtech.domain.enums.TipoPoliza;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PolizaUseCase {

    PolizaResponseDTO crear(PolizaDTO dto);

    PolizaResponseDTO obtenerPorId(Long id);

    PolizaResponseDTO obtenerPorNumero(String numeroPoliza);

    Page<PolizaResponseDTO> listar(Pageable pageable);

    Page<PolizaResponseDTO> listarPorAsegurado(Long aseguradoId, Pageable pageable);

    Page<PolizaResponseDTO> listarPorEstado(EstadoPoliza estado, Pageable pageable);

    Page<PolizaResponseDTO> listarPorTipo(TipoPoliza tipo, Pageable pageable);

    PolizaResponseDTO renovar(Long id);

    PolizaResponseDTO cancelar(Long id);

    PolizaResponseDTO modificarCoberturas(Long id, java.util.List<Long> coberturaIds);

    void eliminar(Long id);
}

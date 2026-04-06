package com.vargas.insurtech.domain.port.in;

import com.vargas.insurtech.application.dto.AseguradoDTO;
import com.vargas.insurtech.application.dto.AseguradoResponseDTO;
import com.vargas.insurtech.domain.enums.EstadoAsegurado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AseguradoUseCase {

    AseguradoResponseDTO crear(AseguradoDTO dto);

    AseguradoResponseDTO obtenerPorId(Long id);

    AseguradoResponseDTO obtenerPorDocumento(String numeroDocumento);

    Page<AseguradoResponseDTO> listar(Pageable pageable);

    Page<AseguradoResponseDTO> listarPorEstado(EstadoAsegurado estado, Pageable pageable);

    Page<AseguradoResponseDTO> buscarPorNombre(String nombre, Pageable pageable);

    AseguradoResponseDTO actualizar(Long id, AseguradoDTO dto);

    AseguradoResponseDTO cambiarEstado(Long id, EstadoAsegurado nuevoEstado);

    void eliminar(Long id);
}

package com.vargas.insurtech.domain.port.in;

import com.vargas.insurtech.application.dto.PagoDTO;
import com.vargas.insurtech.application.dto.PrimaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PrimaUseCase {

    List<PrimaResponseDTO> generarCuotas(Long polizaId, int numeroCuotas);

    Page<PrimaResponseDTO> listarPorPoliza(Long polizaId, Pageable pageable);

    List<PrimaResponseDTO> obtenerPendientesPorAsegurado(Long aseguradoId);

    PrimaResponseDTO registrarPago(Long primaId, PagoDTO pagoDTO);

    void calcularMoras();
}

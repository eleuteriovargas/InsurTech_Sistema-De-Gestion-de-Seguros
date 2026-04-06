package com.vargas.insurtech.presentation.controller;

import com.vargas.insurtech.application.dto.ApiResponse;
import com.vargas.insurtech.application.dto.PagoDTO;
import com.vargas.insurtech.application.dto.PageResponse;
import com.vargas.insurtech.application.dto.PrimaResponseDTO;
import com.vargas.insurtech.domain.port.in.PrimaUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/primas")
@RequiredArgsConstructor
@Tag(name = "Primas", description = "Gestion de primas y cuotas")
public class PrimaController {

    private final PrimaUseCase primaUseCase;

    @PostMapping("/generar/{polizaId}")
    @Operation(summary = "Generar cuotas para una poliza")
    public ResponseEntity<ApiResponse<List<PrimaResponseDTO>>> generarCuotas(
            @PathVariable Long polizaId,
            @RequestParam(defaultValue = "12") int numeroCuotas) {

        List<PrimaResponseDTO> cuotas = primaUseCase.generarCuotas(polizaId, numeroCuotas);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(cuotas, numeroCuotas + " cuotas generadas exitosamente"));
    }

    @GetMapping("/poliza/{polizaId}")
    @Operation(summary = "Listar primas por poliza")
    public ResponseEntity<ApiResponse<PageResponse<PrimaResponseDTO>>> listarPorPoliza(
            @PathVariable Long polizaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<PrimaResponseDTO> result = primaUseCase.listarPorPoliza(polizaId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/pendientes/asegurado/{aseguradoId}")
    @Operation(summary = "Obtener primas pendientes por asegurado")
    public ResponseEntity<ApiResponse<List<PrimaResponseDTO>>> pendientesPorAsegurado(@PathVariable Long aseguradoId) {
        return ResponseEntity.ok(ApiResponse.success(primaUseCase.obtenerPendientesPorAsegurado(aseguradoId)));
    }

    @PostMapping("/{primaId}/pagar")
    @Operation(summary = "Registrar pago de una prima")
    public ResponseEntity<ApiResponse<PrimaResponseDTO>> registrarPago(
            @PathVariable Long primaId,
            @Valid @RequestBody PagoDTO pagoDTO) {

        return ResponseEntity.ok(ApiResponse.success(primaUseCase.registrarPago(primaId, pagoDTO), "Pago registrado"));
    }
}

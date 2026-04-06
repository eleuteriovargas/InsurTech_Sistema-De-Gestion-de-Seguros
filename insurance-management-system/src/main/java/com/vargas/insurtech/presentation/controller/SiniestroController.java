package com.vargas.insurtech.presentation.controller;

import com.vargas.insurtech.application.dto.ApiResponse;
import com.vargas.insurtech.application.dto.PageResponse;
import com.vargas.insurtech.application.dto.SiniestroDTO;
import com.vargas.insurtech.application.dto.SiniestroResponseDTO;
import com.vargas.insurtech.domain.enums.EstadoSiniestro;
import com.vargas.insurtech.domain.port.in.SiniestroUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/siniestros")
@RequiredArgsConstructor
@Tag(name = "Siniestros", description = "Gestion de siniestros y reclamos")
public class SiniestroController {

    private final SiniestroUseCase siniestroUseCase;

    @PostMapping
    @Operation(summary = "Reportar un nuevo siniestro")
    public ResponseEntity<ApiResponse<SiniestroResponseDTO>> reportar(@Valid @RequestBody SiniestroDTO dto) {
        SiniestroResponseDTO response = siniestroUseCase.reportar(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Siniestro reportado exitosamente"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener siniestro por ID")
    public ResponseEntity<ApiResponse<SiniestroResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(siniestroUseCase.obtenerPorId(id)));
    }

    @GetMapping("/numero/{numeroSiniestro}")
    @Operation(summary = "Obtener siniestro por numero")
    public ResponseEntity<ApiResponse<SiniestroResponseDTO>> obtenerPorNumero(@PathVariable String numeroSiniestro) {
        return ResponseEntity.ok(ApiResponse.success(siniestroUseCase.obtenerPorNumero(numeroSiniestro)));
    }

    @GetMapping
    @Operation(summary = "Listar siniestros con paginacion")
    public ResponseEntity<ApiResponse<PageResponse<SiniestroResponseDTO>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<SiniestroResponseDTO> result = siniestroUseCase.listar(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/poliza/{polizaId}")
    @Operation(summary = "Listar siniestros por poliza")
    public ResponseEntity<ApiResponse<PageResponse<SiniestroResponseDTO>>> listarPorPoliza(
            @PathVariable Long polizaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<SiniestroResponseDTO> result = siniestroUseCase.listarPorPoliza(polizaId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar siniestros por estado")
    public ResponseEntity<ApiResponse<PageResponse<SiniestroResponseDTO>>> listarPorEstado(
            @PathVariable EstadoSiniestro estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<SiniestroResponseDTO> result = siniestroUseCase.listarPorEstado(estado, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PatchMapping("/{id}/evaluar")
    @Operation(summary = "Evaluar siniestro (aprobar/rechazar)")
    public ResponseEntity<ApiResponse<SiniestroResponseDTO>> evaluar(
            @PathVariable Long id,
            @RequestParam EstadoSiniestro estado,
            @RequestParam(required = false) String motivo,
            @RequestParam(required = false) BigDecimal montoAprobado) {

        return ResponseEntity.ok(ApiResponse.success(
                siniestroUseCase.evaluar(id, estado, motivo, montoAprobado), "Siniestro evaluado"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar siniestro")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        siniestroUseCase.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Siniestro eliminado"));
    }
}

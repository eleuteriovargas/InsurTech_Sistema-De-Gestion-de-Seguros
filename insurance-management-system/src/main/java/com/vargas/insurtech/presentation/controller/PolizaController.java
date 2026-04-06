package com.vargas.insurtech.presentation.controller;

import com.vargas.insurtech.application.dto.ApiResponse;
import com.vargas.insurtech.application.dto.PageResponse;
import com.vargas.insurtech.application.dto.PolizaDTO;
import com.vargas.insurtech.application.dto.PolizaResponseDTO;
import com.vargas.insurtech.domain.enums.EstadoPoliza;
import com.vargas.insurtech.domain.enums.TipoPoliza;
import com.vargas.insurtech.domain.port.in.PolizaUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

import java.util.List;

@RestController
@RequestMapping("/polizas")
@RequiredArgsConstructor
@Tag(name = "Polizas", description = "Gestion de polizas de seguro")
public class PolizaController {

    private final PolizaUseCase polizaUseCase;

    @PostMapping
    @Operation(summary = "Crear una nueva poliza")
    public ResponseEntity<ApiResponse<PolizaResponseDTO>> crear(@Valid @RequestBody PolizaDTO dto) {
        PolizaResponseDTO response = polizaUseCase.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Poliza creada exitosamente"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener poliza por ID")
    public ResponseEntity<ApiResponse<PolizaResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(polizaUseCase.obtenerPorId(id)));
    }

    @GetMapping("/numero/{numeroPoliza}")
    @Operation(summary = "Obtener poliza por numero")
    public ResponseEntity<ApiResponse<PolizaResponseDTO>> obtenerPorNumero(@PathVariable String numeroPoliza) {
        return ResponseEntity.ok(ApiResponse.success(polizaUseCase.obtenerPorNumero(numeroPoliza)));
    }

    @GetMapping
    @Operation(summary = "Listar polizas con paginacion")
    public ResponseEntity<ApiResponse<PageResponse<PolizaResponseDTO>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<PolizaResponseDTO> result = polizaUseCase.listar(PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/asegurado/{aseguradoId}")
    @Operation(summary = "Listar polizas por asegurado")
    public ResponseEntity<ApiResponse<PageResponse<PolizaResponseDTO>>> listarPorAsegurado(
            @PathVariable Long aseguradoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<PolizaResponseDTO> result = polizaUseCase.listarPorAsegurado(aseguradoId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar polizas por estado")
    public ResponseEntity<ApiResponse<PageResponse<PolizaResponseDTO>>> listarPorEstado(
            @PathVariable EstadoPoliza estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<PolizaResponseDTO> result = polizaUseCase.listarPorEstado(estado, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/tipo/{tipo}")
    @Operation(summary = "Listar polizas por tipo")
    public ResponseEntity<ApiResponse<PageResponse<PolizaResponseDTO>>> listarPorTipo(
            @PathVariable TipoPoliza tipo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<PolizaResponseDTO> result = polizaUseCase.listarPorTipo(tipo, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PatchMapping("/{id}/renovar")
    @Operation(summary = "Renovar poliza")
    public ResponseEntity<ApiResponse<PolizaResponseDTO>> renovar(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(polizaUseCase.renovar(id), "Poliza renovada"));
    }

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar poliza")
    public ResponseEntity<ApiResponse<PolizaResponseDTO>> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(polizaUseCase.cancelar(id), "Poliza cancelada"));
    }

    @PatchMapping("/{id}/coberturas")
    @Operation(summary = "Modificar coberturas de poliza")
    public ResponseEntity<ApiResponse<PolizaResponseDTO>> modificarCoberturas(
            @PathVariable Long id, @RequestBody List<Long> coberturaIds) {
        return ResponseEntity.ok(ApiResponse.success(polizaUseCase.modificarCoberturas(id, coberturaIds), "Coberturas actualizadas"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar poliza")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        polizaUseCase.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Poliza eliminada"));
    }
}

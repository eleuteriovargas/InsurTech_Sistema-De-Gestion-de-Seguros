package com.vargas.insurtech.presentation.controller;

import com.vargas.insurtech.application.dto.ApiResponse;
import com.vargas.insurtech.application.dto.AseguradoDTO;
import com.vargas.insurtech.application.dto.AseguradoResponseDTO;
import com.vargas.insurtech.application.dto.PageResponse;
import com.vargas.insurtech.domain.enums.EstadoAsegurado;
import com.vargas.insurtech.domain.port.in.AseguradoUseCase;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/asegurados")
@RequiredArgsConstructor
@Tag(name = "Asegurados", description = "Gestion de asegurados")
public class AseguradoController {

    private final AseguradoUseCase aseguradoUseCase;

    @PostMapping
    @Operation(summary = "Crear un nuevo asegurado")
    public ResponseEntity<ApiResponse<AseguradoResponseDTO>> crear(@Valid @RequestBody AseguradoDTO dto) {
        AseguradoResponseDTO response = aseguradoUseCase.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Asegurado creado exitosamente"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener asegurado por ID")
    public ResponseEntity<ApiResponse<AseguradoResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(aseguradoUseCase.obtenerPorId(id)));
    }

    @GetMapping("/documento/{numeroDocumento}")
    @Operation(summary = "Obtener asegurado por numero de documento")
    public ResponseEntity<ApiResponse<AseguradoResponseDTO>> obtenerPorDocumento(@PathVariable String numeroDocumento) {
        return ResponseEntity.ok(ApiResponse.success(aseguradoUseCase.obtenerPorDocumento(numeroDocumento)));
    }

    @GetMapping
    @Operation(summary = "Listar asegurados con paginacion")
    public ResponseEntity<ApiResponse<PageResponse<AseguradoResponseDTO>>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<AseguradoResponseDTO> result = aseguradoUseCase.listar(PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar asegurados por estado")
    public ResponseEntity<ApiResponse<PageResponse<AseguradoResponseDTO>>> listarPorEstado(
            @PathVariable EstadoAsegurado estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AseguradoResponseDTO> result = aseguradoUseCase.listarPorEstado(estado, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar asegurados por nombre")
    public ResponseEntity<ApiResponse<PageResponse<AseguradoResponseDTO>>> buscarPorNombre(
            @RequestParam String nombre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AseguradoResponseDTO> result = aseguradoUseCase.buscarPorNombre(nombre, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos del asegurado")
    public ResponseEntity<ApiResponse<AseguradoResponseDTO>> actualizar(
            @PathVariable Long id, @Valid @RequestBody AseguradoDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(aseguradoUseCase.actualizar(id, dto), "Asegurado actualizado"));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado del asegurado")
    public ResponseEntity<ApiResponse<AseguradoResponseDTO>> cambiarEstado(
            @PathVariable Long id, @RequestParam EstadoAsegurado estado) {
        return ResponseEntity.ok(ApiResponse.success(aseguradoUseCase.cambiarEstado(id, estado), "Estado actualizado"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar asegurado")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        aseguradoUseCase.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Asegurado eliminado"));
    }
}

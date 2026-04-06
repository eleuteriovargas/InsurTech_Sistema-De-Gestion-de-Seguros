package com.vargas.insurtech.presentation.controller;

import com.vargas.insurtech.application.dto.ApiResponse;
import com.vargas.insurtech.application.dto.AseguradoResponseDTO;
import com.vargas.insurtech.application.dto.PageResponse;
import com.vargas.insurtech.application.dto.PolizaResponseDTO;
import com.vargas.insurtech.application.dto.PrimaResponseDTO;
import com.vargas.insurtech.application.dto.SiniestroDTO;
import com.vargas.insurtech.application.dto.SiniestroResponseDTO;
import com.vargas.insurtech.application.mapper.AseguradoMapper;
import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.entity.Usuario;
import com.vargas.insurtech.domain.port.in.PolizaUseCase;
import com.vargas.insurtech.domain.port.in.PrimaUseCase;
import com.vargas.insurtech.domain.port.in.SiniestroUseCase;
import com.vargas.insurtech.domain.port.out.AseguradoRepository;
import com.vargas.insurtech.domain.port.out.UsuarioRepository;
import com.vargas.insurtech.exception.BusinessException;
import com.vargas.insurtech.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/portal")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Portal Cliente", description = "Endpoints de autoservicio para clientes")
public class ClientePortalController {

    private final UsuarioRepository usuarioRepository;
    private final AseguradoRepository aseguradoRepository;
    private final AseguradoMapper aseguradoMapper;
    private final PolizaUseCase polizaUseCase;
    private final SiniestroUseCase siniestroUseCase;
    private final PrimaUseCase primaUseCase;

    @GetMapping("/mi-perfil")
    @Operation(summary = "Obtener perfil del cliente logueado")
    public ResponseEntity<ApiResponse<AseguradoResponseDTO>> miPerfil(Authentication authentication) {
        Asegurado asegurado = getAseguradoFromAuth(authentication);
        return ResponseEntity.ok(ApiResponse.success(aseguradoMapper.toResponseDTO(asegurado)));
    }

    @GetMapping("/mis-polizas")
    @Operation(summary = "Listar polizas del cliente logueado")
    public ResponseEntity<ApiResponse<PageResponse<PolizaResponseDTO>>> misPolizas(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Asegurado asegurado = getAseguradoFromAuth(authentication);
        Page<PolizaResponseDTO> result = polizaUseCase.listarPorAsegurado(asegurado.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/mis-siniestros")
    @Operation(summary = "Listar siniestros del cliente logueado")
    public ResponseEntity<ApiResponse<List<SiniestroResponseDTO>>> misSiniestros(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Asegurado asegurado = getAseguradoFromAuth(authentication);
        // Obtener todas las polizas del asegurado y sus siniestros
        Page<PolizaResponseDTO> polizas = polizaUseCase.listarPorAsegurado(asegurado.getId(), PageRequest.of(0, 100));

        List<SiniestroResponseDTO> siniestros = polizas.getContent().stream()
                .flatMap(p -> {
                    try {
                        return siniestroUseCase.listarPorPoliza(p.getId(), PageRequest.of(0, 100)).getContent().stream();
                    } catch (Exception e) {
                        return java.util.stream.Stream.empty();
                    }
                })
                .toList();

        return ResponseEntity.ok(ApiResponse.success(siniestros));
    }

    @PostMapping("/mis-siniestros")
    @Operation(summary = "Reportar siniestro como cliente")
    public ResponseEntity<ApiResponse<SiniestroResponseDTO>> reportarSiniestro(
            Authentication authentication,
            @Valid @RequestBody SiniestroDTO dto) {

        Asegurado asegurado = getAseguradoFromAuth(authentication);

        // Verificar que la poliza pertenece al asegurado
        Page<PolizaResponseDTO> polizas = polizaUseCase.listarPorAsegurado(asegurado.getId(), PageRequest.of(0, 100));
        boolean polizaPropia = polizas.getContent().stream()
                .anyMatch(p -> p.getId().equals(dto.getPolizaId()));

        if (!polizaPropia) {
            throw new BusinessException("La poliza no pertenece a tu cuenta");
        }

        SiniestroResponseDTO result = siniestroUseCase.reportar(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result, "Siniestro reportado exitosamente"));
    }

    @GetMapping("/mis-primas")
    @Operation(summary = "Obtener primas pendientes del cliente")
    public ResponseEntity<ApiResponse<List<PrimaResponseDTO>>> misPrimas(Authentication authentication) {
        Asegurado asegurado = getAseguradoFromAuth(authentication);
        List<PrimaResponseDTO> primas = primaUseCase.obtenerPendientesPorAsegurado(asegurado.getId());
        return ResponseEntity.ok(ApiResponse.success(primas));
    }

    @GetMapping("/resumen")
    @Operation(summary = "Resumen del portal del cliente")
    public ResponseEntity<ApiResponse<ClienteResumenDTO>> resumen(Authentication authentication) {
        Asegurado asegurado = getAseguradoFromAuth(authentication);

        Page<PolizaResponseDTO> polizas = polizaUseCase.listarPorAsegurado(asegurado.getId(), PageRequest.of(0, 100));
        List<PrimaResponseDTO> primasPendientes = primaUseCase.obtenerPendientesPorAsegurado(asegurado.getId());

        long polizasVigentes = polizas.getContent().stream()
                .filter(p -> "VIGENTE".equals(p.getEstado().name()))
                .count();

        long totalSiniestros = polizas.getContent().stream()
                .mapToInt(PolizaResponseDTO::getTotalSiniestros)
                .sum();

        ClienteResumenDTO resumen = new ClienteResumenDTO(
                asegurado.getId(),
                asegurado.getNombre() + " " + (asegurado.getApellido() != null ? asegurado.getApellido() : ""),
                asegurado.getEmail(),
                asegurado.getEstado().name(),
                asegurado.getNivelRiesgo().name(),
                (int) polizas.getTotalElements(),
                (int) polizasVigentes,
                (int) totalSiniestros,
                primasPendientes.size(),
                primasPendientes.stream()
                        .map(PrimaResponseDTO::getMonto)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add)
        );

        return ResponseEntity.ok(ApiResponse.success(resumen));
    }

    private Asegurado getAseguradoFromAuth(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (usuario.getAseguradoId() == null) {
            throw new BusinessException("Tu cuenta no tiene un asegurado vinculado. Contacta al administrador.");
        }

        return aseguradoRepository.findById(usuario.getAseguradoId())
                .orElseThrow(() -> new ResourceNotFoundException("Asegurado vinculado no encontrado"));
    }

    public record ClienteResumenDTO(
            Long aseguradoId,
            String nombreCompleto,
            String email,
            String estado,
            String nivelRiesgo,
            int totalPolizas,
            int polizasVigentes,
            int totalSiniestros,
            int primasPendientes,
            java.math.BigDecimal montoTotalPendiente
    ) {}
}
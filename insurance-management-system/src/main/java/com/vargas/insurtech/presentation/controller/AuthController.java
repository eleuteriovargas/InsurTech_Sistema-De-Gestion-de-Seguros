package com.vargas.insurtech.presentation.controller;

import com.vargas.insurtech.application.dto.ApiResponse;
import com.vargas.insurtech.application.dto.AuthDTO;
import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.entity.Usuario;
import com.vargas.insurtech.domain.port.out.AseguradoRepository;
import com.vargas.insurtech.domain.port.out.UsuarioRepository;
import com.vargas.insurtech.exception.BusinessException;
import com.vargas.insurtech.exception.ResourceNotFoundException;
import com.vargas.insurtech.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import com.vargas.insurtech.application.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Autenticacion", description = "Login y gestion de usuarios")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final AseguradoRepository aseguradoRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesion")
    public ResponseEntity<ApiResponse<AuthDTO.AuthResponse>> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        log.info("Intento de login: {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        String rol = authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_CUSTOMER");

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername()).orElse(null);

        AuthDTO.AuthResponse response = AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .username(request.getUsername())
                .rol(rol)
                .aseguradoId(usuario != null ? usuario.getAseguradoId() : null)
                .build();

        log.info("Login exitoso: {}", request.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Login exitoso"));
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario (solo ADMIN)")
    public ResponseEntity<ApiResponse<AuthDTO.UserResponse>> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        log.info("Registro de usuario: {}", request.getUsername());

        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("El username ya existe: " + request.getUsername());
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("El email ya esta registrado: " + request.getEmail());
        }

        // Si es ROLE_CUSTOMER, validar que el aseguradoId exista
        if ("ROLE_CUSTOMER".equals(request.getRol())) {
            if (request.getAseguradoId() == null) {
                throw new BusinessException("Para crear un cliente se debe vincular un asegurado");
            }
            aseguradoRepository.findById(request.getAseguradoId())
                    .orElseThrow(() -> new BusinessException("El asegurado con ID " + request.getAseguradoId() + " no existe"));

            // Verificar que no haya otro usuario vinculado a ese asegurado
            usuarioRepository.findByAseguradoId(request.getAseguradoId())
                    .ifPresent(u -> {
                        throw new BusinessException("El asegurado ya tiene un usuario vinculado: " + u.getUsername());
                    });
        }

        Usuario usuario = Usuario.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .nombreCompleto(request.getNombreCompleto())
                .rol(request.getRol())
                .activo(true)
                .aseguradoId(request.getAseguradoId())
                .build();

        Usuario saved = usuarioRepository.save(usuario);
        log.info("Usuario registrado: {} con rol {}", request.getUsername(), request.getRol());

        return ResponseEntity.ok(ApiResponse.created(toUserResponse(saved), "Usuario registrado exitosamente"));
    }

    @GetMapping("/usuarios")
    @Operation(summary = "Listar usuarios con paginacion y filtros (solo ADMIN)")
    public ResponseEntity<ApiResponse<PageResponse<AuthDTO.UserResponse>>> listarUsuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String search) {

        Page<Usuario> resultado;
        PageRequest pageable = PageRequest.of(page, size, Sort.by("id").descending());

        if (search != null && !search.isBlank() && rol != null && !rol.isBlank()) {
            resultado = usuarioRepository.findByRolAndSearch(rol, search.toLowerCase(), pageable);
        } else if (rol != null && !rol.isBlank()) {
            resultado = usuarioRepository.findByRol(rol, pageable);
        } else if (search != null && !search.isBlank()) {
            resultado = usuarioRepository.findBySearch(search.toLowerCase(), pageable);
        } else {
            resultado = usuarioRepository.findAllPaged(pageable);
        }

        Page<AuthDTO.UserResponse> response = resultado.map(this::toUserResponse);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(response)));
    }

    @PatchMapping("/usuarios/{id}/estado")
    @Operation(summary = "Activar/desactivar usuario (solo ADMIN)")
    public ResponseEntity<ApiResponse<AuthDTO.UserResponse>> cambiarEstadoUsuario(
            @PathVariable Long id, @RequestParam boolean activo) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        usuario.setActivo(activo);
        Usuario updated = usuarioRepository.save(usuario);

        log.info("Usuario {} {}", updated.getUsername(), activo ? "activado" : "desactivado");
        return ResponseEntity.ok(ApiResponse.success(toUserResponse(updated),
                "Usuario " + (activo ? "activado" : "desactivado")));
    }

    @PatchMapping("/usuarios/{id}/rol")
    @Operation(summary = "Cambiar rol de usuario (solo ADMIN)")
    public ResponseEntity<ApiResponse<AuthDTO.UserResponse>> cambiarRolUsuario(
            @PathVariable Long id, @RequestParam String rol) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        usuario.setRol(rol);
        Usuario updated = usuarioRepository.save(usuario);

        log.info("Rol de usuario {} cambiado a {}", updated.getUsername(), rol);
        return ResponseEntity.ok(ApiResponse.success(toUserResponse(updated), "Rol actualizado"));
    }

    @PatchMapping("/usuarios/{id}/password")
    @Operation(summary = "Cambiar contraseña de usuario (solo ADMIN)")
    public ResponseEntity<ApiResponse<AuthDTO.UserResponse>> cambiarPassword(
            @PathVariable Long id,
            @RequestBody AuthDTO.ChangePasswordRequest request) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new BusinessException("La contraseña debe tener al menos 6 caracteres");
        }

        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        Usuario updated = usuarioRepository.save(usuario);

        log.info("Contraseña actualizada para usuario: {}", updated.getUsername());
        return ResponseEntity.ok(ApiResponse.success(toUserResponse(updated), "Contraseña actualizada"));
    }

    @PatchMapping("/mi-password")
    @Operation(summary = "Cambiar mi propia contraseña (cualquier usuario autenticado)")
    public ResponseEntity<ApiResponse<String>> cambiarMiPassword(
            Authentication authentication,
            @RequestBody AuthDTO.ChangeMyPasswordRequest request) {

        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
            throw new BusinessException("La contraseña actual es incorrecta");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new BusinessException("La nueva contraseña debe tener al menos 6 caracteres");
        }

        usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);

        log.info("Usuario {} cambió su contraseña", username);
        return ResponseEntity.ok(ApiResponse.success("Contraseña actualizada exitosamente", "Contraseña actualizada"));
    }

    @PatchMapping("/usuarios/{id}/vincular-asegurado")
    @Operation(summary = "Vincular un asegurado a un usuario (solo ADMIN)")
    public ResponseEntity<ApiResponse<AuthDTO.UserResponse>> vincularAsegurado(
            @PathVariable Long id, @RequestParam Long aseguradoId) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        aseguradoRepository.findById(aseguradoId)
                .orElseThrow(() -> new BusinessException("Asegurado con ID " + aseguradoId + " no existe"));

        usuarioRepository.findByAseguradoId(aseguradoId)
                .ifPresent(u -> {
                    if (!u.getId().equals(id)) {
                        throw new BusinessException("El asegurado ya esta vinculado al usuario: " + u.getUsername());
                    }
                });

        usuario.setAseguradoId(aseguradoId);
        Usuario updated = usuarioRepository.save(usuario);

        log.info("Usuario {} vinculado a asegurado ID {}", updated.getUsername(), aseguradoId);
        return ResponseEntity.ok(ApiResponse.success(toUserResponse(updated), "Asegurado vinculado"));
    }

    private AuthDTO.UserResponse toUserResponse(Usuario u) {
        String aseguradoNombre = null;
        if (u.getAseguradoId() != null) {
            aseguradoNombre = aseguradoRepository.findById(u.getAseguradoId())
                    .map(a -> a.getNombre() + " " + (a.getApellido() != null ? a.getApellido() : ""))
                    .orElse(null);
        }

        return AuthDTO.UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .nombreCompleto(u.getNombreCompleto())
                .rol(u.getRol())
                .activo(u.getActivo())
                .aseguradoId(u.getAseguradoId())
                .aseguradoNombre(aseguradoNombre)
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                .build();
    }
}
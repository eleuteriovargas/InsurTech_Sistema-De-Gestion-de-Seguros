package com.vargas.insurtech.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "El username es obligatorio")
        private String username;

        @NotBlank(message = "El password es obligatorio")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "El username es obligatorio")
        @Size(min = 3, max = 50)
        private String username;

        @NotBlank(message = "El password es obligatorio")
        @Size(min = 6, max = 100)
        private String password;

        @NotBlank(message = "El email es obligatorio")
        @Email
        private String email;

        @NotBlank(message = "El nombre completo es obligatorio")
        private String nombreCompleto;

        @NotBlank(message = "El rol es obligatorio")
        private String rol;

        private Long aseguradoId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
        private String username;
        private String rol;
        private Long aseguradoId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String nombreCompleto;
        private String rol;
        private Boolean activo;
        private Long aseguradoId;
        private String aseguradoNombre;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 6, max = 100)
        private String newPassword;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangeMyPasswordRequest {
        @NotBlank(message = "La contraseña actual es obligatoria")
        private String currentPassword;

        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 6, max = 100)
        private String newPassword;
    }
}
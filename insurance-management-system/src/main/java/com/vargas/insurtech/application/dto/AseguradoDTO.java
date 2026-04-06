package com.vargas.insurtech.application.dto;

import com.vargas.insurtech.domain.enums.NivelRiesgo;
import com.vargas.insurtech.domain.enums.TipoAsegurado;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AseguradoDTO {

    @NotNull(message = "El tipo de asegurado es obligatorio")
    private TipoAsegurado tipoAsegurado;

    @NotBlank(message = "El numero de documento es obligatorio")
    @Size(max = 20, message = "El numero de documento no puede exceder 20 caracteres")
    private String numeroDocumento;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @Size(max = 100, message = "El apellido no puede exceder 100 caracteres")
    private String apellido;

    @Size(max = 200)
    private String razonSocial;

    private LocalDate fechaNacimiento;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe tener un formato valido")
    private String email;

    @NotBlank(message = "El telefono es obligatorio")
    @Size(max = 20, message = "El telefono no puede exceder 20 caracteres")
    private String telefono;

    private String direccionCalle;
    private String direccionCiudad;
    private String direccionEstado;
    private String direccionCodigoPostal;
    private String direccionPais;

    private String contactoEmail;
    private String contactoTelefono;
    private String contactoTelefonoAlt;

    private NivelRiesgo nivelRiesgo;
}

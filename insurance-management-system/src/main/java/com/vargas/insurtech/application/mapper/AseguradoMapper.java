package com.vargas.insurtech.application.mapper;

import com.vargas.insurtech.application.dto.AseguradoDTO;
import com.vargas.insurtech.application.dto.AseguradoResponseDTO;
import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.enums.NivelRiesgo;
import com.vargas.insurtech.domain.valueobject.ContactoPersonal;
import com.vargas.insurtech.domain.valueobject.Direccion;
import org.springframework.stereotype.Component;

@Component
public class AseguradoMapper {

    public Asegurado toEntity(AseguradoDTO dto) {
        Asegurado asegurado = Asegurado.builder()
                .tipoAsegurado(dto.getTipoAsegurado())
                .numeroDocumento(dto.getNumeroDocumento())
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .razonSocial(dto.getRazonSocial())
                .fechaNacimiento(dto.getFechaNacimiento())
                .email(dto.getEmail())
                .telefono(dto.getTelefono())
                .nivelRiesgo(dto.getNivelRiesgo() != null ? dto.getNivelRiesgo() : NivelRiesgo.BAJO)
                .direccion(Direccion.builder()
                        .calle(dto.getDireccionCalle())
                        .ciudad(dto.getDireccionCiudad())
                        .estado(dto.getDireccionEstado())
                        .codigoPostal(dto.getDireccionCodigoPostal())
                        .pais(dto.getDireccionPais())
                        .build())
                .contactoPersonal(ContactoPersonal.builder()
                        .email(dto.getContactoEmail())
                        .telefono(dto.getContactoTelefono())
                        .telefonoAlternativo(dto.getContactoTelefonoAlt())
                        .build())
                .build();
        return asegurado;
    }

    public AseguradoResponseDTO toResponseDTO(Asegurado entity) {
        return AseguradoResponseDTO.builder()
                .id(entity.getId())
                .tipoAsegurado(entity.getTipoAsegurado())
                .numeroDocumento(entity.getNumeroDocumento())
                .nombre(entity.getNombre())
                .apellido(entity.getApellido())
                .razonSocial(entity.getRazonSocial())
                .fechaNacimiento(entity.getFechaNacimiento())
                .email(entity.getEmail())
                .telefono(entity.getTelefono())
                .direccionCalle(entity.getDireccion() != null ? entity.getDireccion().getCalle() : null)
                .direccionCiudad(entity.getDireccion() != null ? entity.getDireccion().getCiudad() : null)
                .direccionEstado(entity.getDireccion() != null ? entity.getDireccion().getEstado() : null)
                .direccionCodigoPostal(entity.getDireccion() != null ? entity.getDireccion().getCodigoPostal() : null)
                .direccionPais(entity.getDireccion() != null ? entity.getDireccion().getPais() : null)
                .estado(entity.getEstado())
                .nivelRiesgo(entity.getNivelRiesgo())
                .totalPolizas(entity.getPolizas() != null ? entity.getPolizas().size() : 0)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntity(Asegurado entity, AseguradoDTO dto) {
        entity.setNombre(dto.getNombre());
        entity.setApellido(dto.getApellido());
        entity.setRazonSocial(dto.getRazonSocial());
        entity.setFechaNacimiento(dto.getFechaNacimiento());
        entity.setEmail(dto.getEmail());
        entity.setTelefono(dto.getTelefono());
        if (dto.getNivelRiesgo() != null) {
            entity.setNivelRiesgo(dto.getNivelRiesgo());
        }
        entity.setDireccion(Direccion.builder()
                .calle(dto.getDireccionCalle())
                .ciudad(dto.getDireccionCiudad())
                .estado(dto.getDireccionEstado())
                .codigoPostal(dto.getDireccionCodigoPostal())
                .pais(dto.getDireccionPais())
                .build());
        entity.setContactoPersonal(ContactoPersonal.builder()
                .email(dto.getContactoEmail())
                .telefono(dto.getContactoTelefono())
                .telefonoAlternativo(dto.getContactoTelefonoAlt())
                .build());
    }
}

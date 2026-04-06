package com.vargas.insurtech.domain.entity;

import com.vargas.insurtech.domain.enums.EstadoAsegurado;
import com.vargas.insurtech.domain.enums.NivelRiesgo;
import com.vargas.insurtech.domain.enums.TipoAsegurado;
import com.vargas.insurtech.domain.valueobject.ContactoPersonal;
import com.vargas.insurtech.domain.valueobject.Direccion;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "asegurados")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asegurado extends BaseAuditEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_asegurado", nullable = false, length = 20)
    private TipoAsegurado tipoAsegurado;

    @Column(name = "numero_documento", nullable = false, unique = true, length = 20)
    private String numeroDocumento;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String apellido;

    @Column(name = "razon_social", length = 200)
    private String razonSocial;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 20)
    private String telefono;

    @Embedded
    private Direccion direccion;

    @Embedded
    private ContactoPersonal contactoPersonal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private EstadoAsegurado estado = EstadoAsegurado.ACTIVO;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_riesgo", nullable = false, length = 10)
    @Builder.Default
    private NivelRiesgo nivelRiesgo = NivelRiesgo.BAJO;

    @OneToMany(mappedBy = "asegurado", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Poliza> polizas = new ArrayList<>();
}

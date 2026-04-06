package com.vargas.insurtech.domain.entity;

import com.vargas.insurtech.domain.enums.EstadoPoliza;
import com.vargas.insurtech.domain.enums.TipoPoliza;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "polizas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Poliza extends BaseAuditEntity {

    @Column(name = "numero_poliza", nullable = false, unique = true, length = 30)
    private String numeroPoliza;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asegurado_id", nullable = false)
    private Asegurado asegurado;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_poliza", nullable = false, length = 10)
    private TipoPoliza tipoPoliza;

    @Column(name = "suma_asegurada", nullable = false, precision = 15, scale = 2)
    private BigDecimal sumaAsegurada;

    @Column(name = "prima_base", nullable = false, precision = 15, scale = 2)
    private BigDecimal primaBase;

    @Column(name = "prima_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal primaTotal;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private EstadoPoliza estado = EstadoPoliza.VIGENTE;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "polizas_coberturas",
            joinColumns = @JoinColumn(name = "poliza_id"),
            inverseJoinColumns = @JoinColumn(name = "cobertura_id")
    )
    @Builder.Default
    private List<Cobertura> coberturas = new ArrayList<>();

    @OneToMany(mappedBy = "poliza", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Prima> primas = new ArrayList<>();

    @OneToMany(mappedBy = "poliza", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Siniestro> siniestros = new ArrayList<>();
}

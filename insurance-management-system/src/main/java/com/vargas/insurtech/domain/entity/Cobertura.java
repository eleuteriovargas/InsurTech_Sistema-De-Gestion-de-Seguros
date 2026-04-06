package com.vargas.insurtech.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "coberturas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cobertura extends BaseAuditEntity {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "limite_cobertura", nullable = false, precision = 15, scale = 2)
    private BigDecimal limiteCobertura;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal deducible;

    @Column(columnDefinition = "TEXT")
    private String exclusiones;

    @ManyToMany(mappedBy = "coberturas", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Poliza> polizas = new ArrayList<>();
}

package com.vargas.insurtech.domain.entity;

import com.vargas.insurtech.domain.enums.EstadoSiniestro;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
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
@Table(name = "siniestros")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Siniestro extends BaseAuditEntity {

    @Column(name = "numero_siniestro", nullable = false, unique = true, length = 30)
    private String numeroSiniestro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poliza_id", nullable = false)
    private Poliza poliza;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_evento", nullable = false)
    private LocalDate fechaEvento;

    @Column(name = "monto_solicitado", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoSolicitado;

    @Column(name = "monto_aprobado", precision = 15, scale = 2)
    private BigDecimal montoAprobado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private EstadoSiniestro estado = EstadoSiniestro.REPORTADO;

    @Column(name = "motivo_rechazo", length = 500)
    private String motivoRechazo;

    @Column(name = "evaluador_id")
    private Long evaluadorId;

    @OneToMany(mappedBy = "siniestro", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DocumentoSiniestro> documentos = new ArrayList<>();
}

package com.vargas.insurtech.application.service;

import com.vargas.insurtech.application.dto.SiniestroDTO;
import com.vargas.insurtech.application.dto.SiniestroResponseDTO;
import com.vargas.insurtech.application.mapper.SiniestroMapper;
import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.entity.Poliza;
import com.vargas.insurtech.domain.entity.Siniestro;
import com.vargas.insurtech.domain.enums.EstadoPoliza;
import com.vargas.insurtech.domain.enums.EstadoSiniestro;
import com.vargas.insurtech.domain.enums.TipoPoliza;
import com.vargas.insurtech.domain.exception.PolizaInvalidaException;
import com.vargas.insurtech.domain.port.out.PolizaRepository;
import com.vargas.insurtech.domain.port.out.SiniestroRepository;
import com.vargas.insurtech.exception.BusinessException;
import com.vargas.insurtech.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiniestroServiceTest {

    @Mock
    private SiniestroRepository siniestroRepository;
    @Mock
    private PolizaRepository polizaRepository;
    @Mock
    private SiniestroMapper siniestroMapper;

    @InjectMocks
    private SiniestroService siniestroService;

    private Poliza poliza;
    private Siniestro siniestro;
    private SiniestroDTO siniestroDTO;
    private SiniestroResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        Asegurado asegurado = Asegurado.builder().nombre("Juan").apellido("Perez").build();
        asegurado.setId(1L);

        poliza = Poliza.builder()
                .numeroPoliza("AUT-2026-ABCD1234")
                .asegurado(asegurado)
                .tipoPoliza(TipoPoliza.AUTO)
                .sumaAsegurada(new BigDecimal("500000.00"))
                .primaBase(new BigDecimal("17500.00"))
                .primaTotal(new BigDecimal("17500.00"))
                .fechaInicio(LocalDate.now().minusMonths(6))
                .fechaFin(LocalDate.now().plusMonths(6))
                .estado(EstadoPoliza.VIGENTE)
                .build();
        poliza.setId(1L);

        siniestro = Siniestro.builder()
                .numeroSiniestro("SIN-2026-ABCD1234")
                .poliza(poliza)
                .descripcion("Choque vehicular")
                .fechaEvento(LocalDate.now().minusDays(5))
                .montoSolicitado(new BigDecimal("100000.00"))
                .estado(EstadoSiniestro.REPORTADO)
                .build();
        siniestro.setId(1L);

        siniestroDTO = SiniestroDTO.builder()
                .polizaId(1L)
                .descripcion("Choque vehicular")
                .fechaEvento(LocalDate.now().minusDays(5))
                .montoSolicitado(new BigDecimal("100000.00"))
                .build();

        responseDTO = SiniestroResponseDTO.builder()
                .id(1L)
                .numeroSiniestro("SIN-2026-ABCD1234")
                .polizaId(1L)
                .estado(EstadoSiniestro.REPORTADO)
                .montoSolicitado(new BigDecimal("100000.00"))
                .build();
    }

    @Test
    @DisplayName("Reportar siniestro exitosamente")
    void reportarSiniestro_Exitoso() {
        when(polizaRepository.findById(1L)).thenReturn(Optional.of(poliza));
        when(siniestroRepository.save(any(Siniestro.class))).thenReturn(siniestro);
        when(siniestroMapper.toResponseDTO(any(Siniestro.class))).thenReturn(responseDTO);

        SiniestroResponseDTO result = siniestroService.reportar(siniestroDTO);

        assertThat(result).isNotNull();
        assertThat(result.getEstado()).isEqualTo(EstadoSiniestro.REPORTADO);
        verify(siniestroRepository).save(any(Siniestro.class));
    }

    @Test
    @DisplayName("Reportar siniestro en poliza no vigente lanza excepcion")
    void reportarSiniestro_PolizaNoVigente() {
        poliza.setEstado(EstadoPoliza.CANCELADA);
        when(polizaRepository.findById(1L)).thenReturn(Optional.of(poliza));

        assertThatThrownBy(() -> siniestroService.reportar(siniestroDTO))
                .isInstanceOf(PolizaInvalidaException.class)
                .hasMessageContaining("vigentes");
    }

    @Test
    @DisplayName("Reportar siniestro con fecha futura lanza excepcion")
    void reportarSiniestro_FechaFutura() {
        siniestroDTO.setFechaEvento(LocalDate.now().plusDays(5));
        when(polizaRepository.findById(1L)).thenReturn(Optional.of(poliza));

        assertThatThrownBy(() -> siniestroService.reportar(siniestroDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("futura");
    }

    @Test
    @DisplayName("Reportar siniestro con monto mayor a suma asegurada lanza excepcion")
    void reportarSiniestro_MontoExcedeSuma() {
        siniestroDTO.setMontoSolicitado(new BigDecimal("999999.00"));
        when(polizaRepository.findById(1L)).thenReturn(Optional.of(poliza));

        assertThatThrownBy(() -> siniestroService.reportar(siniestroDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("excede");
    }

    @Test
    @DisplayName("Evaluar siniestro - aprobar exitosamente")
    void evaluarSiniestro_Aprobar() {
        when(siniestroRepository.findById(1L)).thenReturn(Optional.of(siniestro));
        when(siniestroRepository.save(any(Siniestro.class))).thenReturn(siniestro);
        when(siniestroMapper.toResponseDTO(any(Siniestro.class))).thenReturn(responseDTO);

        SiniestroResponseDTO result = siniestroService.evaluar(1L, EstadoSiniestro.APROBADO, null, new BigDecimal("80000.00"));

        assertThat(result).isNotNull();
        verify(siniestroRepository).save(any(Siniestro.class));
    }

    @Test
    @DisplayName("Evaluar siniestro - rechazar sin motivo lanza excepcion")
    void evaluarSiniestro_RechazarSinMotivo() {
        when(siniestroRepository.findById(1L)).thenReturn(Optional.of(siniestro));

        assertThatThrownBy(() -> siniestroService.evaluar(1L, EstadoSiniestro.RECHAZADO, null, null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("motivo");
    }

    @Test
    @DisplayName("Evaluar siniestro ya aprobado lanza excepcion")
    void evaluarSiniestro_YaAprobado() {
        siniestro.setEstado(EstadoSiniestro.APROBADO);
        when(siniestroRepository.findById(1L)).thenReturn(Optional.of(siniestro));

        assertThatThrownBy(() -> siniestroService.evaluar(1L, EstadoSiniestro.RECHAZADO, "Motivo", null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("REPORTADO o EVALUACION");
    }

    @Test
    @DisplayName("Obtener siniestro no encontrado lanza excepcion")
    void obtenerSiniestro_NoEncontrado() {
        when(siniestroRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> siniestroService.obtenerPorId(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

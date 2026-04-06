package com.vargas.insurtech.application.service;

import com.vargas.insurtech.application.dto.PolizaDTO;
import com.vargas.insurtech.application.dto.PolizaResponseDTO;
import com.vargas.insurtech.application.mapper.PolizaMapper;
import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.entity.Poliza;
import com.vargas.insurtech.domain.enums.EstadoAsegurado;
import com.vargas.insurtech.domain.enums.EstadoPoliza;
import com.vargas.insurtech.domain.enums.NivelRiesgo;
import com.vargas.insurtech.domain.enums.TipoAsegurado;
import com.vargas.insurtech.domain.enums.TipoPoliza;
import com.vargas.insurtech.domain.exception.AseguradoNotFoundException;
import com.vargas.insurtech.domain.exception.PolizaInvalidaException;
import com.vargas.insurtech.domain.port.out.AseguradoRepository;
import com.vargas.insurtech.domain.port.out.CoberturaRepository;
import com.vargas.insurtech.domain.port.out.PolizaRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PolizaServiceTest {

    @Mock
    private PolizaRepository polizaRepository;
    @Mock
    private AseguradoRepository aseguradoRepository;
    @Mock
    private CoberturaRepository coberturaRepository;
    @Mock
    private PrimeCalculatorService primeCalculatorService;
    @Mock
    private PolizaMapper polizaMapper;

    @InjectMocks
    private PolizaService polizaService;

    private Asegurado asegurado;
    private Poliza poliza;
    private PolizaDTO polizaDTO;
    private PolizaResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        asegurado = Asegurado.builder()
                .tipoAsegurado(TipoAsegurado.PERSONA_NATURAL)
                .numeroDocumento("12345678")
                .nombre("Juan")
                .apellido("Perez")
                .email("juan@test.com")
                .telefono("5551234567")
                .estado(EstadoAsegurado.ACTIVO)
                .nivelRiesgo(NivelRiesgo.BAJO)
                .build();
        asegurado.setId(1L);

        poliza = Poliza.builder()
                .numeroPoliza("AUT-2026-ABCD1234")
                .asegurado(asegurado)
                .tipoPoliza(TipoPoliza.AUTO)
                .sumaAsegurada(new BigDecimal("500000.00"))
                .primaBase(new BigDecimal("17500.00"))
                .primaTotal(new BigDecimal("17500.00"))
                .fechaInicio(LocalDate.now())
                .fechaFin(LocalDate.now().plusYears(1))
                .estado(EstadoPoliza.VIGENTE)
                .build();
        poliza.setId(1L);

        polizaDTO = PolizaDTO.builder()
                .aseguradoId(1L)
                .tipoPoliza(TipoPoliza.AUTO)
                .sumaAsegurada(new BigDecimal("500000.00"))
                .fechaInicio(LocalDate.now())
                .fechaFin(LocalDate.now().plusYears(1))
                .build();

        responseDTO = PolizaResponseDTO.builder()
                .id(1L)
                .numeroPoliza("AUT-2026-ABCD1234")
                .aseguradoId(1L)
                .tipoPoliza(TipoPoliza.AUTO)
                .sumaAsegurada(new BigDecimal("500000.00"))
                .primaBase(new BigDecimal("17500.00"))
                .primaTotal(new BigDecimal("17500.00"))
                .estado(EstadoPoliza.VIGENTE)
                .build();
    }

    @Test
    @DisplayName("Crear poliza exitosamente")
    void crearPoliza_Exitoso() {
        when(aseguradoRepository.findById(1L)).thenReturn(Optional.of(asegurado));
        when(primeCalculatorService.calcularPrimaBase(any(), any())).thenReturn(new BigDecimal("17500.00"));
        when(primeCalculatorService.calcularPrimaTotal(any(), any())).thenReturn(new BigDecimal("17500.00"));
        when(polizaRepository.save(any(Poliza.class))).thenReturn(poliza);
        when(polizaMapper.toResponseDTO(any(Poliza.class))).thenReturn(responseDTO);

        PolizaResponseDTO result = polizaService.crear(polizaDTO);

        assertThat(result).isNotNull();
        assertThat(result.getTipoPoliza()).isEqualTo(TipoPoliza.AUTO);
        assertThat(result.getPrimaTotal()).isEqualByComparingTo("17500.00");
        verify(polizaRepository).save(any(Poliza.class));
    }

    @Test
    @DisplayName("Crear poliza con asegurado inexistente lanza excepcion")
    void crearPoliza_AseguradoNoExiste() {
        when(aseguradoRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> polizaService.crear(polizaDTO))
                .isInstanceOf(AseguradoNotFoundException.class);
    }

    @Test
    @DisplayName("Crear poliza con asegurado inactivo lanza excepcion")
    void crearPoliza_AseguradoInactivo() {
        asegurado.setEstado(EstadoAsegurado.SUSPENDIDO);
        when(aseguradoRepository.findById(1L)).thenReturn(Optional.of(asegurado));

        assertThatThrownBy(() -> polizaService.crear(polizaDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("activo");
    }

    @Test
    @DisplayName("Crear poliza con fechas invalidas lanza excepcion")
    void crearPoliza_FechasInvalidas() {
        polizaDTO.setFechaFin(LocalDate.now().minusDays(1));
        polizaDTO.setFechaInicio(LocalDate.now());
        when(aseguradoRepository.findById(1L)).thenReturn(Optional.of(asegurado));

        assertThatThrownBy(() -> polizaService.crear(polizaDTO))
                .isInstanceOf(PolizaInvalidaException.class)
                .hasMessageContaining("fecha");
    }

    @Test
    @DisplayName("Cancelar poliza exitosamente")
    void cancelarPoliza_Exitoso() {
        when(polizaRepository.findById(1L)).thenReturn(Optional.of(poliza));
        when(polizaRepository.save(any(Poliza.class))).thenReturn(poliza);
        when(polizaMapper.toResponseDTO(any(Poliza.class))).thenReturn(responseDTO);

        PolizaResponseDTO result = polizaService.cancelar(1L);

        assertThat(result).isNotNull();
        verify(polizaRepository).save(any(Poliza.class));
    }

    @Test
    @DisplayName("Cancelar poliza ya cancelada lanza excepcion")
    void cancelarPoliza_YaCancelada() {
        poliza.setEstado(EstadoPoliza.CANCELADA);
        when(polizaRepository.findById(1L)).thenReturn(Optional.of(poliza));

        assertThatThrownBy(() -> polizaService.cancelar(1L))
                .isInstanceOf(PolizaInvalidaException.class)
                .hasMessageContaining("cancelada");
    }

    @Test
    @DisplayName("Renovar poliza cancelada lanza excepcion")
    void renovarPoliza_Cancelada() {
        poliza.setEstado(EstadoPoliza.CANCELADA);
        when(polizaRepository.findById(1L)).thenReturn(Optional.of(poliza));

        assertThatThrownBy(() -> polizaService.renovar(1L))
                .isInstanceOf(PolizaInvalidaException.class)
                .hasMessageContaining("cancelada");
    }

    @Test
    @DisplayName("Obtener poliza no encontrada lanza excepcion")
    void obtenerPoliza_NoEncontrada() {
        when(polizaRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> polizaService.obtenerPorId(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

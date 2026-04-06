package com.vargas.insurtech.application.service;

import com.vargas.insurtech.application.dto.AseguradoDTO;
import com.vargas.insurtech.application.dto.AseguradoResponseDTO;
import com.vargas.insurtech.application.mapper.AseguradoMapper;
import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.enums.EstadoAsegurado;
import com.vargas.insurtech.domain.enums.NivelRiesgo;
import com.vargas.insurtech.domain.enums.TipoAsegurado;
import com.vargas.insurtech.domain.exception.AseguradoNotFoundException;
import com.vargas.insurtech.domain.port.out.AseguradoRepository;
import com.vargas.insurtech.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AseguradoServiceTest {

    @Mock
    private AseguradoRepository aseguradoRepository;

    @Mock
    private AseguradoMapper aseguradoMapper;

    @InjectMocks
    private AseguradoService aseguradoService;

    private AseguradoDTO aseguradoDTO;
    private Asegurado asegurado;
    private AseguradoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        aseguradoDTO = AseguradoDTO.builder()
                .tipoAsegurado(TipoAsegurado.PERSONA_NATURAL)
                .numeroDocumento("12345678")
                .nombre("Juan")
                .apellido("Perez")
                .email("juan@test.com")
                .telefono("5551234567")
                .build();

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

        responseDTO = AseguradoResponseDTO.builder()
                .id(1L)
                .tipoAsegurado(TipoAsegurado.PERSONA_NATURAL)
                .numeroDocumento("12345678")
                .nombre("Juan")
                .apellido("Perez")
                .email("juan@test.com")
                .estado(EstadoAsegurado.ACTIVO)
                .build();
    }

    @Test
    @DisplayName("Crear asegurado exitosamente")
    void crearAsegurado_Exitoso() {
        when(aseguradoRepository.existsByNumeroDocumento(anyString())).thenReturn(false);
        when(aseguradoRepository.existsByEmail(anyString())).thenReturn(false);
        when(aseguradoMapper.toEntity(any(AseguradoDTO.class))).thenReturn(asegurado);
        when(aseguradoRepository.save(any(Asegurado.class))).thenReturn(asegurado);
        when(aseguradoMapper.toResponseDTO(any(Asegurado.class))).thenReturn(responseDTO);

        AseguradoResponseDTO result = aseguradoService.crear(aseguradoDTO);

        assertThat(result).isNotNull();
        assertThat(result.getNumeroDocumento()).isEqualTo("12345678");
        assertThat(result.getNombre()).isEqualTo("Juan");
        verify(aseguradoRepository).save(any(Asegurado.class));
    }

    @Test
    @DisplayName("Crear asegurado con documento duplicado lanza excepcion")
    void crearAsegurado_DocumentoDuplicado() {
        when(aseguradoRepository.existsByNumeroDocumento(anyString())).thenReturn(true);

        assertThatThrownBy(() -> aseguradoService.crear(aseguradoDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Ya existe un asegurado con documento");
    }

    @Test
    @DisplayName("Crear asegurado con email duplicado lanza excepcion")
    void crearAsegurado_EmailDuplicado() {
        when(aseguradoRepository.existsByNumeroDocumento(anyString())).thenReturn(false);
        when(aseguradoRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> aseguradoService.crear(aseguradoDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Ya existe un asegurado con email");
    }

    @Test
    @DisplayName("Obtener asegurado por ID exitosamente")
    void obtenerPorId_Exitoso() {
        when(aseguradoRepository.findById(1L)).thenReturn(Optional.of(asegurado));
        when(aseguradoMapper.toResponseDTO(asegurado)).thenReturn(responseDTO);

        AseguradoResponseDTO result = aseguradoService.obtenerPorId(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Obtener asegurado por ID no encontrado")
    void obtenerPorId_NoEncontrado() {
        when(aseguradoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> aseguradoService.obtenerPorId(999L))
                .isInstanceOf(AseguradoNotFoundException.class);
    }

    @Test
    @DisplayName("Listar asegurados con paginacion")
    void listar_ConPaginacion() {
        Page<Asegurado> page = new PageImpl<>(List.of(asegurado), PageRequest.of(0, 20), 1);
        when(aseguradoRepository.findAll(any(PageRequest.class))).thenReturn(page);
        when(aseguradoMapper.toResponseDTO(any(Asegurado.class))).thenReturn(responseDTO);

        Page<AseguradoResponseDTO> result = aseguradoService.listar(PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("Cambiar estado ACTIVO a SUSPENDIDO exitosamente")
    void cambiarEstado_ActivoASuspendido() {
        when(aseguradoRepository.findById(1L)).thenReturn(Optional.of(asegurado));
        asegurado.setEstado(EstadoAsegurado.ACTIVO);
        when(aseguradoRepository.save(any(Asegurado.class))).thenReturn(asegurado);
        when(aseguradoMapper.toResponseDTO(any(Asegurado.class))).thenReturn(responseDTO);

        AseguradoResponseDTO result = aseguradoService.cambiarEstado(1L, EstadoAsegurado.SUSPENDIDO);

        assertThat(result).isNotNull();
        verify(aseguradoRepository).save(any(Asegurado.class));
    }

    @Test
    @DisplayName("Cambiar estado de CANCELADO lanza excepcion")
    void cambiarEstado_DesdeCancelado() {
        asegurado.setEstado(EstadoAsegurado.CANCELADO);
        when(aseguradoRepository.findById(1L)).thenReturn(Optional.of(asegurado));

        assertThatThrownBy(() -> aseguradoService.cambiarEstado(1L, EstadoAsegurado.ACTIVO))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cancelado");
    }

    @Test
    @DisplayName("No se puede cancelar directamente desde ACTIVO")
    void cambiarEstado_ActivoACancelado() {
        asegurado.setEstado(EstadoAsegurado.ACTIVO);
        when(aseguradoRepository.findById(1L)).thenReturn(Optional.of(asegurado));

        assertThatThrownBy(() -> aseguradoService.cambiarEstado(1L, EstadoAsegurado.CANCELADO))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("suspender");
    }

    @Test
    @DisplayName("Eliminar asegurado exitosamente")
    void eliminar_Exitoso() {
        when(aseguradoRepository.findById(1L)).thenReturn(Optional.of(asegurado));

        aseguradoService.eliminar(1L);

        verify(aseguradoRepository).deleteById(1L);
    }
}

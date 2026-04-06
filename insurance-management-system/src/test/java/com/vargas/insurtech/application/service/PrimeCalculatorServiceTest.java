package com.vargas.insurtech.application.service;

import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.enums.NivelRiesgo;
import com.vargas.insurtech.domain.enums.TipoPoliza;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class PrimeCalculatorServiceTest {

    @InjectMocks
    private PrimeCalculatorService primeCalculatorService;

    @Test
    @DisplayName("Calcular prima base para AUTO")
    void calcularPrimaBase_Auto() {
        BigDecimal suma = new BigDecimal("500000.00");
        BigDecimal resultado = primeCalculatorService.calcularPrimaBase(suma, TipoPoliza.AUTO);
        // 500000 * 0.035 = 17500
        assertThat(resultado).isEqualByComparingTo("17500.00");
    }

    @Test
    @DisplayName("Calcular prima base para SALUD")
    void calcularPrimaBase_Salud() {
        BigDecimal suma = new BigDecimal("1000000.00");
        BigDecimal resultado = primeCalculatorService.calcularPrimaBase(suma, TipoPoliza.SALUD);
        // 1000000 * 0.045 = 45000
        assertThat(resultado).isEqualByComparingTo("45000.00");
    }

    @Test
    @DisplayName("Calcular prima total con riesgo BAJO")
    void calcularPrimaTotal_RiesgoBajo() {
        Asegurado asegurado = Asegurado.builder().nivelRiesgo(NivelRiesgo.BAJO).build();
        asegurado.setId(1L);
        BigDecimal primaBase = new BigDecimal("17500.00");
        BigDecimal resultado = primeCalculatorService.calcularPrimaTotal(primaBase, asegurado);
        // 17500 * 1.00 = 17500
        assertThat(resultado).isEqualByComparingTo("17500.00");
    }

    @Test
    @DisplayName("Calcular prima total con riesgo ALTO")
    void calcularPrimaTotal_RiesgoAlto() {
        Asegurado asegurado = Asegurado.builder().nivelRiesgo(NivelRiesgo.ALTO).build();
        asegurado.setId(1L);
        BigDecimal primaBase = new BigDecimal("17500.00");
        BigDecimal resultado = primeCalculatorService.calcularPrimaTotal(primaBase, asegurado);
        // 17500 * 1.75 = 30625
        assertThat(resultado).isEqualByComparingTo("30625.00");
    }

    @Test
    @DisplayName("Calcular prima total con riesgo MEDIO")
    void calcularPrimaTotal_RiesgoMedio() {
        Asegurado asegurado = Asegurado.builder().nivelRiesgo(NivelRiesgo.MEDIO).build();
        asegurado.setId(1L);
        BigDecimal primaBase = new BigDecimal("20000.00");
        BigDecimal resultado = primeCalculatorService.calcularPrimaTotal(primaBase, asegurado);
        // 20000 * 1.35 = 27000
        assertThat(resultado).isEqualByComparingTo("27000.00");
    }
}

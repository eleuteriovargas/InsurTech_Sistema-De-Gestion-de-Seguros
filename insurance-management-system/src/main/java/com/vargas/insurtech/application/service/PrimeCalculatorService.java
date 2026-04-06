package com.vargas.insurtech.application.service;

import com.vargas.insurtech.domain.entity.Asegurado;
import com.vargas.insurtech.domain.enums.NivelRiesgo;
import com.vargas.insurtech.domain.enums.TipoPoliza;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
public class PrimeCalculatorService {

    private static final BigDecimal TASA_BASE_AUTO = new BigDecimal("0.035");
    private static final BigDecimal TASA_BASE_HOGAR = new BigDecimal("0.020");
    private static final BigDecimal TASA_BASE_SALUD = new BigDecimal("0.045");
    private static final BigDecimal TASA_BASE_VIDA = new BigDecimal("0.025");

    private static final BigDecimal FACTOR_RIESGO_BAJO = new BigDecimal("1.00");
    private static final BigDecimal FACTOR_RIESGO_MEDIO = new BigDecimal("1.35");
    private static final BigDecimal FACTOR_RIESGO_ALTO = new BigDecimal("1.75");

    public BigDecimal calcularPrimaBase(BigDecimal sumaAsegurada, TipoPoliza tipoPoliza) {
        BigDecimal tasa = switch (tipoPoliza) {
            case AUTO -> TASA_BASE_AUTO;
            case HOGAR -> TASA_BASE_HOGAR;
            case SALUD -> TASA_BASE_SALUD;
            case VIDA -> TASA_BASE_VIDA;
        };

        BigDecimal primaBase = sumaAsegurada.multiply(tasa).setScale(2, RoundingMode.HALF_UP);
        log.debug("Prima base calculada: {} para tipo {} con suma asegurada {}", primaBase, tipoPoliza, sumaAsegurada);
        return primaBase;
    }

    public BigDecimal calcularPrimaTotal(BigDecimal primaBase, Asegurado asegurado) {
        BigDecimal factorRiesgo = obtenerFactorRiesgo(asegurado.getNivelRiesgo());
        BigDecimal primaTotal = primaBase.multiply(factorRiesgo).setScale(2, RoundingMode.HALF_UP);
        log.debug("Prima total calculada: {} con factor de riesgo {} para asegurado ID: {}",
                primaTotal, factorRiesgo, asegurado.getId());
        return primaTotal;
    }

    private BigDecimal obtenerFactorRiesgo(NivelRiesgo nivelRiesgo) {
        return switch (nivelRiesgo) {
            case BAJO -> FACTOR_RIESGO_BAJO;
            case MEDIO -> FACTOR_RIESGO_MEDIO;
            case ALTO -> FACTOR_RIESGO_ALTO;
        };
    }
}

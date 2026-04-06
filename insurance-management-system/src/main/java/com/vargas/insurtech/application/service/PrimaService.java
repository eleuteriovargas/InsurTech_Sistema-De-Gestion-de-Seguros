package com.vargas.insurtech.application.service;

import com.vargas.insurtech.application.dto.PagoDTO;
import com.vargas.insurtech.application.dto.PrimaResponseDTO;
import com.vargas.insurtech.application.mapper.PrimaMapper;
import com.vargas.insurtech.domain.entity.Pago;
import com.vargas.insurtech.domain.entity.Poliza;
import com.vargas.insurtech.domain.entity.Prima;
import com.vargas.insurtech.domain.enums.EstadoPago;
import com.vargas.insurtech.domain.enums.EstadoPrima;
import com.vargas.insurtech.domain.port.in.PrimaUseCase;
import com.vargas.insurtech.domain.port.out.PagoRepository;
import com.vargas.insurtech.domain.port.out.PolizaRepository;
import com.vargas.insurtech.domain.port.out.PrimaRepository;
import com.vargas.insurtech.exception.BusinessException;
import com.vargas.insurtech.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PrimaService implements PrimaUseCase {

    private static final BigDecimal TASA_MORA_DIARIA = new BigDecimal("0.001");

    private final PrimaRepository primaRepository;
    private final PagoRepository pagoRepository;
    private final PolizaRepository polizaRepository;
    private final PrimaMapper primaMapper;

    @Override
    public List<PrimaResponseDTO> generarCuotas(Long polizaId, int numeroCuotas) {
        log.info("Generando {} cuotas para poliza ID: {}", numeroCuotas, polizaId);

        if (numeroCuotas < 1 || numeroCuotas > 24) {
            throw new BusinessException("El numero de cuotas debe estar entre 1 y 24");
        }

        Poliza poliza = polizaRepository.findById(polizaId)
                .orElseThrow(() -> new ResourceNotFoundException("Poliza", polizaId));

        List<Prima> existentes = primaRepository.findByPolizaIdAndEstado(polizaId, EstadoPrima.PENDIENTE);
        if (!existentes.isEmpty()) {
            throw new BusinessException("Ya existen cuotas pendientes para esta poliza");
        }

        BigDecimal montoCuota = poliza.getPrimaTotal()
                .divide(BigDecimal.valueOf(numeroCuotas), 2, RoundingMode.HALF_UP);

        List<Prima> primas = new ArrayList<>();
        for (int i = 1; i <= numeroCuotas; i++) {
            Prima prima = Prima.builder()
                    .poliza(poliza)
                    .numeroCuota(i)
                    .monto(montoCuota)
                    .fechaVencimiento(poliza.getFechaInicio().plusMonths(i))
                    .estado(EstadoPrima.PENDIENTE)
                    .build();
            primas.add(prima);
        }

        List<Prima> saved = primas.stream()
                .map(primaRepository::save)
                .collect(Collectors.toList());
        log.info("{} cuotas generadas para poliza: {}", saved.size(), poliza.getNumeroPoliza());
        return saved.stream().map(primaMapper::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrimaResponseDTO> listarPorPoliza(Long polizaId, Pageable pageable) {
        return primaRepository.findByPolizaId(polizaId, pageable).map(primaMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrimaResponseDTO> obtenerPendientesPorAsegurado(Long aseguradoId) {
        return primaRepository.findByPolizaAseguradoIdAndEstado(aseguradoId, EstadoPrima.PENDIENTE)
                .stream().map(primaMapper::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public PrimaResponseDTO registrarPago(Long primaId, PagoDTO pagoDTO) {
        log.info("Registrando pago para prima ID: {}", primaId);

        Prima prima = primaRepository.findById(primaId)
                .orElseThrow(() -> new ResourceNotFoundException("Prima", primaId));

        if (prima.getEstado() == EstadoPrima.PAGADO) {
            throw new BusinessException("Esta cuota ya fue pagada");
        }

        BigDecimal totalAdeudado = prima.getMonto().add(prima.getInteresMora());
        if (pagoDTO.getMonto().compareTo(totalAdeudado) < 0) {
            throw new BusinessException("El monto del pago (" + pagoDTO.getMonto() +
                    ") es menor al total adeudado (" + totalAdeudado + ")");
        }

        Pago pago = Pago.builder()
                .prima(prima)
                .monto(pagoDTO.getMonto())
                .fechaPago(LocalDateTime.now())
                .metodoPago(pagoDTO.getMetodoPago())
                .referencia(pagoDTO.getReferencia())
                .estado(EstadoPago.EXITOSO)
                .numeroAutorizacion(pagoDTO.getNumeroAutorizacion())
                .build();
        pagoRepository.save(pago);

        prima.setEstado(EstadoPrima.PAGADO);
        prima.setDiasVencida(0);
        Prima updated = primaRepository.save(prima);

        log.info("Pago registrado exitosamente para prima ID: {}", primaId);
        return primaMapper.toResponseDTO(updated);
    }

    @Override
    @Scheduled(cron = "0 0 2 * * ?")
    public void calcularMoras() {
        log.info("Ejecutando calculo de moras");
        LocalDate hoy = LocalDate.now();

        List<Prima> vencidas = primaRepository.findByEstadoAndFechaVencimientoBefore(EstadoPrima.PENDIENTE, hoy);

        for (Prima prima : vencidas) {
            long diasVencida = ChronoUnit.DAYS.between(prima.getFechaVencimiento(), hoy);
            BigDecimal interesMora = prima.getMonto()
                    .multiply(TASA_MORA_DIARIA)
                    .multiply(BigDecimal.valueOf(diasVencida))
                    .setScale(2, RoundingMode.HALF_UP);

            prima.setDiasVencida((int) diasVencida);
            prima.setInteresMora(interesMora);
            prima.setEstado(diasVencida > 30 ? EstadoPrima.MOROSO : EstadoPrima.VENCIDO);
            primaRepository.save(prima);
        }

        log.info("Moras calculadas para {} primas", vencidas.size());
    }
}

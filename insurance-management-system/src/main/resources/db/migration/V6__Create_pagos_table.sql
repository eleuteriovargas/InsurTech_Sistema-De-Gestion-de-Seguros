-- V6__Create_pagos_table.sql
CREATE TABLE pagos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador unico del pago',
    prima_id BIGINT NOT NULL COMMENT 'FK a la prima/cuota',
    monto DECIMAL(15,2) NOT NULL COMMENT 'Monto pagado',
    fecha_pago DATETIME NOT NULL COMMENT 'Fecha y hora del pago',
    metodo_pago VARCHAR(20) NOT NULL COMMENT 'TARJETA, TRANSFERENCIA, EFECTIVO, AUTOMATICO',
    referencia VARCHAR(100) NULL COMMENT 'Numero de referencia de transaccion',
    estado VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE' COMMENT 'EXITOSO, FALLIDO, PENDIENTE',
    numero_autorizacion VARCHAR(50) NULL COMMENT 'Numero de autorizacion del banco',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NULL,
    last_modified_by VARCHAR(50) NULL,
    version BIGINT DEFAULT 0,
    CONSTRAINT fk_pago_prima FOREIGN KEY (prima_id) REFERENCES primas(id),
    CONSTRAINT chk_metodo_pago CHECK (metodo_pago IN ('TARJETA', 'TRANSFERENCIA', 'EFECTIVO', 'AUTOMATICO')),
    CONSTRAINT chk_estado_pago CHECK (estado IN ('EXITOSO', 'FALLIDO', 'PENDIENTE')),
    CONSTRAINT chk_monto_pago_positivo CHECK (monto > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Transacciones de pago';

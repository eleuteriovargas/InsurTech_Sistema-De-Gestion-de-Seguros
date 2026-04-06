-- V5__Create_primas_table.sql
CREATE TABLE primas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador unico de la prima/cuota',
    poliza_id BIGINT NOT NULL COMMENT 'FK a la poliza',
    numero_cuota INT NOT NULL COMMENT 'Numero de cuota (1, 2, 3...)',
    monto DECIMAL(15,2) NOT NULL COMMENT 'Monto de la cuota',
    fecha_vencimiento DATE NOT NULL COMMENT 'Fecha de vencimiento de la cuota',
    estado VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE, PAGADO, VENCIDO, MOROSO',
    dias_vencida INT DEFAULT 0 COMMENT 'Dias transcurridos desde el vencimiento',
    interes_mora DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Interes por mora calculado',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NULL,
    last_modified_by VARCHAR(50) NULL,
    version BIGINT DEFAULT 0,
    CONSTRAINT fk_prima_poliza FOREIGN KEY (poliza_id) REFERENCES polizas(id),
    CONSTRAINT chk_estado_prima CHECK (estado IN ('PENDIENTE', 'PAGADO', 'VENCIDO', 'MOROSO')),
    CONSTRAINT chk_monto_prima_positivo CHECK (monto > 0),
    CONSTRAINT chk_cuota_positiva CHECK (numero_cuota > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Cuotas/primas a pagar por poliza';

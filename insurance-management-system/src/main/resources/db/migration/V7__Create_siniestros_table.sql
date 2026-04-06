-- V7__Create_siniestros_table.sql
CREATE TABLE siniestros (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador unico del siniestro',
    numero_siniestro VARCHAR(30) NOT NULL COMMENT 'Numero unico de siniestro',
    poliza_id BIGINT NOT NULL COMMENT 'FK a la poliza',
    descripcion TEXT NOT NULL COMMENT 'Descripcion del evento',
    fecha_evento DATE NOT NULL COMMENT 'Fecha en que ocurrio el evento',
    monto_solicitado DECIMAL(15,2) NOT NULL COMMENT 'Monto solicitado por el asegurado',
    monto_aprobado DECIMAL(15,2) NULL COMMENT 'Monto aprobado por el evaluador',
    estado VARCHAR(15) NOT NULL DEFAULT 'REPORTADO' COMMENT 'REPORTADO, EVALUACION, APROBADO, RECHAZADO, PAGADO',
    motivo_rechazo VARCHAR(500) NULL COMMENT 'Motivo en caso de rechazo',
    evaluador_id BIGINT NULL COMMENT 'ID del evaluador asignado',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NULL,
    last_modified_by VARCHAR(50) NULL,
    version BIGINT DEFAULT 0,
    CONSTRAINT uk_numero_siniestro UNIQUE (numero_siniestro),
    CONSTRAINT fk_siniestro_poliza FOREIGN KEY (poliza_id) REFERENCES polizas(id),
    CONSTRAINT chk_estado_siniestro CHECK (estado IN ('REPORTADO', 'EVALUACION', 'APROBADO', 'RECHAZADO', 'PAGADO')),
    CONSTRAINT chk_monto_solicitado_positivo CHECK (monto_solicitado > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Siniestros y reclamos';

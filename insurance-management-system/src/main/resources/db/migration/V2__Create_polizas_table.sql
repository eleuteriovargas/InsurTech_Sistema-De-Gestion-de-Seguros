-- V2__Create_polizas_table.sql
CREATE TABLE polizas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador unico de la poliza',
    numero_poliza VARCHAR(30) NOT NULL COMMENT 'Numero unico de poliza',
    asegurado_id BIGINT NOT NULL COMMENT 'FK al asegurado',
    tipo_poliza VARCHAR(10) NOT NULL COMMENT 'AUTO, HOGAR, SALUD, VIDA',
    suma_asegurada DECIMAL(15,2) NOT NULL COMMENT 'Monto total asegurado',
    prima_base DECIMAL(15,2) NOT NULL COMMENT 'Prima base calculada',
    prima_total DECIMAL(15,2) NOT NULL COMMENT 'Prima total con factor de riesgo',
    fecha_inicio DATE NOT NULL COMMENT 'Inicio de vigencia',
    fecha_fin DATE NOT NULL COMMENT 'Fin de vigencia',
    estado VARCHAR(15) NOT NULL DEFAULT 'VIGENTE' COMMENT 'VIGENTE, VENCIDA, CANCELADA, SUSPENDIDA',
    observaciones TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NULL,
    last_modified_by VARCHAR(50) NULL,
    version BIGINT DEFAULT 0,
    CONSTRAINT uk_numero_poliza UNIQUE (numero_poliza),
    CONSTRAINT fk_poliza_asegurado FOREIGN KEY (asegurado_id) REFERENCES asegurados(id),
    CONSTRAINT chk_tipo_poliza CHECK (tipo_poliza IN ('AUTO', 'HOGAR', 'SALUD', 'VIDA')),
    CONSTRAINT chk_estado_poliza CHECK (estado IN ('VIGENTE', 'VENCIDA', 'CANCELADA', 'SUSPENDIDA')),
    CONSTRAINT chk_fecha_poliza CHECK (fecha_fin > fecha_inicio),
    CONSTRAINT chk_suma_positiva CHECK (suma_asegurada > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabla de polizas de seguro';

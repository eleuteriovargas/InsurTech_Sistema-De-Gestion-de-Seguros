-- V3__Create_coberturas_table.sql
CREATE TABLE coberturas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador unico de la cobertura',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la cobertura',
    descripcion TEXT NULL COMMENT 'Descripcion detallada',
    limite_cobertura DECIMAL(15,2) NOT NULL COMMENT 'Limite maximo de cobertura',
    deducible DECIMAL(15,2) NOT NULL COMMENT 'Monto deducible',
    exclusiones TEXT NULL COMMENT 'Exclusiones de la cobertura',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NULL,
    last_modified_by VARCHAR(50) NULL,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_limite_positivo CHECK (limite_cobertura > 0),
    CONSTRAINT chk_deducible_positivo CHECK (deducible >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Catalogo de coberturas disponibles';

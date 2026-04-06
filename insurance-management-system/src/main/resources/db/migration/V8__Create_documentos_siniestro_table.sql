-- V8__Create_documentos_siniestro_table.sql
CREATE TABLE documentos_siniestro (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador unico del documento',
    siniestro_id BIGINT NOT NULL COMMENT 'FK al siniestro',
    tipo_documento VARCHAR(20) NOT NULL COMMENT 'FACTURA, RECIBO, REPORTE_DANO, FOTO, OTRO',
    nombre_archivo VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo',
    url_archivo VARCHAR(500) NOT NULL COMMENT 'URL de almacenamiento (S3/Cloud)',
    hash_verificacion VARCHAR(64) NULL COMMENT 'Hash SHA-256 para verificar integridad',
    tamano BIGINT NULL COMMENT 'Tamano del archivo en bytes',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NULL,
    last_modified_by VARCHAR(50) NULL,
    version BIGINT DEFAULT 0,
    CONSTRAINT fk_documento_siniestro FOREIGN KEY (siniestro_id) REFERENCES siniestros(id) ON DELETE CASCADE,
    CONSTRAINT chk_tipo_documento CHECK (tipo_documento IN ('FACTURA', 'RECIBO', 'REPORTE_DANO', 'FOTO', 'OTRO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Documentos adjuntos a siniestros';

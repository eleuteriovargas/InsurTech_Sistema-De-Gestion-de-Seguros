-- V4__Create_polizas_coberturas_relationship.sql
CREATE TABLE polizas_coberturas (
    poliza_id BIGINT NOT NULL,
    cobertura_id BIGINT NOT NULL,
    PRIMARY KEY (poliza_id, cobertura_id),
    CONSTRAINT fk_pc_poliza FOREIGN KEY (poliza_id) REFERENCES polizas(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_cobertura FOREIGN KEY (cobertura_id) REFERENCES coberturas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Relacion muchos a muchos entre polizas y coberturas';

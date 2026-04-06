-- V10__Create_indices_and_constraints.sql

-- Indices para asegurados
CREATE INDEX idx_asegurado_estado ON asegurados(estado);
CREATE INDEX idx_asegurado_tipo ON asegurados(tipo_asegurado);
CREATE INDEX idx_asegurado_nombre ON asegurados(nombre);

-- Indices para polizas
CREATE INDEX idx_poliza_asegurado ON polizas(asegurado_id);
CREATE INDEX idx_poliza_estado ON polizas(estado);
CREATE INDEX idx_poliza_tipo ON polizas(tipo_poliza);
CREATE INDEX idx_poliza_fecha_fin ON polizas(fecha_fin);
CREATE INDEX idx_poliza_fecha_inicio ON polizas(fecha_inicio);

-- Indices para primas
CREATE INDEX idx_prima_poliza ON primas(poliza_id);
CREATE INDEX idx_prima_estado ON primas(estado);
CREATE INDEX idx_prima_vencimiento ON primas(fecha_vencimiento);

-- Indices para pagos
CREATE INDEX idx_pago_prima ON pagos(prima_id);
CREATE INDEX idx_pago_estado ON pagos(estado);
CREATE INDEX idx_pago_fecha ON pagos(fecha_pago);

-- Indices para siniestros
CREATE INDEX idx_siniestro_poliza ON siniestros(poliza_id);
CREATE INDEX idx_siniestro_estado ON siniestros(estado);
CREATE INDEX idx_siniestro_evaluador ON siniestros(evaluador_id);
CREATE INDEX idx_siniestro_fecha ON siniestros(fecha_evento);

-- Indices para documentos
CREATE INDEX idx_documento_siniestro ON documentos_siniestro(siniestro_id);

-- Seed: Coberturas iniciales
INSERT INTO coberturas (nombre, descripcion, limite_cobertura, deducible, exclusiones) VALUES
('Robo', 'Cobertura contra robo total o parcial del bien asegurado', 500000.00, 5000.00, 'No aplica para bienes sin factura original'),
('Incendio', 'Cobertura contra danos por incendio', 1000000.00, 10000.00, 'No aplica incendios provocados intencionalmente'),
('Responsabilidad Civil', 'Cobertura por danos a terceros', 750000.00, 7500.00, 'No incluye danos intencionales'),
('Cobertura Medica', 'Gastos medicos por accidente o enfermedad', 2000000.00, 2000.00, 'Enfermedades preexistentes no declaradas'),
('Danos por Fenomenos Naturales', 'Cobertura contra terremotos, inundaciones, huracanes', 800000.00, 15000.00, 'Zonas previamente declaradas en riesgo extremo'),
('Accidentes Personales', 'Indemnizacion por accidentes personales', 500000.00, 0.00, 'Deportes extremos sin cobertura adicional'),
('Asistencia en Viaje', 'Cobertura medica y de equipaje en viajes', 300000.00, 1000.00, 'Viajes a zonas de conflicto'),
('Vida', 'Seguro de vida por fallecimiento o invalidez', 5000000.00, 0.00, 'Suicidio dentro de los primeros 2 anios');

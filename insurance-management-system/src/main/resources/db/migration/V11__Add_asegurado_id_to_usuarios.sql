-- V11__Add_asegurado_id_to_usuarios.sql
ALTER TABLE usuarios ADD COLUMN asegurado_id BIGINT NULL COMMENT 'FK opcional al asegurado vinculado (para ROLE_CUSTOMER)';

ALTER TABLE usuarios ADD CONSTRAINT fk_usuario_asegurado
    FOREIGN KEY (asegurado_id) REFERENCES asegurados(id);

CREATE INDEX idx_usuario_asegurado ON usuarios(asegurado_id);
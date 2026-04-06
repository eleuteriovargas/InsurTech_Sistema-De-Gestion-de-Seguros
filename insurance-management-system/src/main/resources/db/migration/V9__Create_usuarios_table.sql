-- V9__Create_usuarios_table.sql
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador unico del usuario',
    username VARCHAR(50) NOT NULL COMMENT 'Nombre de usuario unico',
    password VARCHAR(255) NOT NULL COMMENT 'Password encriptado con BCrypt',
    email VARCHAR(150) NOT NULL COMMENT 'Email unico',
    nombre_completo VARCHAR(200) NOT NULL COMMENT 'Nombre completo del usuario',
    rol VARCHAR(30) NOT NULL COMMENT 'Rol: ROLE_ADMIN, ROLE_AGENT, ROLE_EVALUATOR, ROLE_CUSTOMER, ROLE_FINANCE',
    activo BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Estado activo/inactivo',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_usuario_username UNIQUE (username),
    CONSTRAINT uk_usuario_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Usuarios del sistema para autenticacion';

-- Password:(BCrypt encoded)
INSERT INTO usuarios (username, password, email, nombre_completo, rol, activo)
VALUES ('admin', '$2a$12$uScFNCQj8FdszydTDFYZ5u8yjKhWEQdPoIOSKdqXjHGaNouBVP8E.', 'admin@insurtech.com', 'Administrador Sistema', 'ROLE_ADMIN', TRUE);

INSERT INTO usuarios (username, password, email, nombre_completo, rol, activo)
VALUES ('agente1', '$2a$12$uScFNCQj8FdszydTDFYZ5u8yjKhWEQdPoIOSKdqXjHGaNouBVP8E.', 'agente@insurtech.com', 'Agente de Seguros', 'ROLE_AGENT', TRUE);

INSERT INTO usuarios (username, password, email, nombre_completo, rol, activo)
VALUES ('evaluador1', '$2a$12$uScFNCQj8FdszydTDFYZ5u8yjKhWEQdPoIOSKdqXjHGaNouBVP8E.', 'evaluador@insurtech.com', 'Evaluador Siniestros', 'ROLE_EVALUATOR', TRUE);

INSERT INTO usuarios (username, password, email, nombre_completo, rol, activo)
VALUES ('finanzas1', '$2a$12$uScFNCQj8FdszydTDFYZ5u8yjKhWEQdPoIOSKdqXjHGaNouBVP8E.', 'finanzas@insurtech.com', 'Analista Financiero', 'ROLE_FINANCE', TRUE);

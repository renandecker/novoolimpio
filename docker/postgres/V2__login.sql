-- Tabela para autenticacao do microsservico de login
CREATE TABLE IF NOT EXISTS bas_login (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120) NOT NULL,
    password_hash VARCHAR(512) NOT NULL,
    permissions VARCHAR(500) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    usuario_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_bas_login_username UNIQUE (username)
);

CREATE INDEX IF NOT EXISTS idx_bas_login_usuario_id ON bas_login (usuario_id);
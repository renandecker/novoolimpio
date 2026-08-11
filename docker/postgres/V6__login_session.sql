-- Sessoes de login para suportar o deslogamento (logout). Cada JWT emitido ganha
-- um jti (UUID) que e gravado aqui; encerrar a sessao revoga o token antes da expiracao.
CREATE TABLE IF NOT EXISTS bas_login_session (
    id UUID PRIMARY KEY,
    username VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_bas_login_session_username ON bas_login_session (username);
CREATE INDEX IF NOT EXISTS idx_bas_login_session_expires_at ON bas_login_session (expires_at);

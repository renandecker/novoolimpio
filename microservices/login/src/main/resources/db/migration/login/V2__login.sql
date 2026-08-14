-- Tabela para autenticacao do microsservico de login
CREATE TABLE IF NOT EXISTS bas_login (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120) NOT NULL,
    password_hash VARCHAR(512) NOT NULL,
    permissions VARCHAR(500) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    id_usuario BIGINT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_bas_login_username UNIQUE (username)
);

CREATE INDEX IF NOT EXISTS idx_bas_login_usuario_id ON bas_login (id_usuario);


DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bas_login_id_usuario') THEN
        ALTER TABLE bas_login
            ADD CONSTRAINT fk_bas_login_id_usuario FOREIGN KEY (id_usuario) REFERENCES bas_usuario(id);
    END IF;
END
$DO$;
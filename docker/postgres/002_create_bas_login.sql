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

CREATE INDEX IF NOT EXISTS idx_bas_login_active ON bas_login(active);


ALTER TABLE bas_login
    ADD CONSTRAINT fk_bas_login_id_usuario FOREIGN KEY (id_usuario) REFERENCES bas_usuario(id);

INSERT INTO bas_login (username, password_hash, permissions, active, id_usuario, created_at, updated_at)
SELECT 'admin',
       'pbkdf2$210000$FH_ClhgOYJwBOat1GSwabw$6xdztO0zi_QkQaowQgaQehEkXM_g5zLPdMilJHeABaA',
       'READ,CREATE,UPDATE,DELETE,EXECUTE',
       TRUE,
       (SELECT id FROM bas_usuario WHERE lower(login) = 'admin' LIMIT 1),
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM bas_login WHERE lower(username) = 'admin');


CREATE TABLE IF NOT EXISTS bas_temas (
    id serial PRIMARY KEY,
    tema text NOT NULL,
    titulo text,
    id_layout integer REFERENCES bas_layout(id),
    folder_css text,
    cor_primaria text,
    cor_secundaria text,
    cor_barra text,
    cor_fundo text,
    cor_texto text,
    cor_borda text,
    cor_destaque text,
    cor_email text,
    fl_default boolean DEFAULT false,
    ativo boolean DEFAULT true,
    UNIQUE (tema)
);

-- Notificacoes - tabelas basicas do microsservico notificacoes.
-- Aplicado apos o restore do olimpio.sql (ver restore no docker-compose.yml).

CREATE TABLE IF NOT EXISTS not_notificacao (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    tipo VARCHAR(50),
    link VARCHAR(500),
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    canal_sistema BOOLEAN NOT NULL DEFAULT TRUE,
    canal_mobile BOOLEAN NOT NULL DEFAULT FALSE,
    canal_email BOOLEAN NOT NULL DEFAULT FALSE,
    email_enviado BOOLEAN NOT NULL DEFAULT FALSE,
    mobile_enviado BOOLEAN NOT NULL DEFAULT FALSE,
    data_leitura TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_not_notificacao_username ON not_notificacao(username);
CREATE INDEX IF NOT EXISTS idx_not_notificacao_nao_lida ON not_notificacao(username, lida);

-- Configuracao de canais de notificacao: define se alem do sistema,
-- a notificacao tambem sera entregue no mobile e por e-mail.
CREATE TABLE IF NOT EXISTS not_config_canal (
    id BIGSERIAL PRIMARY KEY,
    canal VARCHAR(30) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    destinatario VARCHAR(255),
    descricao VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO not_config_canal (canal, ativo, destinatario, descricao) VALUES
    ('SISTEMA', TRUE,  NULL,     'Notificacao exibida dentro do sistema (web)'),
    ('MOBILE',  TRUE,  NULL,     'Notificacao exibida no aplicativo mobile'),
    ('EMAIL',   TRUE,  NULL,     'Notificacao enviada por e-mail (SMTP via bas_email)')
ON CONFLICT (canal) DO NOTHING;

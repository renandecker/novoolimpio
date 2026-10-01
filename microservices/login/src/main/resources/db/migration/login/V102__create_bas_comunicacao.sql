-- Comunicacao - tabela para cadastro de comunicacoes com destinatarios e canais de notificacao
-- Nova versao apos remocao da tabela antiga (V35)
-- Idempotente: adiciona colunas faltantes se a tabela ja existir (vinda do restore)

-- 1) Garante que a tabela existe (caso o restore nao a tenha criado)
CREATE TABLE IF NOT EXISTS bas_comunicacao (
    id BIGSERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES bas_usuario(id),
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    tipo VARCHAR(50),
    categoria VARCHAR(50),
    link VARCHAR(500),
    data_envio TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO',
    canal_sistema BOOLEAN NOT NULL DEFAULT TRUE,
    canal_mobile BOOLEAN NOT NULL DEFAULT FALSE,
    canal_email BOOLEAN NOT NULL DEFAULT FALSE,
    canal_telegram BOOLEAN NOT NULL DEFAULT FALSE,
    canal_sms BOOLEAN NOT NULL DEFAULT FALSE,
    canal_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    canal_notificacao BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2) Adiciona colunas faltantes na tabela existente (vinda do restore)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'categoria') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN categoria VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'link') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN link VARCHAR(500);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'data_envio') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN data_envio TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'status') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'RASCUNHO';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'canal_sistema') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN canal_sistema BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'canal_mobile') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN canal_mobile BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'canal_email') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN canal_email BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'canal_telegram') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN canal_telegram BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'canal_sms') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN canal_sms BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'canal_whatsapp') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN canal_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'canal_notificacao') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN canal_notificacao BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'created_at') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'updated_at') THEN
        ALTER TABLE bas_comunicacao ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 3) Tabelas de relacionamento para destinatarios
CREATE TABLE IF NOT EXISTS bas_comunicacao_unidade (
    id_unidade INTEGER NOT NULL REFERENCES bas_unidade(id),
    id_comunicacao BIGINT NOT NULL REFERENCES bas_comunicacao(id) ON DELETE CASCADE,
    PRIMARY KEY (id_unidade, id_comunicacao)
);

CREATE TABLE IF NOT EXISTS bas_comunicacao_curriculo (
    id_curriculo INTEGER NOT NULL REFERENCES edc_curriculo(id),
    id_comunicacao BIGINT NOT NULL REFERENCES bas_comunicacao(id) ON DELETE CASCADE,
    PRIMARY KEY (id_curriculo, id_comunicacao)
);

CREATE TABLE IF NOT EXISTS bas_comunicacao_oferecimento (
    id_oferecimento INTEGER NOT NULL REFERENCES edc_oferecimento_componente_curricular(id),
    id_comunicacao BIGINT NOT NULL REFERENCES bas_comunicacao(id) ON DELETE CASCADE,
    PRIMARY KEY (id_oferecimento, id_comunicacao)
);

CREATE TABLE IF NOT EXISTS bas_comunicacao_pessoa (
    id_pessoa INTEGER NOT NULL REFERENCES bas_pessoa(id),
    id_comunicacao BIGINT NOT NULL REFERENCES bas_comunicacao(id) ON DELETE CASCADE,
    PRIMARY KEY (id_pessoa, id_comunicacao)
);

CREATE TABLE IF NOT EXISTS bas_comunicacao_usuario (
    id_usuario INTEGER NOT NULL REFERENCES bas_usuario(id),
    id_comunicacao BIGINT NOT NULL REFERENCES bas_comunicacao(id) ON DELETE CASCADE,
    PRIMARY KEY (id_usuario, id_comunicacao)
);

-- 4) Indices (criados apenas se as colunas existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'id_usuario') THEN
        CREATE INDEX IF NOT EXISTS idx_bas_comunicacao_id_usuario ON bas_comunicacao(id_usuario);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_bas_comunicacao_status ON bas_comunicacao(status);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'data_envio') THEN
        CREATE INDEX IF NOT EXISTS idx_bas_comunicacao_data_envio ON bas_comunicacao(data_envio);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'tipo') THEN
        CREATE INDEX IF NOT EXISTS idx_bas_comunicacao_tipo ON bas_comunicacao(tipo);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'categoria') THEN
        CREATE INDEX IF NOT EXISTS idx_bas_comunicacao_categoria ON bas_comunicacao(categoria);
    END IF;
END $$;

-- 5) Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bas_comunicacao_updated_at ON bas_comunicacao;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bas_comunicacao' AND column_name = 'updated_at') THEN
        CREATE TRIGGER update_bas_comunicacao_updated_at
            BEFORE UPDATE ON bas_comunicacao
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
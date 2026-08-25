-- Notificacoas - tabela de regras de notificacao
-- Define as regras de quando e para quem as notificacoes serao enviadas
-- baseadas em tipos: parcelas, dias a vences, vencido, etc.

CREATE TABLE IF NOT EXISTS not_notificacao_regra (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    tipo_regra VARCHAR(50) NOT NULL,
    canal VARCHAR(30) NOT NULL,
    destinatario VARCHAR(50) NOT NULL,
    valor_limite DOUBLE PRECISION,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_not_notificacao_regra_tipo_canal ON not_notificacao_regra(tipo_regra, canal);
CREATE INDEX IF NOT EXISTS idx_not_notificacao_regra_ativo ON not_notificacao_regra(ativo);

-- Regras padrao para notificacao de parcelas
INSERT INTO not_notificacao_regra (nome, descricao, tipo_regra, canal, destinatario, valor_limite, ativo) VALUES
    ('Parcelas Vencidas', 'Notificar quando parcelas ja estao vencidas', 'vencido', 'EMAIL', 'DONO_PARCELA', 0.0, TRUE),
    ('Parcelas Proximas do Vencimento', 'Notificar quando parcelas estao proximas do vencimento', 'dias_a_vencer', 'EMAIL', 'DONO_PARCELA', 3.0, TRUE),
    ('Parcelas Vencidas - App', 'Notificar quando parcelas ja estao vencidas via app', 'vencido', 'MOBILE', 'DONO_PARCELA', 0.0, TRUE),
    ('Responsavel Unidade - Vencido', 'Notificar responsavel da unidade quando parcelas estao vencidas', 'vencido', 'EMAIL', 'RESPONSABLE_UNIDADE', 0.0, TRUE),

    ('Dias para Vencer', 'Notificar dias antes do vencimento', 'dias_a_vencer', 'EMAIL', 'DONO_PARCELA', 7.0, TRUE),

    ('Parcela Venceu', 'Notificacao quando parcela venceu', 'vencido', 'SISTEMA', 'DONO_PARCELA', 0.0, TRUE);
ON CONFLICT (nome) DO NOTHING;
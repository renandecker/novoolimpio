-- V13__indicador_gauge.sql
-- Cria a tabela de indicadores gauge (velocímetro)

CREATE TABLE IF NOT EXISTS rel_indicador_gauge (
    id                BIGSERIAL PRIMARY KEY,
    nome              VARCHAR(255) NOT NULL,
    sql_query         TEXT,
    configuracao      JSONB,
    data_criacao      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao  TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_nome ON rel_indicador_gauge(nome);
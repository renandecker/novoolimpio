-- V11__organograma.sql
-- Cria a tabela de organograma para relatórios

CREATE TABLE IF NOT EXISTS rel_organograma (
    id                BIGSERIAL PRIMARY KEY,
    nome              VARCHAR(255),
    direcao           VARCHAR(30) NOT NULL DEFAULT 'VERTICAL',
    sql_consulta      TEXT,
    data_criacao      TIMESTAMP,
    data_atualizacao  TIMESTAMP
);

-- Restringe os valores aceitos para a direção (mesmos 3 valores do formulário/tela de visualização).
ALTER TABLE rel_organograma DROP CONSTRAINT IF EXISTS chk_rel_organograma_direcao;
ALTER TABLE rel_organograma
    ADD CONSTRAINT chk_rel_organograma_direcao
    CHECK (direcao IN ('HORIZONTAL', 'VERTICAL', 'TOGGLE_REVERSE'));
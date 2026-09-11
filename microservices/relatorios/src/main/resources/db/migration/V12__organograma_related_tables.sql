-- V12__organograma_related_tables.sql
-- Cria as tabelas relacionadas ao organograma

-- Tabela de tópicos do organograma
CREATE TABLE IF NOT EXISTS rel_organograma_topico (
    id                BIGSERIAL PRIMARY KEY,
    id_organograma    BIGINT NOT NULL REFERENCES rel_organograma(id),
    id_organograma_topico BIGINT REFERENCES rel_organograma_topico(id),
    nome              VARCHAR(255) NOT NULL,
    descricao         TEXT,
    ordem             INT DEFAULT 0,
    data_criacao      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao  TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rel_organograma_topico_organograma ON rel_organograma_topico(id_organograma);

-- Tabela de usuários do organograma
CREATE TABLE IF NOT EXISTS rel_organograma_usuario (
    id_organograma    BIGINT NOT NULL REFERENCES rel_organograma(id),
    id_usuario        BIGINT NOT NULL,
    PRIMARY KEY (id_organograma, id_usuario)
);

-- Tabela de perfis do organograma
CREATE TABLE IF NOT EXISTS rel_organograma_perfil (
    id_organograma    BIGINT NOT NULL REFERENCES rel_organograma(id),
    id_perfil         BIGINT NOT NULL,
    PRIMARY KEY (id_organograma, id_perfil)
);

-- Tabela de unidades do organograma
CREATE TABLE IF NOT EXISTS rel_organograma_unidade (
    id_organograma    BIGINT NOT NULL REFERENCES rel_organograma(id),
    id_unidade        BIGINT NOT NULL,
    PRIMARY KEY (id_organograma, id_unidade)
);
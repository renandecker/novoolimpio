-- Migration script for document templates
CREATE TABLE IF NOT EXISTS rel_document_template (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(1000),
    arquivo_nome VARCHAR(255) NOT NULL,
    arquivo_dados BYTEA NOT NULL,
    tipo_relatorio VARCHAR(50),
    relatorio_id BIGINT,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_alteracao TIMESTAMP,
    usuario_id BIGINT
);

CREATE INDEX IF NOT EXISTS idx_rel_document_template_tipo_relatorio ON rel_document_template(tipo_relatorio);
CREATE INDEX IF NOT EXISTS idx_rel_document_template_relatorio_id ON rel_document_template(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_rel_document_template_ativo ON rel_document_template(fl_ativo);



-- 1) Garante a existência da tabela base (caso o script rode em uma base nova).
CREATE TABLE IF NOT EXISTS rel_organograma (
    id                BIGSERIAL PRIMARY KEY,
    nome              VARCHAR(255),
    direcao           VARCHAR(30) NOT NULL DEFAULT 'VERTICAL',
    sql_consulta      TEXT,
    data_criacao      TIMESTAMP,
    data_atualizacao  TIMESTAMP
);

-- 2) Ambiente já existente (tabela criada antes desta versão): adiciona as colunas novas.
ALTER TABLE rel_organograma
    ADD COLUMN IF NOT EXISTS direcao VARCHAR(30) NOT NULL DEFAULT 'VERTICAL';

ALTER TABLE rel_organograma
    ADD COLUMN IF NOT EXISTS sql_consulta TEXT;

-- 3) Garante que registros antigos (criados antes deste script) fiquem com uma direção válida.
UPDATE rel_organograma SET direcao = 'VERTICAL' WHERE direcao IS NULL OR btrim(direcao) = '';

-- 4) Restringe os valores aceitos para a direção (mesmos 3 valores do formulário/tela de visualização).
ALTER TABLE rel_organograma DROP CONSTRAINT IF EXISTS chk_rel_organograma_direcao;
ALTER TABLE rel_organograma
    ADD CONSTRAINT chk_rel_organograma_direcao
    CHECK (direcao IN ('HORIZONTAL', 'VERTICAL', 'TOGGLE_REVERSE'));

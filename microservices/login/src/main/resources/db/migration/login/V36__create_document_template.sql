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
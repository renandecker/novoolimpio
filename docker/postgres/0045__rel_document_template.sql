-- Relatorios - tabela de templates de documento + template padrao.
-- Substitui o DocumentTemplateSeeder (seed reativo em startup causava
-- "No current Vertx context found" e a tabela nunca era criada porque
-- quarkus.hibernate-orm.database.generation=none).

CREATE SEQUENCE IF NOT EXISTS rel_document_template_seq;

CREATE TABLE IF NOT EXISTS rel_document_template (
    id BIGINT PRIMARY KEY DEFAULT nextval('rel_document_template_seq'),
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

ALTER SEQUENCE rel_document_template_seq OWNED BY rel_document_template.id;

INSERT INTO rel_document_template (nome, descricao, arquivo_nome, arquivo_dados, tipo_relatorio, fl_ativo)
SELECT 'Relatório Básico',
       'Template básico para relatórios de tabela',
       'relatorio-basico.docx',
       decode('PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8dzpkb2N1bWVudCB4bWxuczp3PSJodHRwOi8vc2NoZW1hcy5vcGVueG1sZm9ybWF0cy5vcmcvd29yZHByb2Nlc3NpbmdtbC8yMDA2L21haW4iPgogICAgPHc6Ym9keT4KICAgICAgICA8dzpwPgogICAgICAgICAgICA8dzpyPgogICAgICAgICAgICAgICAgPHc6dD5SRUxBVE9SSU86IHt7VElUVUxPfX08L3c6dD4KICAgICAgICAgICAgPC93OnI+CiAgICAgICAgPC93OnA+CiAgICAgICAgPHc6cD4KICAgICAgICAgICAgPHc6cj4KICAgICAgICAgICAgICAgIDx3OnQ+RGF0YToge3tEQVRBX0FUVUFMfX08L3c6dD4KICAgICAgICAgICAgPC93OnI+CiAgICAgICAgPC93OnA+CiAgICAgICAgPHc6cD4KICAgICAgICAgICAgPHc6cj4KICAgICAgICAgICAgICAgIDx3OnQ+VG90YWwgZGUgUmVnaXN0cm9zOiB7e1RPVEFMX1JFR0lTVFJPU319PC93OnQ+CiAgICAgICAgICAgIDwvdzpyPgogICAgICAgIDwvdzpwPgogICAgICAgIDx3OnRibD4KICAgICAgICAgICAgPHc6dHI+CiAgICAgICAgICAgICAgICA8dzp0Yz4KICAgICAgICAgICAgICAgICAgICA8dzpwPgogICAgICAgICAgICAgICAgICAgICAgICA8dzpyPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHc6dD5Db2x1bmE8L3c6dD4KICAgICAgICAgICAgICAgICAgICAgICAgPC93OnI+CiAgICAgICAgICAgICAgICAgICAgPC93OnA+CiAgICAgICAgICAgICAgICA8L3c6dGM+CiAgICAgICAgICAgICAgICA8dzp0Yz4KICAgICAgICAgICAgICAgICAgICA8dzpwPgogICAgICAgICAgICAgICAgICAgICAgICA8dzpyPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHc6dD5WYWxvcjwvdzp0PgogICAgICAgICAgICAgICAgICAgICAgICA8L3c6cj4KICAgICAgICAgICAgICAgICAgICA8L3c6cD4KICAgICAgICAgICAgICAgIDwvdzp0Yz4KICAgICAgICAgICAgPC93OnRyPgogICAgICAgICAgICA8dzp0cj4KICAgICAgICAgICAgICAgIDx3OnRjPgogICAgICAgICAgICAgICAgICAgIDx3OnA+CiAgICAgICAgICAgICAgICAgICAgICAgIDx3OnI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dzp0Pnt7Q09MVU5BXzF9fTwvdzp0PgogICAgICAgICAgICAgICAgICAgICAgICA8L3c6cj4KICAgICAgICAgICAgICAgICAgICA8L3c6cD4KICAgICAgICAgICAgICAgIDwvdzp0Yz4KICAgICAgICAgICAgICAgIDx3OnRjPgogICAgICAgICAgICAgICAgICAgIDx3OnA+CiAgICAgICAgICAgICAgICAgICAgICAgIDx3OnI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dzp0Pnt7TElOSEFfQ09MVU5BXzF9fTwvdzp0PgogICAgICAgICAgICAgICAgICAgICAgICA8L3c6cj4KICAgICAgICAgICAgICAgICAgICA8L3c6cD4KICAgICAgICAgICAgICAgIDwvdzp0Yz4KICAgICAgICAgICAgPC93OnRyPgogICAgICAgICAgICA8dzp0cj4KICAgICAgICAgICAgICAgIDx3OnRjPgogICAgICAgICAgICAgICAgICAgIDx3OnA+CiAgICAgICAgICAgICAgICAgICAgICAgIDx3OnI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dzp0Pnt7Q09MVU5BXzJ9fTwvdzp0PgogICAgICAgICAgICAgICAgICAgICAgICA8L3c6cj4KICAgICAgICAgICAgICAgICAgICA8L3c6cD4KICAgICAgICAgICAgICAgIDwvdzp0Yz4KICAgICAgICAgICAgICAgIDx3OnRjPgogICAgICAgICAgICAgICAgICAgIDx3OnA+CiAgICAgICAgICAgICAgICAgICAgICAgIDx3OnI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dzp0Pnt7TElOSEFfQ09MVU5BXzJ9fTwvdzp0PgogICAgICAgICAgICAgICAgICAgICAgICA8L3c6cj4KICAgICAgICAgICAgICAgICAgICA8L3c6cD4KICAgICAgICAgICAgICAgIDwvdzp0Yz4KICAgICAgICAgICAgPC93OnRyPgogICAgICAgIDwvdzp0Ymw+CiAgICA8L3c6Ym9keT4KPC93OmRvY3VtZW50Pg==', 'base64'),
       'TABELA',
       TRUE
WHERE NOT EXISTS (SELECT 1 FROM rel_document_template WHERE nome = 'Relatório Básico');




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


-- V94__create_biblioteca_virtual_provedor.sql
-- Criação da tabela de provedores digitais

CREATE TABLE bib_provedor_digital (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL UNIQUE,
    descricao TEXT,
    url_api VARCHAR(500),
    suporta_lti BOOLEAN NOT NULL DEFAULT FALSE,
    suporta_sso BOOLEAN NOT NULL DEFAULT FALSE,
    publico_alvo VARCHAR(100),
    area_conhecimento TEXT,
    logo_url VARCHAR(500),
    documentacao_url VARCHAR(500),
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_provedor_nome ON bib_provedor_digital (nome);

-- Inserir provedores padrão
INSERT INTO bib_provedor_digital (nome, descricao, url_api, suporta_lti, suporta_sso, publico_alvo, area_conhecimento, data_cadastro, fl_ativo) VALUES
('Minha Biblioteca', 'Consórcio entre grandes editoras acadêmicas do Brasil (Grupo GEN, Atlas, Manole, Saraiva, etc.). Oferece integração via API e LTI para plataformas educacionais (LMS) e sistemas de gestão acadêmica (ERP).', 'https://api.minhabiblioteca.com.br', TRUE, FALSE, 'Ensino Superior', 'Todas as áreas do conhecimento acadêmico', CURRENT_DATE, TRUE),
('Biblioteca Virtual Pearson', 'Focada no ensino superior e corporativo, possui catálogo amplo de diversas áreas do conhecimento. Suporta integração via API e SSO (Single Sign-On).', 'https://api.pearson.com', TRUE, TRUE, 'Ensino Superior e Corporativo', 'Diversas áreas do conhecimento', CURRENT_DATE, TRUE),
('Árvore (Livros / Educação)', 'Voltada principalmente para o ecossistema escolar (K-12) e corporativo, permitindo integração de catálogo e leitura diretamente em plataformas parceiras via API.', 'https://api.arvore.com.br', TRUE, FALSE, 'Escolar (K-12) e Corporativo', 'Educação básica, ensino médio e corporativo', CURRENT_DATE, TRUE);



-- V94__add_provedor_to_livro_digital.sql
-- Adicionar coluna provedor_id na tabela bib_livro_digital
--
-- O V91 ja cria bib_livro_digital com a coluna provedor_id e o indice
-- idx_bib_livro_digital_provedor. Este script e o ponto de idempotencia:
-- em dumps que ja trazem a coluna, o ADD COLUMN simples falhava e abortava a
-- cadeia toda. IF NOT EXISTS torna a migration segura nos dois cenarios.

ALTER TABLE IF EXISTS public.bib_livro_digital
    ADD COLUMN IF NOT EXISTS provedor_id BIGINT REFERENCES public.bib_provedor_digital(id);

CREATE INDEX IF NOT EXISTS idx_bib_livro_digital_provedor
    ON public.bib_livro_digital (provedor_id);

-- V91__create_biblioteca_virtual_tables.sql
-- Criação das tabelas do módulo Biblioteca Virtual (Acervo Digital)

-- Tabela de Livros Digitais
CREATE TABLE bib_livro_digital (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(500) NOT NULL,
    subtitulo VARCHAR(500),
    autores TEXT,
    editora VARCHAR(200),
    isbn VARCHAR(13) UNIQUE,
    edicao VARCHAR(50),
    ano_publicacao INTEGER,
    categoria VARCHAR(100),
    genero VARCHAR(100),
    idioma VARCHAR(50),
    sinopse TEXT,
    capa_url VARCHAR(500),
    classificacao_decimal VARCHAR(50),
    tamanho_arquivo_mb DOUBLE PRECISION,
    url_recurso VARCHAR(500),
    drm_tipo VARCHAR(50),
    preview_url VARCHAR(500),
    provedor_id BIGINT,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_livro_digital_titulo ON bib_livro_digital (lower(titulo));
CREATE INDEX idx_bib_livro_digital_isbn ON bib_livro_digital (isbn);
CREATE INDEX idx_bib_livro_digital_autores ON bib_livro_digital (lower(autores));
CREATE INDEX idx_bib_livro_digital_categoria ON bib_livro_digital (categoria);
CREATE INDEX idx_bib_livro_digital_provedor ON bib_livro_digital (provedor_id);

-- Tabela de Formatos dos Livros Digitais
CREATE TABLE bib_livro_digital_formatos (
    livro_digital_id BIGINT NOT NULL REFERENCES bib_livro_digital(id) ON DELETE CASCADE,
    formato VARCHAR(20) NOT NULL,
    PRIMARY KEY (livro_digital_id, formato)
);

-- Tabela de Licenças de Acervo
CREATE TABLE bib_licenca_acervo (
    id BIGSERIAL PRIMARY KEY,
    livro_digital_id BIGINT NOT NULL UNIQUE REFERENCES bib_livro_digital(id),
    modelo_licenca VARCHAR(30) NOT NULL,
    total_licencas_contratadas INTEGER NOT NULL DEFAULT 1,
    licencas_em_uso INTEGER NOT NULL DEFAULT 0,
    data_inicio_vigencia DATE,
    data_fim_vigencia DATE,
    max_acessos_contados INTEGER,
    acessos_realizados INTEGER NOT NULL DEFAULT 0,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_licenca_livro ON bib_licenca_acervo (livro_digital_id);

-- Tabela de Empréstimos Digitais
CREATE TABLE bib_emprestimo_digital (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    livro_digital_id BIGINT NOT NULL REFERENCES bib_livro_digital(id),
    data_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP NOT NULL,
    tipo_acesso VARCHAR(30) NOT NULL,
    token_drm VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    progresso_leitura INTEGER NOT NULL DEFAULT 0,
    ultima_pagina_lida INTEGER,
    data_devolucao_antecipada TIMESTAMP,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_emprestimo_digital_usuario ON bib_emprestimo_digital (usuario_id);
CREATE INDEX idx_bib_emprestimo_digital_livro ON bib_emprestimo_digital (livro_digital_id);
CREATE INDEX idx_bib_emprestimo_digital_status ON bib_emprestimo_digital (status);
CREATE INDEX idx_bib_emprestimo_digital_expiracao ON bib_emprestimo_digital (data_expiracao);

-- Tabela de Fila de Espera Digital
CREATE TABLE bib_fila_espera_digital (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    livro_digital_id BIGINT NOT NULL REFERENCES bib_livro_digital(id),
    posicao_fila INTEGER NOT NULL DEFAULT 0,
    data_solicitacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_notificacao TIMESTAMP,
    data_limite_resgate TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO',
    data_resgate TIMESTAMP,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_fila_usuario ON bib_fila_espera_digital (usuario_id);
CREATE INDEX idx_bib_fila_livro ON bib_fila_espera_digital (livro_digital_id);
CREATE INDEX idx_bib_fila_status ON bib_fila_espera_digital (status);
CREATE INDEX idx_bib_fila_posicao ON bib_fila_espera_digital (livro_digital_id, posicao_fila);
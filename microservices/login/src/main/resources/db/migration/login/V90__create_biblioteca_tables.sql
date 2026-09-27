-- V90__create_biblioteca_tables.sql
-- Criação das tabelas do módulo Biblioteca (Acervo Físico)

-- Tabela de Obras/Títulos
CREATE TABLE bib_obra (
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
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_obra_titulo ON bib_obra (lower(titulo));
CREATE INDEX idx_bib_obra_isbn ON bib_obra (isbn);
CREATE INDEX idx_bib_obra_autores ON bib_obra (lower(autores));
CREATE INDEX idx_bib_obra_categoria ON bib_obra (categoria);

-- Tabela de Exemplares Físicos
CREATE TABLE bib_exemplar (
    id BIGSERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    tombo VARCHAR(50) UNIQUE,
    obra_id BIGINT NOT NULL REFERENCES bib_obra(id),
    status VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL',
    localizacao VARCHAR(200),
    estante VARCHAR(100),
    corredor VARCHAR(100),
    prateleira VARCHAR(100),
    condicao_fisica VARCHAR(20) DEFAULT 'BOM',
    quantidade INTEGER NOT NULL DEFAULT 1,
    data_aquisicao DATE,
    observacoes TEXT,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_exemplar_obra ON bib_exemplar (obra_id);
CREATE INDEX idx_bib_exemplar_status ON bib_exemplar (status);
CREATE INDEX idx_bib_exemplar_codigo_barras ON bib_exemplar (codigo_barras);
CREATE INDEX idx_bib_exemplar_tombo ON bib_exemplar (tombo);

-- Tabela de Reservas
CREATE TABLE bib_reserva (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    obra_id BIGINT NOT NULL REFERENCES bib_obra(id),
    data_solicitacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    posicao_fila INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_FILA',
    data_disponibilizacao TIMESTAMP,
    data_limite_retirada TIMESTAMP,
    data_cancelamento TIMESTAMP,
    motivo_cancelamento TEXT,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_reserva_usuario ON bib_reserva (usuario_id);
CREATE INDEX idx_bib_reserva_obra ON bib_reserva (obra_id);
CREATE INDEX idx_bib_reserva_status ON bib_reserva (status);
CREATE INDEX idx_bib_reserva_posicao ON bib_reserva (obra_id, posicao_fila);

-- Tabela de Empréstimos
CREATE TABLE bib_emprestimo (
    id BIGSERIAL PRIMARY KEY,
    exemplar_id BIGINT NOT NULL REFERENCES bib_exemplar(id),
    usuario_id BIGINT NOT NULL,
    data_retirada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_prevista_devolucao DATE NOT NULL,
    data_efetiva_devolucao TIMESTAMP,
    quantidade_renovacoes INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ATIVO',
    observacoes TEXT,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_emprestimo_exemplar ON bib_emprestimo (exemplar_id);
CREATE INDEX idx_bib_emprestimo_usuario ON bib_emprestimo (usuario_id);
CREATE INDEX idx_bib_emprestimo_status ON bib_emprestimo (status);
CREATE INDEX idx_bib_emprestimo_data_prevista ON bib_emprestimo (data_prevista_devolucao);

-- Tabela de Multas
CREATE TABLE bib_multa (
    id BIGSERIAL PRIMARY KEY,
    emprestimo_id BIGINT NOT NULL REFERENCES bib_emprestimo(id),
    usuario_id BIGINT NOT NULL,
    dias_atraso INTEGER NOT NULL,
    valor_por_dia NUMERIC(10,2) NOT NULL,
    valor_total NUMERIC(10,2) NOT NULL,
    motivo VARCHAR(30) NOT NULL,
    status_pagamento VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    data_pagamento TIMESTAMP,
    forma_pagamento VARCHAR(20),
    observacoes TEXT,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    fl_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bib_multa_emprestimo ON bib_multa (emprestimo_id);
CREATE INDEX idx_bib_multa_usuario ON bib_multa (usuario_id);
CREATE INDEX idx_bib_multa_status ON bib_multa (status_pagamento);
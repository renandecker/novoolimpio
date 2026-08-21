-- Microsservico aula (agora mantido pelos microsservicos aluno e professor) -
-- tabelas portadas do legado (Flyway V1_4_584__aulas.sql).
-- Aplicado apos o restore do olimpio.sql (ver restore no docker-compose.yml).

CREATE TABLE IF NOT EXISTS edc_aula (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT,
    descricao TEXT,
    id_ocorrencia_componente_curricular INT REFERENCES edc_ocorrencia_componente_curricular(id)
);

CREATE TABLE IF NOT EXISTS edc_avaliacao_pergunta_anexo (
    id BIGSERIAL PRIMARY KEY,
    id_avaliacao_pergunta BIGINT REFERENCES edc_avaliacao_pergunta(id),
    nome TEXT,
    anexo TEXT
);

CREATE TABLE IF NOT EXISTS edc_aula_anexo (
    id BIGSERIAL PRIMARY KEY,
    id_aula BIGINT REFERENCES edc_aula(id) ON DELETE CASCADE,
    nome TEXT,
    anexo TEXT,
    tipo VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS edc_aula_aluno (
    id_aula BIGINT REFERENCES edc_aula(id) ON DELETE CASCADE,
    id_pessoa INT REFERENCES bas_pessoa(id),
    data_assitida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_edc_aula_aluno_id_aula_id_pessoa PRIMARY KEY (id_aula, id_pessoa)
);
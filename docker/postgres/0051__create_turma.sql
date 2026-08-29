-- Microsservico educacao - tabela turma (entidade Turma, PanacheEntity).
-- Aplicado apos o restore do olimpio.sql (ver restore no docker-compose.yml).

CREATE SEQUENCE IF NOT EXISTS public.turma_seq INCREMENT BY 50;

CREATE TABLE IF NOT EXISTS public.turma (
    id BIGINT PRIMARY KEY DEFAULT nextval('public.turma_seq'),
    nome TEXT NOT NULL,
    dadosJson TEXT
);
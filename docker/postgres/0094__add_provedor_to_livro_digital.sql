-- V94__add_provedor_to_livro_digital.sql
-- Adicionar coluna provedor_id na tabela bib_livro_digital

ALTER TABLE bib_livro_digital ADD COLUMN provedor_id BIGINT REFERENCES bib_provedor_digital(id);

CREATE INDEX idx_bib_livro_digital_provedor ON bib_livro_digital (provedor_id);
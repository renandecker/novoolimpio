-- V94__add_provedor_to_livro_digital.sql
-- Adicionar coluna provedor_id na tabela bib_livro_digital

DO $DO$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bib_livro_digital' AND column_name = 'provedor_id'
    ) THEN
        ALTER TABLE bib_livro_digital ADD COLUMN provedor_id BIGINT REFERENCES bib_provedor_digital(id);
    END IF;
END $DO$;

CREATE INDEX IF NOT EXISTS idx_bib_livro_digital_provedor ON bib_livro_digital (provedor_id);
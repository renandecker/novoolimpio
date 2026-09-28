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

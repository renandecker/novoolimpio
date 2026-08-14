-- Aula/corrigirAvaliacoes: ativa/desativa as avaliacoes conforme a janela
-- (data_inicial/data_final). A coluna fl_ativo foi adicionada no legado (Flyway
-- V1_4_584__aulas.sql), mas nao existe no backup olimpio.sql.
-- Aplicado apos o restore do olimpio.sql (ver restore no docker-compose.yml).

ALTER TABLE edc_avaliacao ADD COLUMN IF NOT EXISTS fl_ativo BOOLEAN;
UPDATE edc_avaliacao SET fl_ativo = true WHERE fl_ativo IS NULL;

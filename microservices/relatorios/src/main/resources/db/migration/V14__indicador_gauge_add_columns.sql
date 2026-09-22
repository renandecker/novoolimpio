-- V14__indicador_gauge_add_columns.sql
-- Adiciona colunas faltantes para compatibilidade com schema V55 (docker)

ALTER TABLE rel_indicador_gauge
    ADD COLUMN IF NOT EXISTS fl_ativo BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_by BIGINT,
    ADD COLUMN IF NOT EXISTS updated_by BIGINT;

-- Renomear sql_query para sql se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rel_indicador_gauge' AND column_name = 'sql_query')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rel_indicador_gauge' AND column_name = 'sql') THEN
        ALTER TABLE rel_indicador_gauge RENAME COLUMN sql_query TO sql;
    END IF;
END $$;

-- Renomear data_criacao para created_at se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rel_indicador_gauge' AND column_name = 'data_criacao')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rel_indicador_gauge' AND column_name = 'created_at') THEN
        ALTER TABLE rel_indicador_gauge RENAME COLUMN data_criacao TO created_at;
    END IF;
END $$;

-- Renomear data_atualizacao para updated_at se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rel_indicador_gauge' AND column_name = 'data_atualizacao')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rel_indicador_gauge' AND column_name = 'updated_at') THEN
        ALTER TABLE rel_indicador_gauge RENAME COLUMN data_atualizacao TO updated_at;
    END IF;
END $$;

-- Garantir que configuracao seja NOT NULL
ALTER TABLE rel_indicador_gauge ALTER COLUMN configuracao SET NOT NULL;
ALTER TABLE rel_indicador_gauge ALTER COLUMN configuracao SET DEFAULT '{}'::jsonb;

-- Garantir que sql seja NOT NULL
ALTER TABLE rel_indicador_gauge ALTER COLUMN sql SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_ativo ON rel_indicador_gauge(fl_ativo);
CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_created ON rel_indicador_gauge(created_at);
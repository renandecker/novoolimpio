-- V68__rel_indicador_gauge_schema.sql
-- Adiciona tabelas de Indicador Gauge (Velocímetro) no microserviço de login

BEGIN;

CREATE TABLE IF NOT EXISTS public.rel_indicador_gauge (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sql TEXT NOT NULL,
    configuracao JSONB NOT NULL DEFAULT '{}'::jsonb,
    fl_ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

COMMENT ON TABLE public.rel_indicador_gauge IS 'Indicadores do tipo Gauge (Velocímetro) para dashboards';
COMMENT ON COLUMN public.rel_indicador_gauge.nome IS 'Nome do indicador';
COMMENT ON COLUMN public.rel_indicador_gauge.sql IS 'Consulta SQL que retorna valor_atual, valor_minimo, valor_maximo';
COMMENT ON COLUMN public.rel_indicador_gauge.configuracao IS 'Configuração visual do gauge: níveis, cores, largura arco, animação, etc';

CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_nome ON public.rel_indicador_gauge(nome);
CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_ativo ON public.rel_indicador_gauge(fl_ativo);
CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_created ON public.rel_indicador_gauge(created_at);

DO $do$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
        CREATE OR REPLACE FUNCTION public.set_updated_at()
        RETURNS TRIGGER LANGUAGE plpgsql AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END; $func$;
    END IF;
END $do$;

DO $do$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_rel_indicador_gauge_updated_at') THEN
        CREATE TRIGGER trg_rel_indicador_gauge_updated_at
        BEFORE UPDATE ON public.rel_indicador_gauge
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $do$;

CREATE TABLE IF NOT EXISTS public.rel_indicador_gauge_usuario (
    id BIGSERIAL PRIMARY KEY,
    indicador_gauge_id BIGINT NOT NULL REFERENCES public.rel_indicador_gauge(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_usuario_indicador ON public.rel_indicador_gauge_usuario(indicador_gauge_id);
CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_usuario_usuario ON public.rel_indicador_gauge_usuario(usuario_id);

COMMENT ON TABLE public.rel_indicador_gauge_usuario IS 'Permissões de usuários para indicadores gauge';

CREATE TABLE IF NOT EXISTS public.rel_indicador_gauge_unidade (
    id BIGSERIAL PRIMARY KEY,
    indicador_gauge_id BIGINT NOT NULL REFERENCES public.rel_indicador_gauge(id) ON DELETE CASCADE,
    unidade_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_unidade_indicador ON public.rel_indicador_gauge_unidade(indicador_gauge_id);
CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_unidade_unidade ON public.rel_indicador_gauge_unidade(unidade_id);

COMMENT ON TABLE public.rel_indicador_gauge_unidade IS 'Permissões de unidades para indicadores gauge';

CREATE TABLE IF NOT EXISTS public.rel_indicador_gauge_perfil (
    id BIGSERIAL PRIMARY KEY,
    indicador_gauge_id BIGINT NOT NULL REFERENCES public.rel_indicador_gauge(id) ON DELETE CASCADE,
    perfil_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_perfil_indicador ON public.rel_indicador_gauge_perfil(indicador_gauge_id);
CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_perfil_perfil ON public.rel_indicador_gauge_perfil(perfil_id);

COMMENT ON TABLE public.rel_indicador_gauge_perfil IS 'Permissões de perfis para indicadores gauge';

CREATE TABLE IF NOT EXISTS public.rel_indicador_gauge_filtro (
    id BIGSERIAL PRIMARY KEY,
    indicador_gauge_id BIGINT NOT NULL REFERENCES public.rel_indicador_gauge(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    dimensao_id BIGINT,
    estrutura_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_filtro_indicador ON public.rel_indicador_gauge_filtro(indicador_gauge_id);
CREATE INDEX IF NOT EXISTS idx_rel_indicador_gauge_filtro_dimensao ON public.rel_indicador_gauge_filtro(dimensao_id);

COMMENT ON TABLE public.rel_indicador_gauge_filtro IS 'Filtros dinâmicos para indicadores gauge';

INSERT INTO public.rel_indicador_gauge (nome, sql, configuracao) VALUES
(
    'Meta de Vendas Mensal',
    'SELECT COALESCE(SUM(valor_total), 0) AS valor_atual, 0 AS valor_minimo, 50000 AS valor_maximo FROM vendas WHERE DATE_TRUNC(''month'', data_venda) = DATE_TRUNC(''month'', CURRENT_DATE);',
    '{"nrOfLevels": 3, "colors": ["#22c55e", "#eab308", "#ef4444"], "arcWidth": 0.3, "percent": 0.7, "textColor": "#1e293b", "needleColor": "#475569", "needleBaseColor": "#475569", "animate": true}'::jsonb
),
(
    'Receita Diária',
    'SELECT COALESCE(SUM(valor), 0) AS valor_atual, 0 AS valor_minimo, 10000 AS valor_maximo FROM fin_lancamento WHERE status = ''PAGO'' AND DATE(data_pagamento) = CURRENT_DATE;',
    '{"nrOfLevels": 3, "colors": ["#3b82f6", "#06b6d4", "#a855f7"], "arcWidth": 0.35, "percent": 0.65, "textColor": "#1e293b", "needleColor": "#1e40af", "needleBaseColor": "#1e40af", "animate": true}'::jsonb
),
(
    'Taxa de Conversão',
    'SELECT CASE WHEN total_leads > 0 THEN (total_convertidos::numeric / total_leads * 100) ELSE 0 END AS valor_atual, 0 AS valor_minimo, 100 AS valor_maximo FROM (SELECT COUNT(*) FILTER (WHERE status = ''CONVERTIDO'') AS total_convertidos, COUNT(*) AS total_leads FROM crm_lead WHERE DATE_TRUNC(''month'', created_at) = DATE_TRUNC(''month'', CURRENT_DATE)) sub;',
    '{"nrOfLevels": 4, "colors": ["#ef4444", "#f97316", "#eab308", "#22c55e"], "arcWidth": 0.25, "percent": 0.45, "textColor": "#1e293b", "needleColor": "#dc2626", "needleBaseColor": "#dc2626", "animate": true}'::jsonb
)
ON CONFLICT DO NOTHING;

COMMIT;

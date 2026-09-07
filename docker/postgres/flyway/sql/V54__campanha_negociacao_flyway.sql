-- V54__campanha_negociacao_flyway.sql
-- Flyway migration for Negotiation Campaigns
-- Apply changes to fin_campanha_negociacao table
-- Idempotente: utiliza IF NOT EXISTS e valida existencia previo

-- =================================================================================================
-- Tipo da campanha
-- =================================================================================================
ALTER TABLE IF EXISTS public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS tipo_campanha VARCHAR(50);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_campanha_tipo_chk') THEN
    ALTER TABLE public.fin_campanha_negociacao ADD CONSTRAINT fin_campanha_tipo_chk CHECK (tipo_campanha IS NULL OR tipo_campanha IN ('PARCELA_ZERO_ATRITO', 'TROCA_POR_DESCONTO', 'SEGUNDA_CHANCE', 'QUITA_FACIL'));
  END IF;
END $$;

COMMENT ON COLUMN public.fin_campanha_negociacao.tipo_campanha IS 'Tipo da campanha: PARCELA_ZERO_ATRITO, TROCA_POR_DESCONTO, SEGUNDA_CHANCE, QUITA_FACIL';

-- =================================================================================================
-- Objetivo da campanha
-- =================================================================================================
ALTER TABLE IF EXISTS public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS objetivo VARCHAR(100);
COMMENT ON COLUMN public.fin_campanha_negociacao.objetivo IS 'Foco: atrasos_recentes, liquidacao_rapida, prevencao_inadimplencia, engajamento_retencao';

-- =================================================================================================
-- Condicao especial
-- =================================================================================================
ALTER TABLE IF EXISTS public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS condicao_especial VARCHAR(200);
COMMENT ON COLUMN public.fin_campanha_negociacao.condicao_especial IS 'Regras: isencao_juros_multa_pix_mesmo_dia, desconto_percentual_fixo_liq_imediata, pula_mes_atual_para_final_contrato, quittar_parcela_desbloqueie_beneficio';

-- =================================================================================================
-- Beneficio na proxima parcela
-- =================================================================================================
ALTER TABLE IF EXISTS public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS beneficio_proximo_mes BOOLEAN DEFAULT false;
COMMENT ON COLUMN public.fin_campanha_negociacao.beneficio_proximo_mes IS 'Beneficio na parcela seguinte apos quittacao';

-- =================================================================================================
-- Tipo de oferta
-- =================================================================================================
ALTER TABLE IF EXISTS public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS tipo_oferta VARCHAR(50);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_campanha_tipo_oferta_chk') THEN
    ALTER TABLE public.fin_campanha_negociacao ADD CONSTRAINT fin_campanha_tipo_oferta_chk CHECK (tipo_oferta IS NULL OR tipo_oferta IN ('isenacao_juros_multa', 'desconto_percentual', 'reagendamento_sem_multa', 'quittar_1_desbloqueie_beneficio'));
  END IF;
END $$;

COMMENT ON COLUMN public.fin_campanha_negociacao.tipo_oferta IS 'Tipo de oferta: isenacao_juros_multa, desconto_percentual, reagendamento_sem_multa, quittar_1_desbloqueie_beneficio';

-- Indices
CREATE INDEX IF NOT EXISTS idx_fin_campanha_tipo ON public.fin_campanha_negociacao(tipo_campanha);
CREATE INDEX IF NOT EXISTS idx_fin_campanha_objetivo ON public.fin_campanha_negociacao(objetivo);

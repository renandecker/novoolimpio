-- 0053__campanha_negociacao_tipos.sql
-- Migracao para adicionar campos das 4 campanhas de negociacao
-- Campos adicionais ao table fin_campanha_negociacao
-- Idempotente: so adiciona se nao existir

-- =================================================================================================
-- Tipo da campanha: define qual das 4 estrategias sera aplicada
-- =================================================================================================
ALTER TABLE public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS tipo_campanha VARCHAR(50);
ALTER TABLE public.fin_campanha_negociacao ADD CONSTRAINT fin_campanha_tipo_chk CHECK (tipo_campanha IS NULL OR tipo_campanha IN ('PARCELA_ZERO_ATRITO', 'TROCA_POR_DESCONTO', 'SEGUNDA_CHANCE', 'QUITA_FACIL'));

COMMENT ON COLUMN public.fin_campanha_negociacao.tipo_campanha IS 'Tipo da campanha de negociacao: PARCELA_ZERO_ATRITO, TROCA_POR_DESCONTO, SEGUNDA_CHANCE, QUITA_FACIL';

-- =================================================================================================
-- Objetivo da campanha: foco da estrategia de negociacao
-- =================================================================================================
ALTER TABLE public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS objetivo VARCHAR(100);
COMMENT ON COLUMN public.fin_campanha_negociacao.objetivo IS 'Foco da campanha: atrasos_recentes, liquidacao_rapida, prevencao_inadimplencia, engajamento_retencao';

-- =================================================================================================
-- Condicao especial: regras especificas de cada campanha
-- =================================================================================================
ALTER TABLE public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS condicao_especial VARCHAR(200);
COMMENT ON COLUMN public.fin_campanha_negociacao.condicao_especial IS 'Regras especificas: isencao_juros_multa_pix_mesmo_dia, desconto_percentual_fixo_liq_imediata, pula_mes_atual_para_final_contrato, quittar_parcela_desbloqueie_beneficio';

-- =================================================================================================
-- Beneficio na proxima parcela: indica se o cliente ganha beneficio na parcela seguinte
-- (usado na campanha Quita Faci)
-- =================================================================================================
ALTER TABLE public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS beneficio_proximo_mes BOOLEAN DEFAULT false;
COMMENT ON COLUMN public.fin_campanha_negociacao.beneficio_proximo_mes IS 'Se verdadeiro, cliente ganha beneficio (desconto/cashback) na proxima parcela apos a quittacao';

-- =================================================================================================
-- Tipo de oferta: descricao resumida do que o cliente recebera
-- =================================================================================================
ALTER TABLE public.fin_campanha_negociacao ADD COLUMN IF NOT EXISTS tipo_oferta VARCHAR(50);
ALTER TABLE public.fin_campanha_negociacao ADD CONSTRAINT fin_campanha_tipo_oferta_chk CHECK (tipo_oferta IS NULL OR tipo_oferta IN ('isenacao_juros_multa', 'desconto_percentual', 'reagendamento_sem_multa', 'quittar_1_desbloqueie_beneficio'));

COMMENT ON COLUMN public.fin_campanha_negociacao.tipo_oferta IS 'Tipo de oferta: isenacao_juros_multa, desconto_percentual, reagendamento_sem_multa, quittar_1_desbloqueie_beneficio';

-- =================================================================================================
-- Index para busca por tipo de campanha
-- =================================================================================================
CREATE INDEX IF NOT EXISTS idx_fin_campanha_tipo ON public.fin_campanha_negociacao(tipo_campanha);
CREATE INDEX IF NOT EXISTS idx_fin_campanha_objetivo ON public.fin_campanha_negociacao(objetivo);

-- =================================================================================================
-- Exemplos de dados inseridos para as 4 campanhas iniciais
-- =================================================================================================
DO $DO$
BEGIN
    -- Campaign 1: Parcela Zero Atrito (foco: atrasos ate 30 dias)
    INSERT INTO public.fin_campanha_negociacao (id, descricao, tipo_campanha, objetivo, condicao_especial, tipo_oferta, ativo, data_fim, criado_em, atualizado_em)
    SELECT nextval('public.fin_campanha_negociacao_id_seq'),
           'Parcela Zero Atrito',
           'PARCELA_ZERO_ATRITO',
           'atrasos_recentes',
           'isencao_juros_multa_pix_mesmo_dia',
           'isenacao_juros_multa',
           true,
           null,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM public.fin_campanha_negociacao WHERE lower(descricao) = lower('Parcela Zero Atrito'));

    -- Campaign 2: Troca por Desconto (foco: liquidacao rapida)
    INSERT INTO public.fin_campanha_negociacao (id, descricao, tipo_campanha, objetivo, condicao_especial, tipo_oferta, ativo, data_fim, criado_em, atualizado_em)
    SELECT nextval('public.fin_campanha_negociacao_id_seq'),
           'Troca por Desconto',
           'TROCA_POR_DESCONTO',
           'liquidacao_rapida',
           'desconto_percentual_fixo_liq_imediata',
           'desconto_percentual',
           true,
           null,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM public.fin_campanha_negociacao WHERE lower(descricao) = lower('Troca por Desconto'));

    -- Campaign 3: Segunda Chance / Reagendamento (foco: previnir inadimplencia longa)
    INSERT INTO public.fin_campanha_negociacao (id, descricao, tipo_campanha, objetivo, condicao_especial, tipo_oferta, ativo, data_fim, criado_em, atualizado_em)
    SELECT nextval('public.fin_campanha_negociacao_id_seq'),
           'Segunda Chance',
           'SEGUNDA_CHANCE',
           'prevencao_inadimplencia',
           'pula_mes_atual_para_final_contrato',
           'reagendamento_sem_multa',
           true,
           null,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM public.fin_campanha_negociacao WHERE lower(descricao) = lower('Segunda Chance'));

    -- Campaign 4: Quita Faci / Pague 1, Desbloqueie Beneficio (foco: engajamento e retencao)
    INSERT INTO public.fin_campanha_negociacao (id, descricao, tipo_campanha, objetivo, condicao_especial, tipo_oferta, ativo, beneficio_proximo_mes, data_fim, criado_em, atualizado_em)
    SELECT nextval('public.fin_campanha_negociacao_id_seq'),
           'Quita Faci',
           'QUITA_FACIL',
           'engajamento_retencao',
           'quittar_parcela_desbloqueie_beneficio',
           'quittar_1_desbloqueie_beneficio_proximo_mes',
           true,
           true,
           null,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM public.fin_campanha_negociacao WHERE lower(descricao) = lower('Quita Faci'));
END
$DO$;
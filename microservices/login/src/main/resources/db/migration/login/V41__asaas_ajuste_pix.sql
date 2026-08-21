--
-- V41__asaas_ajuste_pix.sql
--
-- Contexto: a collection Fiserv fornecida (fiserv_dev_postman_collection.json) NAO contem
-- nenhum endpoint de PIX (busca por "pix" no arquivo inteiro retorna zero ocorrencias - e a
-- API global de e-commerce da Fiserv, PIX e um meio de pagamento brasileiro). Por isso nao ha
-- um "schema de referencia" da Fiserv para comparar.
--
-- Em vez disso, esta migracao revisa as tabelas legadas fin_pix / fin_parcela_pix (V1__base.sql)
-- contra o que uma cobranca PIX real precisa para funcionar de ponta a ponta com o modulo
-- pix/ deste microsservico (ver PixProviderClient), e fecha as lacunas encontradas:
--
--   fin_parcela_pix NAO tinha:
--     - valor / valor_pago      -> impossivel saber quanto foi cobrado/pago
--     - identificador generico do PSP -> so existia id_asaas (acopla a tabela a um PSP especifico,
--                                        mas o modulo pix/ foi desenhado para ser plugavel a
--                                        qualquer provedor via PixProviderClient)
--     - end_to_end_id            -> comprovante oficial do Banco Central (E2E), necessario para
--                                    conciliacao e para o cliente confirmar o pagamento
--     - data_criacao / data_pagamento -> so havia data_vencimento
--
--   fin_pix (chave PIX da unidade/loja) NAO tinha:
--     - tipo_chave               -> necessario para validar/exibir a chave corretamente
--                                    (CPF, CNPJ, EMAIL, TELEFONE, ALEATORIA)
--     - fl_ativo                 -> nao dava para desativar uma chave sem apagar o registro
--
-- Todas as alteracoes sao ADITIVAS (ALTER TABLE ... ADD COLUMN IF NOT EXISTS) e nao quebram
-- nada que ja exista (fin_asaas, cron jobs legados, etc. continuam funcionando com id_asaas
-- intacto).
--


-- =================================================================================================
-- fin_parcela_pix: valor da cobranca + identificador generico do PSP + rastreabilidade
-- =================================================================================================
ALTER TABLE public.fin_parcela_pix ADD COLUMN IF NOT EXISTS valor numeric(15,2);
ALTER TABLE public.fin_parcela_pix ADD COLUMN IF NOT EXISTS valor_pago numeric(15,2);
ALTER TABLE public.fin_parcela_pix ADD COLUMN IF NOT EXISTS moeda character varying(3) DEFAULT 'BRL';
ALTER TABLE public.fin_parcela_pix ADD COLUMN IF NOT EXISTS provider_charge_id character varying(100);
ALTER TABLE public.fin_parcela_pix ADD COLUMN IF NOT EXISTS end_to_end_id character varying(50);
ALTER TABLE public.fin_parcela_pix ADD COLUMN IF NOT EXISTS data_criacao timestamp without time zone DEFAULT now();
ALTER TABLE public.fin_parcela_pix ADD COLUMN IF NOT EXISTS data_pagamento timestamp without time zone;

COMMENT ON COLUMN public.fin_parcela_pix.valor IS 'Valor solicitado na cobranca PIX';
COMMENT ON COLUMN public.fin_parcela_pix.valor_pago IS 'Valor efetivamente recebido (pode divergir do solicitado)';
COMMENT ON COLUMN public.fin_parcela_pix.provider_charge_id IS
  'Identificador da cobranca no PSP configurado (PixProviderClient) - generico, funciona com '
  'qualquer provedor. id_asaas e mantido por compatibilidade com integracoes legadas que usam o Asaas diretamente.';
COMMENT ON COLUMN public.fin_parcela_pix.end_to_end_id IS 'E2E ID (comprovante oficial do Banco Central) apos a confirmacao do pagamento';

CREATE INDEX IF NOT EXISTS idx_fin_parcela_pix_provider_charge_id ON public.fin_parcela_pix (provider_charge_id);

-- Espelha as mesmas colunas na tabela de auditoria, no mesmo padrao ja usado para as demais colunas
ALTER TABLE public.fin_parcela_pix_aud ADD COLUMN IF NOT EXISTS valor numeric(15,2);
ALTER TABLE public.fin_parcela_pix_aud ADD COLUMN IF NOT EXISTS valor_pago numeric(15,2);
ALTER TABLE public.fin_parcela_pix_aud ADD COLUMN IF NOT EXISTS provider_charge_id character varying(100);
ALTER TABLE public.fin_parcela_pix_aud ADD COLUMN IF NOT EXISTS end_to_end_id character varying(50);
ALTER TABLE public.fin_parcela_pix_aud ADD COLUMN IF NOT EXISTS data_pagamento timestamp without time zone;


-- =================================================================================================
-- fin_pix: chave PIX da unidade/loja - tipo da chave + status
-- =================================================================================================
ALTER TABLE public.fin_pix ADD COLUMN IF NOT EXISTS tipo_chave character varying(20);
ALTER TABLE public.fin_pix ADD COLUMN IF NOT EXISTS fl_ativo boolean DEFAULT true;
ALTER TABLE public.fin_pix ADD COLUMN IF NOT EXISTS data_cadastro timestamp without time zone DEFAULT now();

COMMENT ON COLUMN public.fin_pix.tipo_chave IS 'CPF | CNPJ | EMAIL | TELEFONE | ALEATORIA';

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_pix_tipo_chave_chk') THEN
        ALTER TABLE ONLY public.fin_pix
            ADD CONSTRAINT fin_pix_tipo_chave_chk
            CHECK (tipo_chave IS NULL OR tipo_chave IN ('CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'ALEATORIA'));
    END IF;
END
$DO$;
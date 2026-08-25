-- V47: Tabela fin_bancos para armazenar credenciais de gateways de pagamento (Fiserv/Asaas) por unidade.
--   Chave-valor por unidade + provedor + nome da chave.
--   Substitui as variaveis de ambiente / application.properties para configuracao dinamica.

CREATE TABLE IF NOT EXISTS public.fin_bancos (
    id              BIGSERIAL PRIMARY KEY,
    id_unidade      BIGINT NOT NULL REFERENCES bas_unidade(id),
    provedor        VARCHAR(20) NOT NULL,   -- 'FISERV' ou 'ASAAS'
    chave           VARCHAR(100) NOT NULL,   -- ex: base-url, api-key, api-secret, store-id, currency, timeout-ms
    valor           TEXT,
    fl_ativo        BOOLEAN DEFAULT TRUE,
    data_criacao    TIMESTAMP DEFAULT NOW(),
    data_alteracao  TIMESTAMP
);

ALTER TABLE public.fin_bancos
    ADD CONSTRAINT uk_fin_bancos_unidade_provedor_chave
    UNIQUE (id_unidade, provedor, chave);

COMMENT ON TABLE  public.fin_bancos                IS 'Credenciais e configuracoes de gateways de pagamento por unidade';
COMMENT ON COLUMN public.fin_bancos.provedor        IS 'FISERV ou ASAAS';
COMMENT ON COLUMN public.fin_bancos.chave           IS 'Nome da chave: base-url, api-key, api-secret, store-id, currency, timeout-ms';
COMMENT ON COLUMN public.fin_bancos.valor           IS 'Valor da configuracao (texto livre)';

-- Menu: Configuracao Financeira (dentro do modulo basico > Configuracoes)
INSERT INTO bas_modulo (id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem, fl_ativo)
SELECT nextval('bas_modulo_id_modulo_seq'),
       'Configuracao Financeira',
       'Credenciais Fiserv e Asaas por unidade',
       'account_balance',
       'view/configuracaoFinanceira/listConfiguracaoFinanceira',
       'Gerencia chaves de API dos gateways de pagamento por unidade',
       98,
       true
WHERE NOT EXISTS (
    SELECT 1 FROM bas_modulo WHERE outcome = 'view/configuracaoFinanceira/listConfiguracaoFinanceira'
);

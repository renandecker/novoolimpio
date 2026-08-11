-- Tabela: fin_cartao_pessoa
--
-- Armazena os cartoes cadastrados por uma pessoa (bas_pessoa) para pagamentos recorrentes/
-- futuros. NUNCA armazena o PAN completo nem o CVV (isso violaria PCI-DSS) - apenas:
--   - bin              : os 6 a 8 primeiros digitos do cartao (identifica emissor/bandeira)
--   - ultimos_digitos  : os 4 ultimos digitos do cartao (suffix, para exibicao "final 1234")
--   - cpf               : CPF do titular do cartao (pode ou nao ser o mesmo CPF da pessoa)
--   - payment_token      : token retornado pela Fiserv (endpoint /v2/payment-tokens) usado
--                            para efetuar cobrancas futuras sem reenviar os dados do cartao
-- =================================================================================================
CREATE TABLE IF NOT EXISTS public.fin_cartao_pessoa (
    id                  bigint NOT NULL,
    id_pessoa           integer NOT NULL,
    cpf                 character varying(14) NOT NULL,
    bin                 character varying(8) NOT NULL,
    ultimos_digitos     character varying(4) NOT NULL,
    bandeira            character varying(30),
    nome_titular        character varying(150),
    validade_mes        character varying(2),
    validade_ano        character varying(4),
    payment_token       character varying(500),
    fiserv_token_id      character varying(100),
    apelido             character varying(60),
    fl_ativo            boolean DEFAULT true,
    fl_principal        boolean DEFAULT false,
    data_cadastro       timestamp without time zone DEFAULT now(),
    data_alteracao      timestamp without time zone,
    id_usuario_cadastro integer
);

ALTER TABLE public.fin_cartao_pessoa OWNER TO postgres;

COMMENT ON TABLE public.fin_cartao_pessoa IS
  'Cartoes de pagamento cadastrados por pessoa. Armazena somente bin + ultimos digitos + '
  'token do gateway (Fiserv) - nunca o PAN completo ou o CVV (PCI-DSS).';
COMMENT ON COLUMN public.fin_cartao_pessoa.bin IS 'Bank Identification Number: 6 a 8 primeiros digitos do cartao';
COMMENT ON COLUMN public.fin_cartao_pessoa.ultimos_digitos IS 'Ultimos 4 digitos do cartao (suffix)';
COMMENT ON COLUMN public.fin_cartao_pessoa.payment_token IS 'paymentToken retornado por POST /ipp/payments-gateway/v2/payment-tokens (Fiserv)';

CREATE SEQUENCE IF NOT EXISTS public.fin_cartao_pessoa_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.fin_cartao_pessoa_id_seq OWNER TO postgres;
ALTER SEQUENCE public.fin_cartao_pessoa_id_seq OWNED BY public.fin_cartao_pessoa.id;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_attrdef d JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
                    WHERE d.adrelid = 'public.fin_cartao_pessoa'::regclass AND a.attname = 'id') THEN
        ALTER TABLE ONLY public.fin_cartao_pessoa ALTER COLUMN id SET DEFAULT nextval('public.fin_cartao_pessoa_id_seq'::regclass);
    END IF;
END
$DO$;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_cartao_pessoa_pkey') THEN
        ALTER TABLE ONLY public.fin_cartao_pessoa
            ADD CONSTRAINT fin_cartao_pessoa_pkey PRIMARY KEY (id);
    END IF;
END
$DO$;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_cartao_pessoa_id_pessoa_fkey') THEN
        ALTER TABLE ONLY public.fin_cartao_pessoa
            ADD CONSTRAINT fin_cartao_pessoa_id_pessoa_fkey FOREIGN KEY (id_pessoa) REFERENCES public.bas_pessoa(id);
    END IF;
END
$DO$;

-- Evita cadastrar o mesmo cartao (mesmo bin + final + validade) duas vezes para a mesma pessoa
DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_cartao_pessoa_uk_cartao') THEN
        ALTER TABLE ONLY public.fin_cartao_pessoa
            ADD CONSTRAINT fin_cartao_pessoa_uk_cartao
            UNIQUE (id_pessoa, bin, ultimos_digitos, validade_mes, validade_ano);
    END IF;
END
$DO$;

CREATE INDEX IF NOT EXISTS idx_fin_cartao_pessoa_id_pessoa ON public.fin_cartao_pessoa (id_pessoa);
CREATE INDEX IF NOT EXISTS idx_fin_cartao_pessoa_cpf ON public.fin_cartao_pessoa (cpf);


-- =================================================================================================
-- Tabela: fin_parcela_cartao
--
-- Registra cada transacao de cartao (a vista ou parcelada) efetuada via Fiserv, vinculada a
-- fin_parcela (o mesmo papel que fin_parcela_boleto e fin_parcela_pix ja cumprem para boleto
-- e pix). Guarda os identificadores retornados pela Fiserv para consulta/estorno posterior.
-- =================================================================================================
CREATE TABLE IF NOT EXISTS public.fin_parcela_cartao (
    id                      bigint NOT NULL,
    id_cartao_pessoa        bigint,
    tipo_pagamento          character varying(20) NOT NULL DEFAULT 'VISTA',
    qtd_parcelas            integer NOT NULL DEFAULT 1,
    valor                   numeric(15,2) NOT NULL,
    moeda                   character varying(3) NOT NULL DEFAULT 'BRL',
    merchant_transaction_id character varying(100),
    ipg_transaction_id      character varying(100),
    order_id                character varying(100),
    payment_schedule_id     character varying(100),
    status                  character varying(30),
    codigo_autorizacao      character varying(60),
    mensagem_retorno        text,
    fl_ativo                boolean DEFAULT true,
    data_transacao          timestamp without time zone DEFAULT now(),
    data_cancelamento       timestamp without time zone,
    CONSTRAINT fin_parcela_cartao_tipo_pagamento_chk
        CHECK (tipo_pagamento IN ('VISTA', 'PARCELADO'))
);

ALTER TABLE public.fin_parcela_cartao OWNER TO postgres;

COMMENT ON TABLE public.fin_parcela_cartao IS
  'Transacao de pagamento com cartao (Fiserv Payments Gateway), a vista (PaymentCardSaleTransaction) '
  'ou parcelada (PaymentMethodPaymentSchedulesRequest), vinculada a fin_parcela.id_parcela_cartao.';
COMMENT ON COLUMN public.fin_parcela_cartao.tipo_pagamento IS 'VISTA = PaymentCardSaleTransaction | PARCELADO = PaymentMethodPaymentSchedulesRequest';
COMMENT ON COLUMN public.fin_parcela_cartao.ipg_transaction_id IS 'ipgTransactionId retornado pela Fiserv em /v2/payments (pagamento a vista)';
COMMENT ON COLUMN public.fin_parcela_cartao.payment_schedule_id IS 'orderId/scheduleId retornado pela Fiserv em /v2/payment-schedules (pagamento parcelado)';

CREATE SEQUENCE IF NOT EXISTS public.fin_parcela_cartao_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.fin_parcela_cartao_id_seq OWNER TO postgres;
ALTER SEQUENCE public.fin_parcela_cartao_id_seq OWNED BY public.fin_parcela_cartao.id;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_attrdef d JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
                    WHERE d.adrelid = 'public.fin_parcela_cartao'::regclass AND a.attname = 'id') THEN
        ALTER TABLE ONLY public.fin_parcela_cartao ALTER COLUMN id SET DEFAULT nextval('public.fin_parcela_cartao_id_seq'::regclass);
    END IF;
END
$DO$;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_parcela_cartao_pkey') THEN
        ALTER TABLE ONLY public.fin_parcela_cartao
            ADD CONSTRAINT fin_parcela_cartao_pkey PRIMARY KEY (id);
    END IF;
END
$DO$;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_parcela_cartao_id_cartao_pessoa_fkey') THEN
        ALTER TABLE ONLY public.fin_parcela_cartao
            ADD CONSTRAINT fin_parcela_cartao_id_cartao_pessoa_fkey FOREIGN KEY (id_cartao_pessoa) REFERENCES public.fin_cartao_pessoa(id);
    END IF;
END
$DO$;

CREATE INDEX IF NOT EXISTS idx_fin_parcela_cartao_id_cartao_pessoa ON public.fin_parcela_cartao (id_cartao_pessoa);
CREATE INDEX IF NOT EXISTS idx_fin_parcela_cartao_ipg_transaction_id ON public.fin_parcela_cartao (ipg_transaction_id);
CREATE INDEX IF NOT EXISTS idx_fin_parcela_cartao_order_id ON public.fin_parcela_cartao (order_id);


-- =================================================================================================
-- fin_parcela: adiciona id_parcela_cartao, no mesmo padrao de id_parcela_boleto / id_parcela_pix,
-- para que uma parcela financeira saiba se (e como) foi paga via cartao.
-- =================================================================================================
ALTER TABLE public.fin_parcela ADD COLUMN IF NOT EXISTS id_parcela_cartao bigint;
COMMENT ON COLUMN public.fin_parcela.id_parcela_cartao IS 'Vinculo com fin_parcela_cartao quando a parcela e paga com cartao (a vista ou parcelado)';

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_parcela_id_parcela_cartao_fkey') THEN
        ALTER TABLE ONLY public.fin_parcela
            ADD CONSTRAINT fin_parcela_id_parcela_cartao_fkey FOREIGN KEY (id_parcela_cartao) REFERENCES public.fin_parcela_cartao(id);
    END IF;
END
$DO$;

--
-- V2__pagamento_fiserv.sql
--
-- Objetivo: dar suporte ao microsservico olimpio-pagamento-service, que integra com a
-- Fiserv Commerce Hub / Payments Gateway (IPP) para pagamentos com cartao (a vista e
-- parcelado) e ao fluxo de PIX ja existente no schema legado (fin_pix / fin_parcela_pix).
--
-- Este script e aditivo ao V1__base.sql: nao altera nenhuma tabela/coluna existente,
-- apenas cria as tabelas novas e uma unica coluna de vinculo em fin_parcela
-- (id_parcela_cartao), seguindo exatamente o mesmo padrao ja usado para
-- id_parcela_boleto / id_parcela_pix.
--
-- Segue o padrao de idempotencia do V1 (CREATE TABLE IF NOT EXISTS / DO $DO$ ... IF NOT
-- EXISTS para constraints), para que possa ser reexecutado com seguranca.
--

-- =================================================================================================
-- Tabela: fin_cartao_pessoa
--
-- Armazena os cartoes cadastrados por uma pessoa (bas_pessoa) para pagamentos recorrentes/
-- futuros. NUNCA armazena o PAN completo nem o CVV (isso violaria PCI-DSS) - apenas:
--   - bin              : os 6 a 8 primeiros digitos do cartao (identifica emissor/bandeira)
--   - ultimos_digitos  : os 4 ultimos digitos do cartao (suffix, para exibicao "final 1234")
--   - cpf               : CPF do titular do cartao (pode ou nao ser o mesmo CPF da pessoa)
--   - payment_token      : token retornado pela Fiserv (endpoint /v2/payment-tokens) usado
--                            para efetuar cobrancas futuras sem reenviar os dados do cartao
-- =================================================================================================
CREATE TABLE IF NOT EXISTS public.fin_cartao_pessoa (
    id                  bigint NOT NULL,
    id_pessoa           integer NOT NULL,
    cpf                 character varying(14) NOT NULL,
    bin                 character varying(8) NOT NULL,
    ultimos_digitos     character varying(4) NOT NULL,
    bandeira            character varying(30),
    nome_titular        character varying(150),
    validade_mes        character varying(2),
    validade_ano        character varying(4),
    payment_token       character varying(500),
    fiserv_token_id      character varying(100),
    apelido             character varying(60),
    fl_ativo            boolean DEFAULT true,
    fl_principal        boolean DEFAULT false,
    data_cadastro       timestamp without time zone DEFAULT now(),
    data_alteracao      timestamp without time zone,
    id_usuario_cadastro integer
);

ALTER TABLE public.fin_cartao_pessoa OWNER TO postgres;

COMMENT ON TABLE public.fin_cartao_pessoa IS
  'Cartoes de pagamento cadastrados por pessoa. Armazena somente bin + ultimos digitos + '
  'token do gateway (Fiserv) - nunca o PAN completo ou o CVV (PCI-DSS).';
COMMENT ON COLUMN public.fin_cartao_pessoa.bin IS 'Bank Identification Number: 6 a 8 primeiros digitos do cartao';
COMMENT ON COLUMN public.fin_cartao_pessoa.ultimos_digitos IS 'Ultimos 4 digitos do cartao (suffix)';
COMMENT ON COLUMN public.fin_cartao_pessoa.payment_token IS 'paymentToken retornado por POST /ipp/payments-gateway/v2/payment-tokens (Fiserv)';

CREATE SEQUENCE IF NOT EXISTS public.fin_cartao_pessoa_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.fin_cartao_pessoa_id_seq OWNER TO postgres;
ALTER SEQUENCE public.fin_cartao_pessoa_id_seq OWNED BY public.fin_cartao_pessoa.id;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_attrdef d JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
                    WHERE d.adrelid = 'public.fin_cartao_pessoa'::regclass AND a.attname = 'id') THEN
        ALTER TABLE ONLY public.fin_cartao_pessoa ALTER COLUMN id SET DEFAULT nextval('public.fin_cartao_pessoa_id_seq'::regclass);
    END IF;
END
$DO$;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_cartao_pessoa_pkey') THEN
        ALTER TABLE ONLY public.fin_cartao_pessoa
            ADD CONSTRAINT fin_cartao_pessoa_pkey PRIMARY KEY (id);
    END IF;
END
$DO$;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_cartao_pessoa_id_pessoa_fkey') THEN
        ALTER TABLE ONLY public.fin_cartao_pessoa
            ADD CONSTRAINT fin_cartao_pessoa_id_pessoa_fkey FOREIGN KEY (id_pessoa) REFERENCES public.bas_pessoa(id);
    END IF;
END
$DO$;

-- Evita cadastrar o mesmo cartao (mesmo bin + final + validade) duas vezes para a mesma pessoa
DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_cartao_pessoa_uk_cartao') THEN
        ALTER TABLE ONLY public.fin_cartao_pessoa
            ADD CONSTRAINT fin_cartao_pessoa_uk_cartao
            UNIQUE (id_pessoa, bin, ultimos_digitos, validade_mes, validade_ano);
    END IF;
END
$DO$;

CREATE INDEX IF NOT EXISTS idx_fin_cartao_pessoa_id_pessoa ON public.fin_cartao_pessoa (id_pessoa);
CREATE INDEX IF NOT EXISTS idx_fin_cartao_pessoa_cpf ON public.fin_cartao_pessoa (cpf);


-- =================================================================================================
-- Tabela: fin_parcela_cartao
--
-- Registra cada transacao de cartao (a vista ou parcelada) efetuada via Fiserv, vinculada a
-- fin_parcela (o mesmo papel que fin_parcela_boleto e fin_parcela_pix ja cumprem para boleto
-- e pix). Guarda os identificadores retornados pela Fiserv para consulta/estorno posterior.
-- =================================================================================================
CREATE TABLE IF NOT EXISTS public.fin_parcela_cartao (
    id                      bigint NOT NULL,
    id_cartao_pessoa        bigint,
    tipo_pagamento          character varying(20) NOT NULL DEFAULT 'VISTA',
    qtd_parcelas            integer NOT NULL DEFAULT 1,
    valor                   numeric(15,2) NOT NULL,
    moeda                   character varying(3) NOT NULL DEFAULT 'BRL',
    merchant_transaction_id character varying(100),
    ipg_transaction_id      character varying(100),
    order_id                character varying(100),
    payment_schedule_id     character varying(100),
    status                  character varying(30),
    codigo_autorizacao      character varying(60),
    mensagem_retorno        text,
    fl_ativo                boolean DEFAULT true,
    data_transacao          timestamp without time zone DEFAULT now(),
    data_cancelamento       timestamp without time zone,
    CONSTRAINT fin_parcela_cartao_tipo_pagamento_chk
        CHECK (tipo_pagamento IN ('VISTA', 'PARCELADO'))
);

ALTER TABLE public.fin_parcela_cartao OWNER TO postgres;

COMMENT ON TABLE public.fin_parcela_cartao IS
  'Transacao de pagamento com cartao (Fiserv Payments Gateway), a vista (PaymentCardSaleTransaction) '
  'ou parcelada (PaymentMethodPaymentSchedulesRequest), vinculada a fin_parcela.id_parcela_cartao.';
COMMENT ON COLUMN public.fin_parcela_cartao.tipo_pagamento IS 'VISTA = PaymentCardSaleTransaction | PARCELADO = PaymentMethodPaymentSchedulesRequest';
COMMENT ON COLUMN public.fin_parcela_cartao.ipg_transaction_id IS 'ipgTransactionId retornado pela Fiserv em /v2/payments (pagamento a vista)';
COMMENT ON COLUMN public.fin_parcela_cartao.payment_schedule_id IS 'orderId/scheduleId retornado pela Fiserv em /v2/payment-schedules (pagamento parcelado)';

CREATE SEQUENCE IF NOT EXISTS public.fin_parcela_cartao_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.fin_parcela_cartao_id_seq OWNER TO postgres;
ALTER SEQUENCE public.fin_parcela_cartao_id_seq OWNED BY public.fin_parcela_cartao.id;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_attrdef d JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
                    WHERE d.adrelid = 'public.fin_parcela_cartao'::regclass AND a.attname = 'id') THEN
        ALTER TABLE ONLY public.fin_parcela_cartao ALTER COLUMN id SET DEFAULT nextval('public.fin_parcela_cartao_id_seq'::regclass);
    END IF;
END
$DO$;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_parcela_cartao_pkey') THEN
        ALTER TABLE ONLY public.fin_parcela_cartao
            ADD CONSTRAINT fin_parcela_cartao_pkey PRIMARY KEY (id);
    END IF;
END
$DO$;

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_parcela_cartao_id_cartao_pessoa_fkey') THEN
        ALTER TABLE ONLY public.fin_parcela_cartao
            ADD CONSTRAINT fin_parcela_cartao_id_cartao_pessoa_fkey FOREIGN KEY (id_cartao_pessoa) REFERENCES public.fin_cartao_pessoa(id);
    END IF;
END
$DO$;

CREATE INDEX IF NOT EXISTS idx_fin_parcela_cartao_id_cartao_pessoa ON public.fin_parcela_cartao (id_cartao_pessoa);
CREATE INDEX IF NOT EXISTS idx_fin_parcela_cartao_ipg_transaction_id ON public.fin_parcela_cartao (ipg_transaction_id);
CREATE INDEX IF NOT EXISTS idx_fin_parcela_cartao_order_id ON public.fin_parcela_cartao (order_id);


-- =================================================================================================
-- fin_parcela: adiciona id_parcela_cartao, no mesmo padrao de id_parcela_boleto / id_parcela_pix,
-- para que uma parcela financeira saiba se (e como) foi paga via cartao.
-- =================================================================================================
ALTER TABLE public.fin_parcela ADD COLUMN IF NOT EXISTS id_parcela_cartao bigint;
COMMENT ON COLUMN public.fin_parcela.id_parcela_cartao IS 'Vinculo com fin_parcela_cartao quando a parcela e paga com cartao (a vista ou parcelado)';

DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_parcela_id_parcela_cartao_fkey') THEN
        ALTER TABLE ONLY public.fin_parcela
            ADD CONSTRAINT fin_parcela_id_parcela_cartao_fkey FOREIGN KEY (id_parcela_cartao) REFERENCES public.fin_parcela_cartao(id);
    END IF;
END
$DO$;

CREATE INDEX IF NOT EXISTS idx_fin_parcela_id_parcela_cartao ON public.fin_parcela (id_parcela_cartao);

-- Mantem a tabela de auditoria (fin_parcela_aud) espelhando a nova coluna, no mesmo padrao
-- ja usado para id_parcela_boleto / id_parcela_pix (sem FK, pois e historico).
ALTER TABLE public.fin_parcela_aud ADD COLUMN IF NOT EXISTS id_parcela_cartao bigint;


--
-- V3__ajuste_pix.sql
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



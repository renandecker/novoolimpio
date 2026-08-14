-- =================================================================================================
-- ATENCAO: este arquivo corresponde APENAS ao V17__fiserv.sql do login-service (schema
-- fin_cartao_pessoa / fin_parcela_cartao). O conteudo que antes estava concatenado aqui
-- (V2__pagamento_fiserv.sql e V3__ajuste_pix.sql) foi removido - ele e aplicado
-- separadamente por 0021__pagamento_fiserv.sql e 0022__ajuste_pix.sql (equivalente ao
-- V21/V22 do login-service), evitando a execucao triplicada das mesmas DDLs.
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

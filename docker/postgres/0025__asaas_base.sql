--
-- Microsservico "asaas" - espelho local das cobrancas criadas no Asaas.
--
-- A tabela fin_asaas_parcela ja vem no backup olimpio.sql restaurado pelo
-- docker-compose (restore). Esta migracao e idempotente (CREATE TABLE IF NOT EXISTS)
-- e garante a estrutura mesmo em instalacoes novas, sem conflito com o restore.
--
-- Colunas espelham o retorno da API do Asaas (v3/payments) no momento em que a
-- cobranca e criada/sincronizada. status/billing_type seguem as enums
-- AsaasStatusParcela / AsaasTipoPagamento (string).
--

CREATE TABLE IF NOT EXISTS public.fin_asaas_parcela (
    id bigint NOT NULL,
    billing_type character varying(20),
    data_criacao timestamp without time zone DEFAULT now(),
    payment_date date,
    value double precision,
    installment character varying(500),
    asaas_id character varying(500),
    status character varying(20),
    url character varying(500),
    url_pagamento character varying(500),
    description character varying(1000),
    installmentnumber integer,
    discount double precision,
    fine double precision,
    interest double precision,
    discount_type character varying(20),
    fine_type character varying(20),
    interest_type character varying(20),
    qrcodeimage text,
    keypix text,
    fl_ativo boolean DEFAULT true,
    payload text
);

CREATE SEQUENCE IF NOT EXISTS public.fin_asaas_parcela_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.fin_asaas_parcela_id_seq OWNED BY public.fin_asaas_parcela.id;

ALTER TABLE ONLY public.fin_asaas_parcela ALTER COLUMN id SET DEFAULT nextval('public.fin_asaas_parcela_id_seq'::regclass);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_asaas_parcela_pkey') THEN
        ALTER TABLE ONLY public.fin_asaas_parcela
            ADD CONSTRAINT fin_asaas_parcela_pkey PRIMARY KEY (id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'fin_asaas_parcela_id_idx') THEN
        CREATE INDEX fin_asaas_parcela_id_idx ON public.fin_asaas_parcela USING btree (id);
    END IF;
END
$$;

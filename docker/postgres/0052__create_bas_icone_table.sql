-- 0052__create_bas_icone_table.sql
-- Create table for storing Font Awesome icons from IconesUtil

CREATE TABLE IF NOT EXISTS public.bas_icone (
    id BIGINT NOT NULL,
    classe VARCHAR(255) NOT NULL,
    icone VARCHAR(255) NOT NULL,
    versao VARCHAR(10) NOT NULL,
    search TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bas_icone_pkey PRIMARY KEY (id),
    CONSTRAINT bas_icone_classe_versao_unique UNIQUE (classe, versao)
);

ALTER TABLE public.bas_icone OWNER TO postgres;

CREATE SEQUENCE IF NOT EXISTS public.bas_icone_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.bas_icone_id_seq OWNER TO postgres;

ALTER SEQUENCE public.bas_icone_id_seq OWNED BY public.bas_icone.id;

ALTER TABLE ONLY public.bas_icone ALTER COLUMN id SET DEFAULT nextval('public.bas_icone_id_seq'::regclass);

-- Index for faster searches
CREATE INDEX IF NOT EXISTS idx_bas_icone_classe ON public.bas_icone(classe);
CREATE INDEX IF NOT EXISTS idx_bas_icone_versao ON public.bas_icone(versao);
CREATE INDEX IF NOT EXISTS idx_bas_icone_search ON public.bas_icone USING gin(to_tsvector('portuguese', coalesce(search, '')));

COMMENT ON TABLE public.bas_icone IS 'Tabela de ícones Font Awesome (4.x, 5.x, 6.x) para uso em menus e módulos';
COMMENT ON COLUMN public.bas_icone.classe IS 'Classe CSS do ícone (ex: fa fa-home, fas fa-home, fa-solid fa-house)';
COMMENT ON COLUMN public.bas_icone.icone IS 'Nome do ícone para exibição';
COMMENT ON COLUMN public.bas_icone.versao IS 'Versão do Font Awesome: 4.x, 5.x, 6.x';
COMMENT ON COLUMN public.bas_icone.search IS 'Termos de busca para encontrar o ícone';
-- V104: Vinculos do ValorProduto (unidade / curso-curriculo / forma-pagamento)
-- Cria as tabelas de ligacao usadas pela tela /view/valorProduto/formValorProduto:
--   fin_valor_produto_unidade (valor produto x bas_unidade)
--   fin_valor_produto_curso (valor produto x edc_curriculo)
--   fin_valor_produto_forma_pagamento (valor produto x fin_forma_pagamento)
-- Idempotente.

CREATE TABLE IF NOT EXISTS public.fin_valor_produto_unidade (
    id_valor_produto integer NOT NULL,
    id_unidade integer NOT NULL,
    CONSTRAINT fin_valor_produto_unidade_pkey PRIMARY KEY (id_valor_produto, id_unidade)
);

CREATE TABLE IF NOT EXISTS public.fin_valor_produto_curso (
    id_valor_produto integer NOT NULL,
    id_curriculo integer NOT NULL,
    CONSTRAINT fin_valor_produto_curso_pkey PRIMARY KEY (id_valor_produto, id_curriculo)
);

CREATE TABLE IF NOT EXISTS public.fin_valor_produto_forma_pagamento (
    id_valor_produto integer NOT NULL,
    id_forma_pagamento integer NOT NULL,
    CONSTRAINT fin_valor_produto_forma_pagamento_pkey PRIMARY KEY (id_valor_produto, id_forma_pagamento)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_valor_produto_unidade_id_valor_fkey') THEN
        ALTER TABLE ONLY public.fin_valor_produto_unidade
            ADD CONSTRAINT fin_valor_produto_unidade_id_valor_fkey FOREIGN KEY (id_valor_produto) REFERENCES public.fin_valor_produto(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_valor_produto_unidade_id_unidade_fkey') THEN
        ALTER TABLE ONLY public.fin_valor_produto_unidade
            ADD CONSTRAINT fin_valor_produto_unidade_id_unidade_fkey FOREIGN KEY (id_unidade) REFERENCES public.bas_unidade(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_valor_produto_curso_id_valor_fkey') THEN
        ALTER TABLE ONLY public.fin_valor_produto_curso
            ADD CONSTRAINT fin_valor_produto_curso_id_valor_fkey FOREIGN KEY (id_valor_produto) REFERENCES public.fin_valor_produto(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_valor_produto_curso_id_curriculo_fkey') THEN
        ALTER TABLE ONLY public.fin_valor_produto_curso
            ADD CONSTRAINT fin_valor_produto_curso_id_curriculo_fkey FOREIGN KEY (id_curriculo) REFERENCES public.edc_curriculo(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_valor_produto_forma_id_valor_fkey') THEN
        ALTER TABLE ONLY public.fin_valor_produto_forma_pagamento
            ADD CONSTRAINT fin_valor_produto_forma_id_valor_fkey FOREIGN KEY (id_valor_produto) REFERENCES public.fin_valor_produto(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_valor_produto_forma_id_forma_fkey') THEN
        ALTER TABLE ONLY public.fin_valor_produto_forma_pagamento
            ADD CONSTRAINT fin_valor_produto_forma_id_forma_fkey FOREIGN KEY (id_forma_pagamento) REFERENCES public.fin_forma_pagamento(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS fin_valor_produto_unidade_unidade_idx ON public.fin_valor_produto_unidade USING btree (id_unidade);
CREATE INDEX IF NOT EXISTS fin_valor_produto_curso_curriculo_idx ON public.fin_valor_produto_curso USING btree (id_curriculo);
CREATE INDEX IF NOT EXISTS fin_valor_produto_forma_forma_idx ON public.fin_valor_produto_forma_pagamento USING btree (id_forma_pagamento);

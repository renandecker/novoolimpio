-- V56: Remove a tela "/view/tipoPagamento/listTipoPagamento" (Formas de Pagamento /
-- Manutencao de Dias Pagamento) e seus componentes (formTipoPagamento,
-- colunasTipoPagamento) do menu (bas_modulo) e de todas as referencias.
-- Idempotente: pode rodar mais de uma vez sem erro.

-- Coleta os ids dos modulos de TipoPagamento (outcome legado com ou sem
-- .xhtml, e outcome ja convertido para rota React).
CREATE TEMP TABLE tmp_tipo_pagamento AS
SELECT id FROM public.bas_modulo
WHERE lower(outcome) LIKE '%/view/tipopagamento/%'
   OR lower(outcome) LIKE '%/view/tipopagamento';

-- 1) Desvincula modulos filhos que apontem para os modulos removidos.
UPDATE public.bas_modulo
SET id_modulo = NULL
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

-- 2) Remove as permissoes dos perfis sobre os modulos (bas_perfil_modulo).
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

-- 3) Remove favoritos e status que apontem para os modulos.
DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

DELETE FROM public.bas_status_modulo
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

-- 4) Limpa o id_modulo padrao dos perfis (bas_perfil) que aponte para eles.
UPDATE public.bas_perfil
SET id_modulo = NULL
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

-- 5) Remove os modulos.
DELETE FROM public.bas_modulo
WHERE id IN (SELECT id FROM tmp_tipo_pagamento);

DROP TABLE tmp_tipo_pagamento;

-- V62: Remove a tela "/view/tipoPagamento/listTipoPagamento" e componentes do menu/permissões
-- Idempotente: pode rodar mais de uma vez sem erro.

BEGIN;

CREATE TEMP TABLE tmp_tipo_pagamento AS
SELECT id FROM public.bas_modulo
WHERE lower(outcome) LIKE '%/view/tipopagamento/%'
   OR lower(outcome) LIKE '%/view/tipopagamento';

-- 1) Desvincula módulos filhos que apontem para os módulos removidos.
UPDATE public.bas_modulo
SET id_modulo = NULL
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

-- 2) Remove as permissões dos perfis sobre os módulos (bas_perfil_modulo).
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

-- 3) Remove favoritos e status que apontem para os módulos.
DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

DELETE FROM public.bas_status_modulo
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

-- 4) Limpa o id_modulo padrão dos perfis (bas_perfil) que aponte para eles.
UPDATE public.bas_perfil
SET id_modulo = NULL
WHERE id_modulo IN (SELECT id FROM tmp_tipo_pagamento);

-- 5) Remove os módulos.
DELETE FROM public.bas_modulo
WHERE id IN (SELECT id FROM tmp_tipo_pagamento);

DROP TABLE tmp_tipo_pagamento;

COMMIT;

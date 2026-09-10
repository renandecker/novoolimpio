-- V64: Remove os módulos "Módulo" e "Pacote" do menu e do sistema, e adiciona o novo Módulo no mesmo local que "Perfil".
-- Idempotente.

-- 1) Coleta os ids dos módulos "Módulo" e "Pacote" e seus descendentes.
CREATE TEMP TABLE tmp_modulo_pacote AS
WITH RECURSIVE arvore AS (
    SELECT id FROM public.bas_modulo
    WHERE lower(rotulo) IN ('módulo', 'modulo', 'pacote')
       OR lower(outcome) LIKE '%/modulo/%'
       OR lower(outcome) LIKE '%/pacote/%'
    UNION
    SELECT m.id FROM public.bas_modulo m
    JOIN arvore a ON m.id_modulo = a.id
)
SELECT id FROM arvore;

-- Desvincula filhos
UPDATE public.bas_modulo
SET id_modulo = NULL
WHERE id_modulo IN (SELECT id FROM tmp_modulo_pacote);

-- Remove permissões
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (SELECT id FROM tmp_modulo_pacote);

-- Remove favoritos e status
DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (SELECT id FROM tmp_modulo_pacote);

DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (SELECT id FROM tmp_modulo_pacote);

DELETE FROM public.bas_status_modulo
WHERE id_modulo IN (SELECT id FROM tmp_modulo_pacote);

UPDATE public.bas_perfil
SET id_modulo = NULL
WHERE id_modulo IN (SELECT id FROM tmp_modulo_pacote);

-- Remove módulos
DELETE FROM public.bas_modulo
WHERE id IN (SELECT id FROM tmp_modulo_pacote);

DROP TABLE tmp_modulo_pacote;

-- 2) Adiciona o novo Módulo no mesmo pai (antecessor) onde "Perfil" está localizado.
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), p.id_modulo, 'Módulo', 'Gerenciamento de módulos do sistema', '📦', '/view/modulo/listModulo', 'Gerenciamento de módulos e permissões', 
       COALESCE((SELECT MAX(ordem) FROM public.bas_modulo WHERE id_modulo = p.id_modulo), 0) + 1
FROM public.bas_modulo p
WHERE lower(p.rotulo) = 'perfil'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_modulo m
      WHERE m.outcome = '/view/modulo/listModulo'
         OR lower(m.rotulo) = 'módulo'
         OR lower(m.rotulo) = 'modulo'
  )
LIMIT 1;

-- 3) Concede acesso ao perfil Administrador.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, novo, editar, remover, relatorio, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.outcome = '/view/modulo/listModulo'
WHERE upper(trim(p.hierarquia)) = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

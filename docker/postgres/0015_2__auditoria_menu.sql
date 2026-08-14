-- V15: Aponta o menu Auditoria (bas_modulo) para a nova tela React de auditoria
-- e garante a permissao do perfil Administrador. Idempotente.

-- 1) Reaproveita os modulos legados "Auditoria" (id 200) e "Auditoria historico" (id 242),
--    apontando ambos para a tela com abas (matricula / oferecimentos).
UPDATE public.bas_modulo
SET outcome = '/auditoria'
WHERE id IN (200, 242)
  AND outcome IS DISTINCT FROM '/auditoria';

-- 2) Garante que o perfil Administrador acesse os modulos de auditoria.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE lower(p.descricao) = 'administrador'
  AND m.id IN (200, 242)
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

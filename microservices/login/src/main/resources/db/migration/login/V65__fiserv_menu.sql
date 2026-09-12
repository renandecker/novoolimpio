-- V65: Registra o menu do microservico Fiserv (bas_modulo) e da acesso ao perfil
-- Administrador. Idempotente (roda depois do restore do olimpio.sql a cada start).

-- 1) Remove eventuais registros anteriores do menu Fiserv para evitar duplicidade.
--    Ordem importa (FK bas_modulo_id_modulo_fkey): vinculos de perfil, filhos e por fim o raiz.
DELETE FROM public.bas_perfil_modulo WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE rotulo IN ('Fiserv', 'Cartões Fiserv')
       OR id_modulo IN (SELECT id FROM public.bas_modulo WHERE rotulo = 'Fiserv' AND id_modulo IS NULL)
);
DELETE FROM public.bas_modulo WHERE id_modulo IS NOT NULL AND (
    rotulo IN ('Cartões Fiserv')
    OR id_modulo IN (SELECT id FROM public.bas_modulo WHERE rotulo = 'Fiserv' AND id_modulo IS NULL)
);
DELETE FROM public.bas_modulo WHERE rotulo = 'Fiserv' AND id_modulo IS NULL;

-- 2) Cria o modulo raiz Fiserv.
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), NULL, 'Fiserv', 'Integração com a Fiserv Commerce Hub', '💳', '/view/fiserv/cartao-pessoa', 'Cartões cadastrados via Fiserv (bin, sufixo, cliente).', 310;

-- 3) Cria a tela filha (Cartões Fiserv).
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'), pai.id, 'Cartões Fiserv', 'Cartões cadastrados via Fiserv', '💳', '/view/fiserv/cartao-pessoa', 'Lista os cartões tokenizados na Fiserv (bin, sufixo, CPF/CNPJ, titular).', 1
FROM public.bas_modulo pai WHERE pai.rotulo = 'Fiserv' AND pai.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE rotulo = 'Cartões Fiserv');

-- 4) Concede ao perfil Administrador acesso aos novos modulos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE lower(p.descricao) = 'administrador'
  AND m.rotulo IN ('Fiserv', 'Cartões Fiserv')
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );
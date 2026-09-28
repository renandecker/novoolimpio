-- V99__remove_bid_biblioteca.sql
-- Conserto consolidado da biblioteca. Roda DEPOIS de toda a cadeia V89-V98 e
-- nao depende de nenhuma coluna que nao exista no schema real.
--
-- Schema real (ver V1__base.sql):
--   public.bas_perfil -> id, descricao, hierarquia, id_modulo, exibir_*, ...
--                        NAO tem rotulo nem fl_ativo. O "rotulo" do perfil e descricao.
--   public.bas_modulo -> id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem
--
-- Este script e idempotente: pode rodar quantas vezes quiser, em qualquer ordem,
-- e nao quebra se algum modulo/perfil de biblioteca nao existir.

-- Garante o perfil Biblioteca (id automatico pela sequence)
INSERT INTO public.bas_perfil (descricao, hierarquia)
SELECT 'Biblioteca', 'BIBLIOTECA'
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil WHERE descricao = 'Biblioteca');


-- Limpeza defensiva: remove vinculos de perfil-modulo que ficaram orfaos
-- (modulo ou perfil que nao existem mais). Isso evita erro de FK em telas
-- de seguranca/perfis e mantem o estado coerente mesmo se o dump mudou.
DELETE FROM public.bas_perfil_modulo pm
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil p WHERE p.id = pm.id_perfil)
   OR NOT EXISTS (SELECT 1 FROM public.bas_modulo m WHERE m.id = pm.id_modulo);

DELETE FROM public.bas_usuario_perfil up
WHERE NOT EXISTS (SELECT 1 FROM public.bas_usuario u WHERE u.id = up.id_usuario)
   OR NOT EXISTS (SELECT 1 FROM public.bas_perfil p WHERE p.id = up.id_perfil);

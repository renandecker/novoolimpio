-- V96__provision_admin_biblioteca_profile.sql
-- Garantir que o usuário admin tenha o perfil "Biblioteca" além do Admin
--
-- Schema real de public.bas_perfil (ver V1__base.sql):
--   id, descricao, hierarquia, id_modulo, exibir_favoritos, ajustar_favoritos,
--   exibir_foto, exibir_senha, exibir_menu, comunicar
-- Nao existem as colunas rotulo nem fl_ativo nessa tabela. O "rotulo" do perfil
-- e a coluna descricao.

-- 1. Vincular todos os módulos de biblioteca ao perfil Admin (id=1)
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo)
SELECT 1, m.id, TRUE, TRUE, TRUE, TRUE
FROM public.bas_modulo m
WHERE m.rotulo IN (
    'Biblioteca', 'Acervo Físico', 'Obras / Títulos', 'Exemplares',
    'Circulação', 'Empréstimos', 'Reservas', 'Multas',
    'Biblioteca Virtual', 'Livros Digitais', 'Licenças de Acervo', 
    'Empréstimos Digitais', 'Fila de Espera Virtual', 'Provedores Digitais'
)
ON CONFLICT (id_perfil, id_modulo) DO UPDATE SET
    editar = EXCLUDED.editar,
    remover = EXCLUDED.remover,
    relatorio = EXCLUDED.relatorio,
    novo = EXCLUDED.novo;

-- 2. Vincular perfil Biblioteca ao usuario admin (se existir o perfil e o usuario)
INSERT INTO public.bas_usuario_perfil (id_usuario, id_perfil)
SELECT u.id, p.id
FROM public.bas_usuario u
CROSS JOIN public.bas_perfil p
WHERE u.login = 'admin'
  AND p.descricao = 'Biblioteca'
  AND NOT EXISTS (
    SELECT 1 FROM public.bas_usuario_perfil up 
    WHERE up.id_usuario = u.id AND up.id_perfil = p.id
  );

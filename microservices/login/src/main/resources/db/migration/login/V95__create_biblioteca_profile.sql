-- V95__create_biblioteca_profile.sql
-- Cria perfil de Biblioteca com acessos aos módulos de biblioteca física e virtual
--
-- Schema real de public.bas_perfil (ver V1__base.sql):
--   id, descricao, hierarquia, id_modulo, exibir_favoritos, ajustar_favoritos,
--   exibir_foto, exibir_senha, exibir_menu, comunicar
-- Nao existem as colunas rotulo nem fl_ativo nessa tabela.

-- Inserir perfil Biblioteca (descricao = rotulo do perfil)
INSERT INTO public.bas_perfil (descricao, hierarquia)
SELECT 'Biblioteca', 'BIBLIOTECA'
WHERE NOT EXISTS (SELECT 1 FROM public.bas_perfil WHERE descricao = 'Biblioteca');

-- Vincular módulos ao perfil Biblioteca
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE
FROM public.bas_perfil p
CROSS JOIN public.bas_modulo m
WHERE p.descricao = 'Biblioteca'
  AND m.rotulo IN (
    'Biblioteca', 'Acervo Físico', 'Obras / Títulos', 'Exemplares',
    'Circulação', 'Empréstimos', 'Reservas', 'Multas',
    'Biblioteca Virtual', 'Livros Digitais', 'Licenças de Acervo', 
    'Empréstimos Digitais', 'Fila de Espera Virtual', 'Provedores Digitais',
    'Relatórios Biblioteca'
)
ON CONFLICT (id_perfil, id_modulo) DO UPDATE SET
    editar = EXCLUDED.editar,
    remover = EXCLUDED.remover,
    relatorio = EXCLUDED.relatorio,
    novo = EXCLUDED.novo;

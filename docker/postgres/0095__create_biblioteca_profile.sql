-- V95__create_biblioteca_profile.sql
-- Cria perfil de Biblioteca com acessos aos módulos de biblioteca física e virtual

-- Inserir perfil Biblioteca
INSERT INTO bas_perfil (descricao, hierarquia, exibir_favoritos, ajustar_favoritos, exibir_foto, exibir_senha, exibir_menu, comunicar)
SELECT 'Biblioteca', 'OPERACIONAL', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM bas_perfil WHERE descricao = 'Biblioteca');

-- Vincular módulos ao perfil Biblioteca
INSERT INTO bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE
FROM bas_perfil p
CROSS JOIN bas_modulo m
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
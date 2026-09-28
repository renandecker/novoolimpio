-- V96__provision_admin_biblioteca_profile.sql
-- Garantir que o usuário admin tenha o perfil "Biblioteca" além do Admin

-- 1. Garantir que o perfil Admin (id=1) existe
INSERT INTO bas_perfil (id, rotulo, descricao, fl_ativo)
VALUES (1, 'Admin', 'Administrador do sistema', TRUE)
ON CONFLICT (id) DO UPDATE SET fl_ativo = TRUE;

-- 2. Garantir que o perfil Biblioteca existe
INSERT INTO bas_perfil (rotulo, descricao, fl_ativo)
SELECT 'Biblioteca', 'Perfil para gestão completa da biblioteca (física e virtual)', TRUE
WHERE NOT EXISTS (SELECT 1 FROM bas_perfil WHERE rotulo = 'Biblioteca');

-- 3. Vincular todos os módulos de biblioteca ao perfil Admin (id=1)
INSERT INTO bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo)
SELECT 1, m.id, TRUE, TRUE, TRUE, TRUE
FROM bas_modulo m
WHERE m.rotulo IN (
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

-- 4. Vincular perfil Biblioteca ao admin user (se existir usuário admin)
INSERT INTO bas_usuario_perfil (id_usuario, id_perfil)
SELECT u.id, p.id
FROM bas_usuario u
CROSS JOIN bas_perfil p
WHERE u.login = 'admin'
  AND p.rotulo = 'Biblioteca'
  AND NOT EXISTS (
    SELECT 1 FROM bas_usuario_perfil up 
    WHERE up.id_usuario = u.id AND up.id_perfil = p.id
  );
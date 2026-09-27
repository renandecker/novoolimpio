-- V92__create_biblioteca_menu.sql
-- Criação dos menus do módulo Biblioteca no sistema
-- Nao depende de ids fixos: cada id e gerado pela sequencia e os pais sao
-- resolvidos por rotulo com LIMIT 1, para funcionar em backups diferentes
-- (mesmos rotulos, ids distintos). A guarda de cada INSERT e por rotulo,
-- tornando o script idempotente.

-- Menu principal Biblioteca
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Biblioteca', 'Gestão de Acervo e Empréstimos', 'book-open', 'Módulo de gestão da biblioteca física e virtual', '/view/biblioteca', 90, TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Biblioteca');

-- Submenu: Acervo Físico (filho de Biblioteca)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Acervo Físico', 'Gestão de obras e exemplares físicos', 'book', 'Cadastro e consulta de livros físicos', '/view/biblioteca/acervo-fisico', 10, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Acervo Físico')
LIMIT 1;

-- Obras (Títulos) (filho de Acervo Físico)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Obras / Títulos', 'Cadastro de obras/títulos do acervo', 'file-text', 'Gerenciar obras: título, autor, ISBN, editora, etc.', '/view/biblioteca/obra/list', 10, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Acervo Físico'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Obras / Títulos')
LIMIT 1;

-- Exemplares (filho de Acervo Físico)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Exemplares', 'Gestão de exemplares físicos', 'copy', 'Controlar exemplares: código de barras, tombo, localização, condição', '/view/biblioteca/exemplar/list', 20, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Acervo Físico'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Exemplares')
LIMIT 1;

-- Submenu: Circulação (filho de Biblioteca)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Circulação', 'Empréstimos, devoluções e reservas', 'repeat', 'Processos de empréstimo, devolução e reserva de exemplares', '/view/biblioteca/circulacao', 20, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Circulação')
LIMIT 1;

-- Empréstimos (filho de Circulação)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Empréstimos', 'Registro de empréstimos e devoluções', 'send', 'Realizar empréstimos, devoluções e renovações', '/view/biblioteca/emprestimo/list', 10, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Circulação'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Empréstimos')
LIMIT 1;

-- Reservas (filho de Circulação)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Reservas', 'Fila de espera para exemplares ocupados', 'clock', 'Gerenciar reservas e fila de espera', '/view/biblioteca/reserva/list', 20, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Circulação'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Reservas')
LIMIT 1;

-- Multas (filho de Circulação)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Multas', 'Gestão de multas por atraso, dano ou perda', 'alert-triangle', 'Visualizar e gerenciar multas e pagamentos', '/view/biblioteca/multa/list', 30, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Circulação'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Multas')
LIMIT 1;

-- Submenu: Biblioteca Virtual (filho de Biblioteca)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Biblioteca Virtual', 'Acervo digital e empréstimos online', 'globe', 'Gestão de livros digitais, licenças e empréstimos virtuais', '/view/biblioteca-virtual', 30, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Biblioteca Virtual')
LIMIT 1;

-- Livros Digitais (filho de Biblioteca Virtual)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Livros Digitais', 'Cadastro de obras digitais', 'book-open', 'Gerenciar livros digitais: formatos, arquivos, DRM, preview', '/view/biblioteca-virtual/livro-digital/list', 10, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Livros Digitais')
LIMIT 1;

-- Licenças de Acervo (filho de Biblioteca Virtual)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Licenças de Acervo', 'Gestão de licenças de uso digital', 'key', 'Controlar licenças: modelo, quantidade, vigência, uso', '/view/biblioteca-virtual/licenca/list', 20, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Licenças de Acervo')
LIMIT 1;

-- Empréstimos Digitais (filho de Biblioteca Virtual)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Empréstimos Digitais', 'Acesso e empréstimo de livros digitais', 'download-cloud', 'Monitorar empréstimos digitais ativos, expirados, progresso de leitura', '/view/biblioteca-virtual/emprestimo-digital/list', 30, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Empréstimos Digitais')
LIMIT 1;

-- Fila de Espera Digital (filho de Biblioteca Virtual)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Fila de Espera Virtual', 'Fila para livros digitais com licença limitada', 'users', 'Gerenciar fila de espera e notificações automáticas', '/view/biblioteca-virtual/fila-espera/list', 40, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Fila de Espera Virtual')
LIMIT 1;

-- Provedores Digitais (filho de Biblioteca Virtual)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Provedores Digitais', 'Editoras e plataformas de conteúdo digital integrado', 'server', 'Gerenciar provedores: Minha Biblioteca, Pearson, Árvore, etc.', '/view/biblioteca-virtual/provedor/list', 50, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Provedores Digitais')
LIMIT 1;

-- Relatórios da Biblioteca (filho de Biblioteca)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT nextval('bas_modulo_id_seq'), 'Relatórios Biblioteca', 'Relatórios e estatísticas da biblioteca', 'bar-chart', 'Relatórios de acervo, circulação, multas e uso digital', '/view/biblioteca/relatorios', 40, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Relatórios Biblioteca')
LIMIT 1;

-- Garante que a sequencia nunca gere um id ja usado.
SELECT setval('bas_modulo_id_seq', GREATEST((SELECT COALESCE(MAX(id), 0) FROM bas_modulo), 1), true);

-- Vincular menus ao perfil Administrador (por descricao)
INSERT INTO bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('bas_perfil_modulo_id_seq')
FROM bas_perfil p
JOIN bas_modulo m ON m.rotulo IN (
    'Biblioteca', 'Acervo Físico', 'Obras / Títulos', 'Exemplares',
    'Circulação', 'Empréstimos', 'Reservas', 'Multas',
    'Biblioteca Virtual', 'Livros Digitais', 'Licenças de Acervo',
    'Empréstimos Digitais', 'Fila de Espera Virtual', 'Provedores Digitais',
    'Relatórios Biblioteca'
)
WHERE lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

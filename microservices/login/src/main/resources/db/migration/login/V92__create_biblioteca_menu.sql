-- V92__create_biblioteca_menu.sql
-- Criação dos menus do módulo Biblioteca no sistema
-- Usa colunas corretas da tabela bas_modulo: id (PK serial), id_modulo (parent FK), rotulo, descricao, icone, outcome, ajuda, ordem, fl_ativo

-- Menu principal Biblioteca
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Biblioteca', 'Gestão de Acervo e Empréstimos', 'book-open', 'Módulo de gestão da biblioteca física e virtual', '/view/biblioteca', 90, TRUE, NULL
WHERE NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Biblioteca');

-- Submenu: Acervo Físico (filho de Biblioteca)
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Acervo Físico', 'Gestão de obras e exemplares físicos', 'book', 'Cadastro e consulta de livros físicos', '/view/biblioteca/acervo-fisico', 10, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Acervo Físico');

-- Obras (Títulos)
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Obras / Títulos', 'Cadastro de obras/títulos do acervo', 'file-text', 'Gerenciar obras: título, autor, ISBN, editora, etc.', '/view/biblioteca-fisica/obra/list', 10, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Acervo Físico'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Obras / Títulos');

-- Exemplares
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Exemplares', 'Gestão de exemplares físicos', 'copy', 'Controlar exemplares: código de barras, tombo, localização, condição', '/view/biblioteca-fisica/exemplar/list', 20, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Acervo Físico'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Exemplares');

-- Submenu: Circulação
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Circulação', 'Empréstimos, devoluções e reservas', 'repeat', 'Processos de empréstimo, devolução e reserva de exemplares', '/view/biblioteca/circulacao', 20, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Circulação');

-- Empréstimos
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Empréstimos', 'Registro de empréstimos e devoluções', 'send', 'Realizar empréstimos, devoluções e renovações', '/view/biblioteca-fisica/emprestimo/list', 10, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Circulação'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Empréstimos');

-- Reservas
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Reservas', 'Fila de espera para exemplares ocupados', 'clock', 'Gerenciar reservas e fila de espera', '/view/biblioteca-fisica/reserva/list', 20, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Circulação'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Reservas');

-- Multas
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Multas', 'Gestão de multas por atraso, dano ou perda', 'alert-triangle', 'Visualizar e gerenciar multas e pagamentos', '/view/biblioteca-fisica/multa/list', 30, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Circulação'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Multas');

-- Submenu: Biblioteca Virtual
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Biblioteca Virtual', 'Acervo digital e empréstimos online', 'globe', 'Gestão de livros digitais, licenças e empréstimos virtuais', '/view/biblioteca-virtual', 30, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Biblioteca Virtual');

-- Livros Digitais
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Livros Digitais', 'Cadastro de obras digitais', 'book-open', 'Gerenciar livros digitais: formatos, arquivos, DRM, preview', '/view/biblioteca-virtual/livro-digital/list', 10, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Livros Digitais');

-- Licenças de Acervo
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Licenças de Acervo', 'Gestão de licenças de uso digital', 'key', 'Controlar licenças: modelo, quantidade, vigência, uso', '/view/biblioteca-virtual/licenca/list', 20, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Licenças de Acervo');

-- Empréstimos Digitais
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Empréstimos Digitais', 'Acesso e empréstimo de livros digitais', 'download-cloud', 'Monitorar empréstimos digitais ativos, expirados, progresso de leitura', '/view/biblioteca-virtual/emprestimo-digital/list', 30, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Empréstimos Digitais');

-- Fila de Espera Digital
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Fila de Espera Virtual', 'Fila para livros digitais com licença limitada', 'users', 'Gerenciar fila de espera e notificações automáticas', '/view/biblioteca-virtual/fila-espera/list', 40, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Fila de Espera Virtual');

-- Provedores Digitais
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Provedores Digitais', 'Editoras e plataformas de conteúdo digital integrado', 'server', 'Gerenciar provedores: Minha Biblioteca, Pearson, Árvore, etc.', '/view/biblioteca-virtual/provedor/list', 50, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Provedores Digitais');

-- Relatórios da Biblioteca
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo, id_modulo)
SELECT 'Relatórios Biblioteca', 'Relatórios e estatísticas da biblioteca', 'bar-chart', 'Relatórios de acervo, circulação, multas e uso digital', '/view/biblioteca/relatorios', 40, TRUE, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Relatórios Biblioteca');

-- Vincular menus ao perfil ADMIN (id = 1)
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
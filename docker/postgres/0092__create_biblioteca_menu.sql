-- V92__create_biblioteca_menu.sql
-- Criação dos menus do módulo Biblioteca no sistema

-- Menu principal Biblioteca
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (900, 'Biblioteca', 'Gestão de Acervo e Empréstimos', 'book-open', 'Módulo de gestão da biblioteca física e virtual', '/view/biblioteca', 90, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Submenu: Acervo Físico
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (901, 'Acervo Físico', 'Gestão de obras e exemplares físicos', 'book', 'Cadastro e consulta de livros físicos', '/view/biblioteca/acervo-fisico', 10, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Obras (Títulos)
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (902, 'Obras / Títulos', 'Cadastro de obras/títulos do acervo', 'file-text', 'Gerenciar obras: título, autor, ISBN, editora, etc.', '/view/biblioteca/obra/list', 10, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Exemplares
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (903, 'Exemplares', 'Gestão de exemplares físicos', 'copy', 'Controlar exemplares: código de barras, tombo, localização, condição', '/view/biblioteca/exemplar/list', 20, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Submenu: Circulação
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (910, 'Circulação', 'Empréstimos, devoluções e reservas', 'repeat', 'Processos de empréstimo, devolução e reserva de exemplares', '/view/biblioteca/circulacao', 20, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Empréstimos
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (911, 'Empréstimos', 'Registro de empréstimos e devoluções', 'send', 'Realizar empréstimos, devoluções e renovações', '/view/biblioteca/emprestimo/list', 10, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Reservas
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (912, 'Reservas', 'Fila de espera para exemplares ocupados', 'clock', 'Gerenciar reservas e fila de espera', '/view/biblioteca/reserva/list', 20, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Multas
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (913, 'Multas', 'Gestão de multas por atraso, dano ou perda', 'alert-triangle', 'Visualizar e gerenciar multas e pagamentos', '/view/biblioteca/multa/list', 30, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Submenu: Biblioteca Virtual
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (920, 'Biblioteca Virtual', 'Acervo digital e empréstimos online', 'globe', 'Gestão de livros digitais, licenças e empréstimos virtuais', '/view/biblioteca-virtual', 30, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Livros Digitais
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (921, 'Livros Digitais', 'Cadastro de obras digitais', 'book-open', 'Gerenciar livros digitais: formatos, arquivos, DRM, preview', '/view/biblioteca-virtual/livro-digital/list', 10, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Licenças de Acervo
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (922, 'Licenças de Acervo', 'Gestão de licenças de uso digital', 'key', 'Controlar licenças: modelo, quantidade, vigência, uso', '/view/biblioteca-virtual/licenca/list', 20, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Empréstimos Digitais
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (923, 'Empréstimos Digitais', 'Acesso e empréstimo de livros digitais', 'download-cloud', 'Monitorar empréstimos digitais ativos, expirados, progresso de leitura', '/view/biblioteca-virtual/emprestimo-digital/list', 30, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Fila de Espera Digital
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (924, 'Fila de Espera Virtual', 'Fila para livros digitais com licença limitada', 'users', 'Gerenciar fila de espera e notificações automáticas', '/view/biblioteca-virtual/fila-espera/list', 40, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Provedores Digitais
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (925, 'Provedores Digitais', 'Editoras e plataformas de conteúdo digital integrado', 'server', 'Gerenciar provedores: Minha Biblioteca, Pearson, Árvore, etc.', '/view/biblioteca-virtual/provedor/list', 50, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Relatórios da Biblioteca
INSERT INTO bas_modulo (id, rotulo, descricao, icone, ajuda, outcome, ordem, fl_ativo)
VALUES (930, 'Relatórios Biblioteca', 'Relatórios e estatísticas da biblioteca', 'bar-chart', 'Relatórios de acervo, circulação, multas e uso digital', '/view/biblioteca/relatorios', 40, TRUE)
ON CONFLICT (id) DO UPDATE SET
    rotulo = EXCLUDED.rotulo,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    ajuda = EXCLUDED.ajuda,
    outcome = EXCLUDED.outcome,
    ordem = EXCLUDED.ordem,
    fl_ativo = EXCLUDED.fl_ativo;

-- Vincular menus ao perfil ADMIN (id = 1)
-- Note: The backup schema uses id_perfil and id_modulo columns instead of perfil_id and modulo_id
INSERT INTO bas_perfil_modulo (id_perfil, id_modulo) VALUES
(1, 900), (1, 901), (1, 902), (1, 903),
(1, 910), (1, 911), (1, 912), (1, 913),
(1, 920), (1, 921), (1, 922), (1, 923), (1, 924), (1, 925),
(1, 930)
ON CONFLICT (id_perfil, id_modulo) DO NOTHING;
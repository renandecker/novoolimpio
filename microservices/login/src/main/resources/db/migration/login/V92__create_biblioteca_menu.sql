-- V92__create_biblioteca_menu.sql
-- Criação dos menus do módulo Biblioteca no sistema (acervo físico + biblioteca virtual)
-- Usa colunas corretas da tabela bas_modulo: id (PK com default bas_modulo_id_seq),
-- id_modulo (auto-FK), rotulo, descricao, icone, outcome, ajuda, ordem
-- Nao grava fl_ativo: a coluna so e criada pela V101__add_fl_ativo_bas_modulo.sql,
-- que roda DEPOIS desta migration; usa-la aqui abortaria o startup do login.
-- O campo `icone` recebe a CLASSE CSS do Font Awesome 4.x existente em bas_icone (ex: 'fa fa-book').
-- Motivo: o front (web-react/src/shared/hooks/useIcones.tsx) só renderiza <i className="...">
-- quando o valor começa com 'fa '/'fas '/'far '/'fab ' ou contem 'fa-'; qualquer outro texto
-- (ex: 'book-open') e exibido cru, e nao vira icone.

-- Menu principal Biblioteca
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Biblioteca', 'Gestão de Acervo e Empréstimos', 'fa fa-university', 'Módulo de gestão da biblioteca física e virtual', NULL, 90, NULL
WHERE NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Biblioteca');

-- Submenu: Acervo Físico (filho de Biblioteca)
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Acervo Físico', 'Gestão de obras e exemplares físicos', 'fa fa-archive', 'Cadastro e consulta de livros físicos', NULL, 10, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Acervo Físico');

-- Obras (Títulos)
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Obras / Títulos', 'Cadastro de obras/títulos do acervo', 'fa fa-book', 'Gerenciar obras: título, autor, ISBN, editora, etc.', '/view/biblioteca-fisica/obra/list', 10, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Acervo Físico'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Obras / Títulos');

-- Exemplares
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Exemplares', 'Gestão de exemplares físicos', 'fa fa-files-o', 'Controlar exemplares: código de barras, tombo, localização, condição', '/view/biblioteca-fisica/exemplar/list', 20, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Acervo Físico'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Exemplares');

-- Submenu: Circulação
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Circulação', 'Empréstimos, devoluções e reservas', 'fa fa-exchange', 'Processos de empréstimo, devolução e reserva de exemplares', NULL, 20, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Circulação');

-- Empréstimos
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Empréstimos', 'Registro de empréstimos e devoluções', 'fa fa-sign-out', 'Realizar empréstimos, devoluções e renovações', '/view/biblioteca-fisica/emprestimo/list', 10, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Circulação'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Empréstimos');

-- Reservas
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Reservas', 'Fila de espera para exemplares ocupados', 'fa fa-clock-o', 'Gerenciar reservas e fila de espera', '/view/biblioteca-fisica/reserva/list', 20, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Circulação'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Reservas');

-- Multas
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Multas', 'Gestão de multas por atraso, dano ou perda', 'fa fa-money', 'Visualizar e gerenciar multas e pagamentos', '/view/biblioteca-fisica/multa/list', 30, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Circulação'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Multas');

-- Submenu: Biblioteca Virtual
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Biblioteca Virtual', 'Acervo digital e empréstimos online', 'fa fa-globe', 'Gestão de livros digitais, licenças e empréstimos virtuais', NULL, 30, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca'
  AND m.id_modulo IS NULL
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Biblioteca Virtual');

-- Livros Digitais
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Livros Digitais', 'Cadastro de obras digitais', 'fa fa-laptop', 'Gerenciar livros digitais: formatos, arquivos, DRM, preview', '/view/biblioteca-virtual/livro-digital/list', 10, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Livros Digitais');

-- Licenças de Acervo
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Licenças de Acervo', 'Gestão de licenças de uso digital', 'fa fa-key', 'Controlar licenças: modelo, quantidade, vigência, uso', '/view/biblioteca-virtual/licenca/list', 20, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Licenças de Acervo');

-- Empréstimos Digitais
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Empréstimos Digitais', 'Acesso e empréstimo de livros digitais', 'fa fa-cloud-download', 'Monitorar empréstimos digitais ativos, expirados, progresso de leitura', '/view/biblioteca-virtual/emprestimo-digital/list', 30, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Empréstimos Digitais');

-- Fila de Espera Digital
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Fila de Espera Virtual', 'Fila para livros digitais com licença limitada', 'fa fa-users', 'Gerenciar fila de espera e notificações automáticas', '/view/biblioteca-virtual/fila-espera/list', 40, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Fila de Espera Virtual');

-- Provedores Digitais
INSERT INTO bas_modulo (rotulo, descricao, icone, ajuda, outcome, ordem, id_modulo)
SELECT 'Provedores Digitais', 'Editoras e plataformas de conteúdo digital integrado', 'fa fa-server', 'Gerenciar provedores: Minha Biblioteca, Pearson, Árvore, etc.', '/view/biblioteca-virtual/provedor/list', 50, m.id
FROM bas_modulo m
WHERE m.rotulo = 'Biblioteca Virtual'
  AND NOT EXISTS (SELECT 1 FROM bas_modulo WHERE rotulo = 'Provedores Digitais');

-- "Relatorios Biblioteca" NAO e criado aqui: nao existe controller de relatorios nos
-- microsservicos biblioteca/biblioteca-virtual, e um item de menu sem outcome cai no
-- catch-all do front ("Selecione uma tela."). Se um dia houver a tela, basta inserir
-- o modulo com outcome '/view/biblioteca/relatorios'.
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE rotulo = 'Relatórios Biblioteca'
      AND (outcome IS NULL OR outcome NOT LIKE '/view/biblioteca/relatorios%')
);
DELETE FROM public.bas_modulo
WHERE rotulo = 'Relatórios Biblioteca'
  AND (outcome IS NULL OR outcome NOT LIKE '/view/biblioteca/relatorios%');

-- Grupos (sem tela propria) ficam so como expansor: outcome NULL, como o grupo
-- "Acesso do Aluno" no V97. Sem isso o clique cai no catch-all "Selecione uma tela.".
UPDATE public.bas_modulo SET outcome = NULL WHERE rotulo IN ('Biblioteca', 'Acervo Físico', 'Circulação', 'Biblioteca Virtual') AND (outcome IS NOT NULL AND btrim(outcome) <> '');

-- Normaliza os ícones já gravados por execuções anteriores desta migration ou por
-- seeds antigos: qualquer valor sem prefixo de classe Font Awesome vira a classe correta.
UPDATE public.bas_modulo SET icone = 'fa fa-university'   WHERE rotulo = 'Biblioteca'              AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-archive'      WHERE rotulo = 'Acervo Físico'           AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-book'         WHERE rotulo = 'Obras / Títulos'         AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-files-o'      WHERE rotulo = 'Exemplares'              AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-exchange'     WHERE rotulo = 'Circulação'              AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-sign-out'     WHERE rotulo = 'Empréstimos'             AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-clock-o'      WHERE rotulo = 'Reservas'                AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-money'        WHERE rotulo = 'Multas'                  AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-globe'        WHERE rotulo = 'Biblioteca Virtual'      AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-laptop'       WHERE rotulo = 'Livros Digitais'         AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-key'          WHERE rotulo = 'Licenças de Acervo'      AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-cloud-download' WHERE rotulo = 'Empréstimos Digitais'  AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-users'        WHERE rotulo = 'Fila de Espera Virtual'  AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');
UPDATE public.bas_modulo SET icone = 'fa fa-server'       WHERE rotulo = 'Provedores Digitais'    AND (icone IS NULL OR btrim(icone) = '' OR icone NOT LIKE 'fa %');

-- Vincula menus ao perfil ADMIN (id = 1)
INSERT INTO bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo)
SELECT 1, m.id, TRUE, TRUE, TRUE, TRUE
FROM bas_modulo m
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
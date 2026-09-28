-- V88__remove_bid_biblioteca.sql
-- Remove o legado da biblioteca do PERFIL (bas_perfil) e do MODULO (bas_modulo).
-- Base de referencia: V1__base.sql.
--
-- O que conta como "biblioteca" neste script:
--   1) o texto "biblioteca" em rotulo, descricao, outcome ou ajuda;
--   2) identificadores com prefixo "bid_" ou "bib_" (ex.: /view/bid_biblioteca);
--   3) os rotulos inequivocos de acervo que nao carregam a palavra "biblioteca"
--      (Acervo Fisico, Obras / Titulos, Exemplares, Livros Digitais, ...);
--   4) toda a arvore de filhos de qualquer modulo acima (bas_modulo.id_modulo).
-- Os rotulos genericos da biblioteca (Emprestimos, Reservas, Multas, Circulacao)
-- nao sao alvos isolados: eles so sao apagados quando a arvore os alcanca a
-- partir da raiz "Biblioteca", o que evita apagar modulos homonimos que
-- pertencam a outros modulos do sistema.
--
-- O script e idempotente: em um banco ja limpo nenhum DELETE encontra linhas.
-- Ele tambem serve de rede de seguranca para backups antigos, que ainda carregam
-- esses menus, ja que a criacao da biblioteca roda em arquivos separados.

-- Alvos. Temporarias para nao repetir a arvore recursiva em cada comando.
-- Sem ON COMMIT DROP de proposito: o script roda tanto na transacao unica do
-- Flyway quanto em autocommit do psql (uma sessao so).
CREATE TEMP TABLE bid_modulo_alvo (id integer PRIMARY KEY);
CREATE TEMP TABLE bid_perfil_alvo (id integer PRIMARY KEY);

-- ---------------------------------------------------------------------------
-- 1) Modulos de biblioteca, incluindo todos os descendentes.
--    UNION (e nao UNION ALL) porque alem de deduplicar, protege a recursao de
--    ciclo caso o backup tenha arvore malformada.
-- ---------------------------------------------------------------------------
INSERT INTO bid_modulo_alvo (id)
WITH RECURSIVE arvore (id) AS (
    SELECT m.id
    FROM public.bas_modulo m
    WHERE lower(coalesce(m.rotulo,    '')) ~ 'biblioteca'
       OR lower(coalesce(m.descricao, '')) ~ 'biblioteca'
       OR lower(coalesce(m.outcome,   '')) ~ 'biblioteca'
       OR lower(coalesce(m.ajuda,     '')) ~ 'biblioteca'
       OR lower(coalesce(m.rotulo,    '')) ~ '(^|[/_.-])(bid|bib)_'
       OR lower(coalesce(m.descricao, '')) ~ '(^|[/_.-])(bid|bib)_'
       OR lower(coalesce(m.outcome,   '')) ~ '(^|[/_.-])(bid|bib)_'
       -- Acervo: nomes que nao dizem "biblioteca" mas so existem para ela.
       -- Sem acento de proposito, para nao depender do client_encoding do psql.
       OR lower(trim(coalesce(m.rotulo, ''))) LIKE 'acervo%'
       OR lower(trim(coalesce(m.rotulo, ''))) LIKE 'obras%'
       OR lower(trim(coalesce(m.rotulo, ''))) LIKE 'exemplares'
       OR lower(trim(coalesce(m.rotulo, ''))) LIKE 'livro%digital%'
       OR lower(trim(coalesce(m.rotulo, ''))) LIKE 'licen%acervo'
       OR lower(trim(coalesce(m.rotulo, ''))) LIKE 'provedores%digitais'
       OR lower(trim(coalesce(m.rotulo, ''))) LIKE 'fila de espera%'
       OR lower(trim(coalesce(m.rotulo, ''))) LIKE 'empr%digital%'
    UNION
    SELECT f.id
    FROM public.bas_modulo f
    JOIN arvore p ON f.id_modulo = p.id
)
SELECT id FROM arvore;

-- ---------------------------------------------------------------------------
-- 2) Perfis de biblioteca. bas_perfil nao tem arvore, entao a leitura e direta.
--    bas_perfil.id_modulo (a tela inicial do perfil) e tratado no passo 5.-- ---------------------------------------------------------------------------
INSERT INTO bid_perfil_alvo (id)
SELECT p.id
FROM public.bas_perfil p
WHERE lower(coalesce(p.descricao, '')) ~ 'biblioteca'
   OR lower(coalesce(p.hierarquia, '')) ~ 'biblioteca'
   OR lower(coalesce(p.descricao, '')) ~ '(^|[/_.-])(bid|bib)_'
   OR lower(coalesce(p.hierarquia, '')) ~ '(^|[/_.-])(bid|bib)_'
   OR lower(trim(coalesce(p.descricao, ''))) LIKE 'perfil%acervo'
   OR lower(trim(coalesce(p.descricao, ''))) LIKE 'acervo%'
   OR lower(trim(coalesce(p.descricao, ''))) LIKE 'bibliotecario'
   OR lower(trim(coalesce(p.descricao, ''))) LIKE 'bibliotecaria';

-- ---------------------------------------------------------------------------
-- 3) Filhos navegacionais: linhas que so existem para linkar perfil e modulo.
--    Aqui o certo e apagar, nao anular.
--    A lista passa por to_regclass porque o conjunto de tabelas varia entre
--    dumps: por exemplo, bas_comunicacao_perfil existe em V1__base.sql mas nao
--    no dump de producao restaurado pelo docker.
-- ---------------------------------------------------------------------------
DO $DO$
DECLARE
    nav record;
BEGIN
    FOR nav IN
        SELECT * FROM (VALUES
            ('bas_perfil_modulo',      'id_perfil', 'id_modulo'),
            ('bas_favorito_perfil',    'id_perfil', 'id_modulo'),
            ('bas_favorito_usuario',   NULL,        'id_modulo'),
            ('bas_status_modulo',      NULL,        'id_modulo'),
            ('bas_comunicacao_perfil', 'id_perfil',  NULL),
            ('bas_status_compromisso', 'id_perfil',  NULL)
        ) AS t (tabela, col_perfil, col_modulo)
    LOOP
        IF to_regclass('public.' || nav.tabela) IS NULL THEN
            RAISE NOTICE '006: public.% nao existe neste banco, ignorado', nav.tabela;
            CONTINUE;
        END IF;

        IF nav.col_perfil IS NOT NULL THEN
            EXECUTE format('DELETE FROM public.%I WHERE %I IN (SELECT id FROM bid_perfil_alvo)',
                           nav.tabela, nav.col_perfil);
        END IF;

        IF nav.col_modulo IS NOT NULL THEN
            EXECUTE format('DELETE FROM public.%I WHERE %I IN (SELECT id FROM bid_modulo_alvo)',
                           nav.tabela, nav.col_modulo);
        END IF;
    END LOOP;
END
$DO$;

-- ---------------------------------------------------------------------------
-- 4) Redes de seguranca das chaves estrangeiras.
--    Ha dezenas de tabelas genericas com id_perfil / id_modulo (rel_filtro,
--    rel_dashboard, fin_forma_pagamento, edc_taxa_curso, ...). Anular a coluna
--    e o caminho que nao apaga dado de negocio de outro modulo: o perfil de
--    biblioteca vai sumir e a linha continua existindo sem o vinculo. O catalogo
--    e lido em vez de enumerar as tabelas, porque cada backup tem um conjunto
--    diferente delas.
--    O alvo e escolhido pelo con.confrelid: comparar bas_modulo.id_modulo com
--    um id de perfil desfaria a arvore de menus de forma silenciosa.
-- ---------------------------------------------------------------------------
DO $DO$
DECLARE
    r     record;
    n     bigint;
    alvos integer[];
BEGIN
    FOR r IN
        SELECT con.conrelid            AS relid,
               c.relname                AS tabela,
               a.attname                AS coluna,
               con.confrelid = 'public.bas_perfil'::regclass AS aponta_para_perfil
        FROM pg_constraint con
        JOIN pg_class     c  ON c.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = c.relnamespace
        JOIN pg_attribute a  ON a.attrelid = con.conrelid
                            AND a.attnum = con.conkey[1]
        WHERE con.contype = 'f'
          AND con.confrelid IN ('public.bas_perfil'::regclass, 'public.bas_modulo'::regclass)
          AND array_length(con.conkey, 1) = 1
          AND ns.nspname = 'public'
          AND c.relname NOT LIKE '%\_aud'
          -- bas_perfil/bas_modulo e a arvore sao tratadas a parte, abaixo.
          AND c.relname NOT IN ('bas_perfil', 'bas_modulo')
          -- Ja tratadas no passo 3.
          AND c.relname NOT IN ('bas_perfil_modulo', 'bas_favorito_perfil', 'bas_favorito_usuario',
                                'bas_status_modulo', 'bas_comunicacao_perfil', 'bas_status_compromisso')
        ORDER BY c.relname, a.attname
    LOOP
        alvos := CASE WHEN r.aponta_para_perfil
                      THEN (SELECT coalesce(array_agg(id), '{}'::integer[]) FROM bid_perfil_alvo)
                      ELSE (SELECT coalesce(array_agg(id), '{}'::integer[]) FROM bid_modulo_alvo)
                 END;
        CONTINUE WHEN cardinality(alvos) = 0;

        EXECUTE format('SELECT count(*) FROM public.%I WHERE %I = ANY ($1)', r.tabela, r.coluna)
            INTO n USING alvos;
        CONTINUE WHEN n = 0;

        -- Coluna NOT NULL nao pode ser anulada: nesse caso a linha e removida.
        IF EXISTS (SELECT 1 FROM pg_attribute
                   WHERE attrelid = r.relid AND attname = r.coluna AND attnotnull) THEN
            EXECUTE format('DELETE FROM public.%I WHERE %I = ANY ($1)', r.tabela, r.coluna) USING alvos;
        ELSE
            EXECUTE format('UPDATE public.%I SET %I = NULL WHERE %I = ANY ($1)',
                           r.tabela, r.coluna, r.coluna) USING alvos;
        END IF;

        RAISE NOTICE '006: public.% desvinculado de % (% linha(s))',
                     r.tabela,
                     CASE WHEN r.aponta_para_perfil THEN 'perfil' ELSE 'modulo' END,
                     n;
    END LOOP;
END
$DO$;

-- ---------------------------------------------------------------------------
-- 5) bas_perfil.id_modulo e bas_modulo.id_modulo apontam para modulos que serao
--    apagados no passo 6. Sem isto a FK barraria o DELETE.
--    O UPDATE de bas_perfil vale para todos os perfis, inclusive os que serao
--    removidos: eles somem no passo 6 de qualquer forma. Filtrar aqui os perfis
--    ja alvos era o que deixava a FK do perfil de biblioteca barrando o
--    DELETE FROM bas_modulo.
--    A recursao do passo 1 ja pegou todo descendente de modulo, entao a
--    segunda linha e so garantia para arvore malformada no backup.
-- ---------------------------------------------------------------------------
UPDATE public.bas_perfil
SET id_modulo = NULL
WHERE id_modulo IN (SELECT id FROM bid_modulo_alvo);

UPDATE public.bas_modulo
SET id_modulo = NULL
WHERE id NOT IN (SELECT id FROM bid_modulo_alvo)
  AND id_modulo IN (SELECT id FROM bid_modulo_alvo);

-- ---------------------------------------------------------------------------
-- 6) Alvos. O perfil vai antes do modulo: bas_perfil.id_modulo e a unica FK
--    que ainda pode apontar para um modulo alvo, e ela e do proprio perfil.
-- ---------------------------------------------------------------------------
DELETE FROM public.bas_perfil
WHERE id IN (SELECT id FROM bid_perfil_alvo);

DELETE FROM public.bas_modulo
WHERE id IN (SELECT id FROM bid_modulo_alvo);

DROP TABLE bid_modulo_alvo;
DROP TABLE bid_perfil_alvo;

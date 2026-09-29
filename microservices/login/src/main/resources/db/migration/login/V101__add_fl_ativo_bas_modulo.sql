-- V101__add_fl_ativo_bas_modulo.sql
-- Cria public.bas_modulo.fl_ativo, coluna exigida pelo servico basico e ausente
-- no banco.
--
-- Sintoma
-- --------
-- GET /api/basico/modulo/menu respondia 500 e o sidebar do React recebia lista
-- vazia, para TODOS os usuarios (inclusive admin), logo apos o login:
--
--   ERROR: column m1_0.fl_ativo does not exist (42703)
--   select m1_0.id, m1_0.ajuda, m1_0.id_modulo, m1_0.descricao, m1_0.fl_ativo,
--          m1_0.icone, m1_0.ordem, m1_0.outcome, m1_0.rotulo from bas_modulo m1_0
--
-- Causa
-- -----
-- A entidade br.com.sol7.olimpio.basico.modulo.entity.Modulo (Modulo.java:26)
-- mapeia @Column(name = "fl_ativo"), mas a coluna nunca existiu em bas_modulo.
-- O dump original (V1__base.sql) define apenas: id, id_modulo, rotulo, descricao,
-- icone, outcome, ajuda, ordem. Como o repositorio usa listAll() (select por
-- entidade, nao por lista explicita de colunas), o Hibernate sempre inclui
-- m1_0.fl_ativo no SELECT e a query quebra.
-- A V78 ja tinha encontrado o mesmo problema e contornou o INSERT de um modulo
-- para nao gravar a coluna -- o workaround evitou a migration quebrar, mas
-- deixou a entidade do basico desalinhada do schema.
--
-- Esta e a solucao definitiva: a coluna passa a existir, com default TRUE para
-- que os 231 modulos ja gravados continuem aparecendo no menu. Um modulo
-- desativado deixa de ser servido, e nenhum modulo e desativado por padrao.
--
-- Idempotente: ADD COLUMN IF NOT EXISTS, e o UPDATE abaixo so toca linhas cujo
-- fl_ativo ficou nulo (o que nao ocorre com o DEFAULT, mas cobre bancos onde a
-- coluna ja existia sem default).

ALTER TABLE public.bas_modulo
    ADD COLUMN IF NOT EXISTS fl_ativo boolean DEFAULT TRUE;

-- Garante que nenhum modulo fique invisivel por nulidade.
UPDATE public.bas_modulo
SET fl_ativo = TRUE
WHERE fl_ativo IS NULL;

-- Utilizado pelos filtros de listagem do modulo (icones, auditoria do menu).
DO $DO$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes
                   WHERE schemaname = 'public'
                     AND indexname = 'idx_bas_modulo_fl_ativo') THEN
        CREATE INDEX idx_bas_modulo_fl_ativo ON public.bas_modulo (fl_ativo);
    END IF;
END
$DO$;

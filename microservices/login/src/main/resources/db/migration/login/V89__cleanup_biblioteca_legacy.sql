-- V89__cleanup_biblioteca_legacy.sql
-- Remove dados legados de biblioteca antes de criar novos módulos/tabelas
-- Executa ANTES dos scripts V90-V96
--
-- Schema real (ver V1__base.sql):
--   public.bas_modulo  -> id, id_modulo (auto-FK), rotulo, descricao, icone, outcome, ajuda, ordem
--                         NAO tem fl_ativo; TEM rotulo
--   public.bas_perfil  -> id, descricao, hierarquia, id_modulo, exibir_*, ...
--                         NAO tem rotulo nem fl_ativo; o "rotulo" do perfil e descricao
--
-- bas_modulo tem auto-referencia (bas_modulo_id_modulo_fkey). Remover so os
-- rotulos listados deixaria os filhos orfaos e estouraria o FK, entao a arvore
-- inteira e deletada em um unico statement (o FK e avaliado no fim do statement).

-- 1. Remover vinculos perfil-modulo legados de biblioteca (inclui subarvore)
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    WITH RECURSIVE arvore AS (
        SELECT m.id
        FROM public.bas_modulo m
        WHERE m.rotulo IN (
            'Biblioteca', 'Acervo Físico', 'Obras / Títulos', 'Exemplares',
            'Circulação', 'Empréstimos', 'Reservas', 'Multas',
            'Biblioteca Virtual', 'Livros Digitais', 'Licenças de Acervo', 
            'Empréstimos Digitais', 'Fila de Espera Virtual', 'Provedores Digitais',
            'Relatórios Biblioteca'
        )
        UNION ALL
        SELECT m.id
        FROM public.bas_modulo m
        JOIN arvore p ON m.id_modulo = p.id
    )
    SELECT id FROM arvore
);

-- 2. Remover modulos legados de biblioteca (arvore completa, filhos inclusos)
DELETE FROM public.bas_modulo
WHERE id IN (
    WITH RECURSIVE arvore AS (
        SELECT m.id
        FROM public.bas_modulo m
        WHERE m.rotulo IN (
            'Biblioteca', 'Acervo Físico', 'Obras / Títulos', 'Exemplares',
            'Circulação', 'Empréstimos', 'Reservas', 'Multas',
            'Biblioteca Virtual', 'Livros Digitais', 'Licenças de Acervo', 
            'Empréstimos Digitais', 'Fila de Espera Virtual', 'Provedores Digitais',
            'Relatórios Biblioteca'
        )
        UNION ALL
        SELECT m.id
        FROM public.bas_modulo m
        JOIN arvore p ON m.id_modulo = p.id
    )
    SELECT id FROM arvore
);

-- 3. Remover vinculos usuario-perfil do perfil Biblioteca legado
--    (o FK bas_usuario_perfil_id_perfil_fkey impede apagar o perfil com usuario linked)
DELETE FROM public.bas_usuario_perfil up
USING public.bas_perfil p
WHERE up.id_perfil = p.id
  AND p.descricao = 'Biblioteca';

-- 4. Remover perfil Biblioteca legado
--    bas_perfil nao tem coluna rotulo: o rotulo do perfil e a coluna descricao.
DELETE FROM public.bas_perfil
WHERE descricao = 'Biblioteca';

-- 5. Dropar tabelas bib_* legadas (se existirem).
--    O dump pode ja trazer tabelas bib_* de uma geracao antiga (bib_reserva,
--    bib_livro, ... com auditoria _aud). Elas sao removidas aqui para o V90
--    recriar exatamente o schema que o microsservico `biblioteca` mapeia
--    (bib_obra, bib_exemplar, bib_emprestimo, bib_multa, bib_reserva).
DROP TABLE IF EXISTS bib_fila_espera_digital CASCADE;
DROP TABLE IF EXISTS bib_emprestimo_digital CASCADE;
DROP TABLE IF EXISTS bib_licenca_acervo CASCADE;
DROP TABLE IF EXISTS bib_livro_digital_formatos CASCADE;
DROP TABLE IF EXISTS bib_livro_digital CASCADE;
DROP TABLE IF EXISTS bib_provedor_digital CASCADE;
DROP TABLE IF EXISTS bib_multa CASCADE;
DROP TABLE IF EXISTS bib_emprestimo CASCADE;
DROP TABLE IF EXISTS bib_reserva CASCADE;
DROP TABLE IF EXISTS bib_exemplar CASCADE;
DROP TABLE IF EXISTS bib_obra CASCADE;

-- 6. Remover sequences legadas se existirem
DROP SEQUENCE IF EXISTS bib_obra_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bib_exemplar_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bib_reserva_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bib_emprestimo_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bib_multa_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bib_livro_digital_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bib_licenca_acervo_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bib_emprestimo_digital_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bib_fila_espera_digital_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bib_provedor_digital_id_seq CASCADE;

-- V89__cleanup_biblioteca_legacy.sql
-- Remove dados legados de biblioteca antes de criar novos módulos/tabelas
-- Executa ANTES dos scripts V90-V96

-- 1. Remover vínculos perfil-modulo legados de biblioteca
DELETE FROM bas_perfil_modulo 
WHERE id_modulo IN (
    SELECT id FROM bas_modulo 
    WHERE rotulo IN (
        'Biblioteca', 'Acervo Físico', 'Obras / Títulos', 'Exemplares',
        'Circulação', 'Empréstimos', 'Reservas', 'Multas',
        'Biblioteca Virtual', 'Livros Digitais', 'Licenças de Acervo', 
        'Empréstimos Digitais', 'Fila de Espera Virtual', 'Provedores Digitais',
        'Relatórios Biblioteca'
    )
);

-- 2. Remover módulos legados de biblioteca
DELETE FROM bas_modulo 
WHERE rotulo IN (
    'Biblioteca', 'Acervo Físico', 'Obras / Títulos', 'Exemplares',
    'Circulação', 'Empréstimos', 'Reservas', 'Multas',
    'Biblioteca Virtual', 'Livros Digitais', 'Licenças de Acervo', 
    'Empréstimos Digitais', 'Fila de Espera Virtual', 'Provedores Digitais',
    'Relatórios Biblioteca'
);

-- 3. Remover perfil Biblioteca legado
DELETE FROM bas_perfil 
WHERE rotulo = 'Biblioteca';

-- 4. Dropar tabelas bib_* legadas (se existirem)
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

-- 5. Remover sequences legadas se existirem
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
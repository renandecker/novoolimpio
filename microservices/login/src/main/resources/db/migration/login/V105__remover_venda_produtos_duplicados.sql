-- V105: Remove itens duplicados do menu "Venda Produtos" (mantém apenas um por outcome/rotulo)
-- Idempotente.

DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT m.id
    FROM public.bas_modulo m
    WHERE lower(m.rotulo) = 'venda produtos'
      AND m.id NOT IN (
          SELECT MIN(m2.id)
          FROM public.bas_modulo m2
          WHERE lower(m2.rotulo) = 'venda produtos'
      )
);

DELETE FROM public.bas_modulo
WHERE lower(rotulo) = 'venda produtos'
  AND id NOT IN (
      SELECT MIN(m2.id)
      FROM public.bas_modulo m2
      WHERE lower(m2.rotulo) = 'venda produtos'
  );

-- V11: Move o módulo "Recriar calendário acadêmico" para dentro do menu "Acadêmico".
UPDATE public.bas_modulo
SET id_modulo = (SELECT id FROM public.bas_modulo WHERE rotulo = 'Acadêmico' AND id_modulo IS NULL LIMIT 1)
WHERE rotulo = 'Recriar calendário acadêmico'
  AND id_modulo IS NULL;

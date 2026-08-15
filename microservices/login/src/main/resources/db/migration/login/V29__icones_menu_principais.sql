-- V29: Ajusta os icones dos grupos principais do menu (Administração, Básico,
-- Comercial, Acadêmico) para emojis coerentes com o nome, usados diretamente
-- pelos menus React (web e mobile) quando bas_modulo.icone não começa com
-- "ui-icon" ou "fa ". Idempotente (roda após o restore do olimpio.sql).

-- Administração -> engrenagem (configuração/administração).
UPDATE public.bas_modulo
SET icone = '⚙️'
WHERE id_modulo IS NULL
  AND lower(rotulo) = 'administração';

-- Básico -> prancheta (dados/cadastros básicos).
UPDATE public.bas_modulo
SET icone = '📋'
WHERE id_modulo IS NULL
  AND lower(rotulo) = 'básico';

-- Comercial -> carrinho de compras.
UPDATE public.bas_modulo
SET icone = '🛒'
WHERE id_modulo IS NULL
  AND lower(rotulo) = 'comercial';

-- Acadêmico -> capelo (ensino).
UPDATE public.bas_modulo
SET icone = '🎓'
WHERE id_modulo IS NULL
  AND lower(rotulo) = 'acadêmico';

-- V10: Remove os modulos "Whatsapp" e "Telegram" (gestao de envio de redes sociais)
-- do menu (bas_modulo) e todas as referencias a eles. Idempotente.

-- 1) Remove as permissoes dos perfis sobre os modulos de redes sociais.
DELETE FROM public.bas_perfil_modulo
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/redesocial/listwhatsapp%'
       OR lower(outcome) LIKE '%/view/redesocial/formwhatsapp%'
       OR lower(outcome) LIKE '%/view/redesocial/listtelegram%'
       OR lower(rotulo) IN ('whatsapp', 'telegram')
);

-- 2) Remove os favoritos de perfil que apontem para esses modulos.
DELETE FROM public.bas_favorito_perfil
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/redesocial/listwhatsapp%'
       OR lower(outcome) LIKE '%/view/redesocial/formwhatsapp%'
       OR lower(outcome) LIKE '%/view/redesocial/listtelegram%'
       OR lower(rotulo) IN ('whatsapp', 'telegram')
);

-- 3) Remove os favoritos de usuario que apontem para esses modulos.
DELETE FROM public.bas_favorito_usuario
WHERE id_modulo IN (
    SELECT id FROM public.bas_modulo
    WHERE lower(outcome) LIKE '%/view/redesocial/listwhatsapp%'
       OR lower(outcome) LIKE '%/view/redesocial/formwhatsapp%'
       OR lower(outcome) LIKE '%/view/redesocial/listtelegram%'
       OR lower(rotulo) IN ('whatsapp', 'telegram')
);

-- 4) Remove os proprios modulos do menu.
DELETE FROM public.bas_modulo
WHERE lower(outcome) LIKE '%/view/redesocial/listwhatsapp%'
   OR lower(outcome) LIKE '%/view/redesocial/formwhatsapp%'
   OR lower(outcome) LIKE '%/view/redesocial/listtelegram%'
   OR lower(rotulo) IN ('whatsapp', 'telegram');

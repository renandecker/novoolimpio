-- V14: Expande bas_temas com campos de posicao e novos temas (total ~30,
-- incluindo temas da biblioteca org.primefaces.themes) e adiciona ao menu
-- "Configurações" (Administração) os modulos "Ícones Disponíveis" e "Temas".
-- Idempotente: pode rodar mais de uma vez sem efeitos colaterais.

-- 1) Colunas de posicao em bas_temas.
ALTER TABLE public.bas_temas
    ADD COLUMN IF NOT EXISTS posicao_logo text,
    ADD COLUMN IF NOT EXISTS login_posicao text;

-- 2) Preenche posicao padrao nos temas ja cadastrados (V3).
UPDATE public.bas_temas
SET posicao_logo = COALESCE(posicao_logo, 'left'),
    login_posicao = COALESCE(login_posicao, 'center')
WHERE posicao_logo IS NULL OR login_posicao IS NULL;

-- 3) Novos temas ate ~30 registros (org.primefaces.themes + cores/posicoes).
INSERT INTO public.bas_temas
    (tema, titulo, folder_css, cor_primaria, cor_secundaria, cor_barra, cor_fundo, cor_texto, cor_borda, cor_destaque, cor_email, posicao_logo, login_posicao, fl_default, ativo)
VALUES
    ('dot-luv',          'Dot Luv',          'primefaces-dot-luv',          '#0b3e61', '#1e62a0', '#0b3e61', '#2b3644', '#f6f6f6', '#404c59', '#1e62a0', '#0b3e61', 'left',   'center', false, true),
    ('glass-x',          'Glass X',          'primefaces-glass-x',          '#2469a7', '#2f2f2f', '#2469a7', '#f2f2f2', '#222222', '#a8a8a8', '#2f2f2f', '#2469a7', 'left',   'center', false, true),
    ('home',             'Home',             'primefaces-home',             '#2e6da4', '#61a8cf', '#2e6da4', '#ffffff', '#333333', '#aecbe0', '#61a8cf', '#2e6da4', 'left',   'center', false, true),
    ('humanity',         'Humanity',         'primefaces-humanity',         '#cb842e', '#e0a34b', '#cb842e', '#ffffff', '#333333', '#d6c4a6', '#e0a34b', '#cb842e', 'left',   'center', false, true),
    ('midnight',         'Midnight',         'primefaces-midnight',         '#2e3f43', '#435e64', '#2e3f43', '#323f42', '#dddddd', '#4a5a5e', '#435e64', '#2e3f43', 'left',   'center', false, true),
    ('pepper-grinder',   'Pepper Grinder',   'primefaces-pepper-grinder',   '#65532e', '#8a6b32', '#65532e', '#ffffff', '#453821', '#b8a980', '#8a6b32', '#65532e', 'left',   'center', false, true),
    ('rocket',           'Rocket',           'primefaces-rocket',           '#4d4d4d', '#6eb1f7', '#4d4d4d', '#ffffff', '#333333', '#999999', '#6eb1f7', '#4d4d4d', 'left',   'center', false, true),
    ('sam',              'Sam',              'primefaces-sam',              '#3a6ea5', '#6ca6d6', '#3a6ea5', '#ffffff', '#333333', '#a7bfd4', '#6ca6d6', '#3a6ea5', 'left',   'center', false, true),
    ('smoothness',       'Smoothness',       'primefaces-smoothness',       '#222222', '#6699cc', '#222222', '#ffffff', '#222222', '#aaaaaa', '#6699cc', '#222222', 'left',   'center', false, true),
    ('ui-lightness',     'UI Lightness',     'primefaces-ui-lightness',     '#f6a828', '#0078ae', '#f6a828', '#f4f4f4', '#333333', '#aaaaaa', '#0078ae', '#f6a828', 'left',   'center', false, true)
ON CONFLICT (tema) DO NOTHING;

-- 4) Modulo "Ícones Disponíveis" dentro de Administração > Configurações.
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Configurações' AND m.id_modulo = 25 LIMIT 1),
       'Ícones Disponíveis', 'Lista de ícones disponíveis no sistema', '✨', '/view/icones/listIcones', 'Exibe a lista de ícones disponíveis para uso nas telas e componentes do sistema.', 100
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE rotulo = 'Ícones Disponíveis');

-- 5) Modulo "Temas" dentro de Administração > Configurações.
INSERT INTO public.bas_modulo (id, id_modulo, rotulo, descricao, icone, outcome, ajuda, ordem)
SELECT nextval('public.bas_modulo_id_seq'),
       (SELECT m.id FROM public.bas_modulo m WHERE m.rotulo = 'Configurações' AND m.id_modulo = 25 LIMIT 1),
       'Temas', 'Cadastro de temas (cores e layout) do sistema', '🎨', '/view/tema/listTemas', 'Cadastro e gerenciamento de temas (cores e layout) do sistema.', 100
WHERE NOT EXISTS (SELECT 1 FROM public.bas_modulo WHERE rotulo = 'Temas');

-- 6) Concede ao perfil Administrador acesso aos novos modulos.
INSERT INTO public.bas_perfil_modulo (id_perfil, id_modulo, editar, remover, relatorio, novo, id)
SELECT p.id, m.id, TRUE, TRUE, TRUE, TRUE, nextval('public.bas_perfil_modulo_id_seq')
FROM public.bas_perfil p
JOIN public.bas_modulo m ON m.rotulo IN ('Ícones Disponíveis', 'Temas')
WHERE lower(p.descricao) = 'administrador'
  AND NOT EXISTS (
      SELECT 1 FROM public.bas_perfil_modulo pm
      WHERE pm.id_perfil = p.id AND pm.id_modulo = m.id
  );

-- Tabela de temas do sistema: define cores e layouts baseados nos temas da
-- biblioteca org.primefaces.themes (mesmos temas usados em bas_layout.tema).
CREATE TABLE IF NOT EXISTS bas_temas (
    id serial PRIMARY KEY,
    tema text NOT NULL,
    titulo text,
    id_layout integer REFERENCES bas_layout(id),
    folder_css text,
    cor_primaria text,
    cor_secundaria text,
    cor_barra text,
    cor_fundo text,
    cor_texto text,
    cor_borda text,
    cor_destaque text,
    cor_email text,
    fl_default boolean DEFAULT false,
    ativo boolean DEFAULT true,
    UNIQUE (tema)
);

-- Quando o banco e restaurado de um dump legado, bas_temas ja existe sem default
-- na coluna id (sem sequence). Garante o default para o INSERT abaixo funcionar.
DO $$
DECLARE
    seq_name text := 'bas_temas_id_seq';
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'bas_temas'
          AND column_name = 'id'
          AND column_default IS NULL
    ) THEN
        EXECUTE format('CREATE SEQUENCE IF NOT EXISTS public.%I', seq_name);
        EXECUTE format('ALTER TABLE public.bas_temas ALTER COLUMN id SET DEFAULT nextval(''public.%I'')', seq_name);
    END IF;
END $$;

INSERT INTO bas_temas
    (tema, titulo, folder_css, cor_primaria, cor_secundaria, cor_barra, cor_fundo, cor_texto, cor_borda, cor_destaque, cor_email, fl_default, ativo)
VALUES
    ('aristo',       'Aristo (Padrão)',     'primefaces-aristo',       '#0868b3', '#3baae3', '#88c0ff', '#ffffff', '#222222', '#c0c0c0', '#3baae3', '#052B4E', true,  true),
    ('afterdark',    'After Dark',          'primefaces-afterdark',    '#0f2431', '#ffa500', '#0f2431', '#e6e6e6', '#d8e2ea', '#0f2431', '#ffa500', '#0f2431', false, true),
    ('afterwork',    'After Work',          'primefaces-afterwork',    '#2d2d2d', '#6eb1f7', '#2d2d2d', '#f0f0f0', '#333333', '#a5a5a5', '#6eb1f7', '#2d2d2d', false, true),
    ('black-tie',    'Black Tie',           'primefaces-black-tie',    '#1f1f1f', '#cfb053', '#1f1f1f', '#ffffff', '#333333', '#d1d1d1', '#cfb053', '#1f1f1f', false, true),
    ('blitzer',      'Blitzer',             'primefaces-blitzer',      '#cc0000', '#e17009', '#cc0000', '#ffffff', '#333333', '#d1d1d1', '#e17009', '#cc0000', false, true),
    ('bluesky',      'Blue Sky',            'primefaces-bluesky',      '#0399d4', '#1e4d8b', '#0399d4', '#ffffff', '#333333', '#a8d8eb', '#1e4d8b', '#0399d4', false, true),
    ('bootstrap',    'Bootstrap',           'primefaces-bootstrap',    '#337ab7', '#23527c', '#337ab7', '#ffffff', '#333333', '#c9d8e5', '#286090', '#337ab7', false, true),
    ('casablanca',   'Casablanca',          'primefaces-casablanca',   '#f1c362', '#b89649', '#f1c362', '#ffffff', '#333333', '#e6dcc3', '#b89649', '#f1c362', false, true),
    ('cruze',        'Cruze',               'primefaces-cruze',        '#122b42', '#2e6da4', '#122b42', '#ffffff', '#333333', '#c0c0c0', '#2e6da4', '#122b42', false, true),
    ('cupertino',    'Cupertino',           'primefaces-cupertino',    '#3baae3', '#3c8fc4', '#3baae3', '#ffffff', '#333333', '#aed0ea', '#3c8fc4', '#3baae3', false, true),
    ('dark-hive',    'Dark Hive',           'primefaces-dark-hive',    '#3a3a3a', '#4ca300', '#3a3a3a', '#4a4a4a', '#ffffff', '#555555', '#4ca300', '#3a3a3a', false, true),
    ('delta',        'Delta',               'primefaces-delta',        '#00a7e1', '#0073ae', '#00a7e1', '#ffffff', '#333333', '#99cde6', '#0073ae', '#00a7e1', false, true),
    ('eggplant',     'Eggplant',            'primefaces-eggplant',     '#30261f', '#c47f17', '#30261f', '#ffffff', '#333333', '#cdc3a5', '#c47f17', '#30261f', false, true),
    ('excite-bike',  'Excite Bike',         'primefaces-excite-bike',  '#e88500', '#b26600', '#e88500', '#ffffff', '#333333', '#f0d2b8', '#b26600', '#e88500', false, true),
    ('flick',        'Flick',               'primefaces-flick',        '#0073ae', '#ffb200', '#0073ae', '#ffffff', '#333333', '#a0c6de', '#ffb200', '#0073ae', false, true),
    ('hot-sneaks',   'Hot Sneaks',          'primefaces-hot-sneaks',   '#e13c6d', '#d4c700', '#e13c6d', '#ffffff', '#333333', '#f0c1cd', '#d4c700', '#e13c6d', false, true),
    ('le-frog',      'Le Frog',             'primefaces-le-frog',      '#3e7500', '#6db13d', '#3e7500', '#ffffff', '#333333', '#c9e3a8', '#6db13d', '#3e7500', false, true),
    ('overcast',     'Overcast',            'primefaces-overcast',     '#c9c9c9', '#797979', '#c9c9c9', '#ffffff', '#333333', '#d1d1d1', '#797979', '#5c9ccc', false, true),
    ('redmond',      'Redmond',             'primefaces-redmond',      '#5c9ccc', '#3f7faf', '#5c9ccc', '#ffffff', '#333333', '#a6c9e2', '#3f7faf', '#5c9ccc', false, true),
    ('vader',        'Vader',               'primefaces-vader',        '#121212', '#404040', '#121212', '#303030', '#ffffff', '#555555', '#404040', '#121212', false, true),
    -- 20 Temas Elegantes - Paletas profissionais inspiradas em boas práticas de design
    ('minimalista-azul', 'Minimalista Azul', 'primefaces-minimalista-azul', '#1a73e8', '#5f6368', '#1a73e8', '#ffffff', '#202124', '#dadce0', '#5f6368', '#1a73e8', false, true),
    ('premium-ouro', 'Premium Ouro', 'primefaces-premium-ouro', '#d4a574', '#2c2c2c', '#d4a574', '#f5f5f5', '#2c2c2c', '#e8dcc8', '#2c2c2c', '#8b7355', false, true),
    ('moderno-sage', 'Moderno Verde Sage', 'primefaces-moderno-sage', '#6b8e71', '#c9d6c7', '#6b8e71', '#fcfbf7', '#2c3e2d', '#b8c4b1', '#c9d6c7', '#5a7660', false, true),
    ('corporativo-grafite', 'Corporativo Grafite', 'primefaces-corporativo-grafite', '#4a4a4a', '#00a8e8', '#4a4a4a', '#ffffff', '#3a3a3a', '#cccccc', '#00a8e8', '#2c2c2c', false, true),
    ('vibrante-coral', 'Vibrante Rosa Coral', 'primefaces-vibrante-coral', '#ff6b6b', '#ff8e72', '#ff6b6b', '#fff5f3', '#2d3436', '#ffe0d6', '#ff8e72', '#c1415e', false, true),
    ('luxo-roxo', 'Luxo Roxo Profundo', 'primefaces-luxo-roxo', '#6c4fa1', '#d6cfe2', '#6c4fa1', '#fafaf9', '#3d2d54', '#c9bdd6', '#d6cfe2', '#4a3669', false, true),
    ('elegante-marinho', 'Elegante Azul Marinho', 'primefaces-elegante-marinho', '#0f3460', '#e94560', '#0f3460', '#f5f5f5', '#ffffff', '#1a4d7a', '#e94560', '#0a1f35', false, true),
    ('natura-floresta', 'Natura Verde Floresta', 'primefaces-natura-floresta', '#2d5016', '#8bc34a', '#2d5016', '#f0f4e8', '#1a1a1a', '#7a9c59', '#8bc34a', '#1e3a0f', false, true),
    ('moderno-teal', 'Moderno Teal', 'primefaces-moderno-teal', '#008080', '#ffd700', '#008080', '#f0f8f8', '#1a1a1a', '#b3d9d9', '#ffd700', '#005555', false, true),
    ('premium-titanio', 'Premium Cinza Titânio', 'primefaces-premium-titanio', '#878787', '#a9d6e5', '#878787', '#f2f2f2', '#2b2b2b', '#d4d4d4', '#a9d6e5', '#595959', false, true),
    ('boutique-pessego', 'Boutique Rosa Pêssego', 'primefaces-boutique-pessego', '#ffb6a3', '#ffe5d9', '#ffb6a3', '#fffcf9', '#3d2817', '#ffd9c4', '#ffe5d9', '#d17a5a', false, true),
    ('sofisticado-chumbo', 'Sofisticado Cinza Chumbo', 'primefaces-sofisticado-chumbo', '#36454f', '#a8b8c8', '#36454f', '#f8f8f8', '#ffffff', '#6a7a8a', '#a8b8c8', '#202830', false, true),
    ('tropical-ceu', 'Tropical Azul Céu', 'primefaces-tropical-ceu', '#00bfff', '#ffa500', '#00bfff', '#fffaf0', '#1a1a1a', '#b3e5fc', '#ffa500', '#0088cc', false, true),
    ('classico-preto', 'Clássico Preto Elegante', 'primefaces-classico-preto', '#1a1a1a', '#d4af37', '#1a1a1a', '#ffffff', '#1a1a1a', '#e0e0e0', '#d4af37', '#0d0d0d', false, true),
    ('moderno-cobre', 'Moderno Cobre Quente', 'primefaces-moderno-cobre', '#b87333', '#e8dcc8', '#b87333', '#f9f5f0', '#3d2817', '#d9c4b3', '#e8dcc8', '#8b5a2b', false, true),
    ('tech-neon', 'Tech Azul Neon', 'primefaces-tech-neon', '#0ea5e9', '#1e293b', '#0ea5e9', '#0f172a', '#e2e8f0', '#334155', '#0ea5e9', '#0284c7', false, true),
    ('natural-areia', 'Natural Bege Areia', 'primefaces-natural-areia', '#c2b280', '#8b7355', '#c2b280', '#fefdfb', '#3d2817', '#d9cfc9', '#8b7355', '#9d8a6f', false, true),
    ('vibrante-magenta', 'Vibrante Magenta Profundo', 'primefaces-vibrante-magenta', '#c41e3a', '#ffd700', '#c41e3a', '#f5f5f0', '#1a1a1a', '#f0d9c8', '#ffd700', '#8b0a1a', false, true),
    ('corporativo-azul-prof', 'Corporativo Azul Profissional', 'primefaces-corporativo-azul-prof', '#003f7f', '#6ca6d4', '#003f7f', '#ffffff', '#2c2c2c', '#b8d4e8', '#6ca6d4', '#002060', false, true),
    ('minimalista-branco', 'Minimalista Branco Puro', 'primefaces-minimalista-branco', '#f5f5f5', '#666666', '#f5f5f5', '#ffffff', '#1a1a1a', '#e0e0e0', '#666666', '#cccccc', false, true)
ON CONFLICT (tema) DO NOTHING;

-- Inserção de 20 temas elegantes baseados em paletas de cores profissionais
-- Referência: https://www.hostinger.com/br/tutoriais/paletas-de-cores-para-sites/

INSERT INTO bas_temas
    (tema, titulo, folder_css, cor_primaria, cor_secundaria, cor_barra, cor_fundo, cor_texto, cor_texto_selecionado, cor_texto_nao_selecionado, cor_borda, cor_destaque, cor_email, espessura_borda, cor_borda_primaria, cor_borda_secundaria, posicao_logo, login_posicao, imagem_fundo, banner_cabecalho, banner_rodape, fl_default, ativo)
VALUES
    -- Tema 1: Minimalista Azul
    ('minimalista-azul', 'Minimalista Azul', 'primefaces-minimalista-azul', '#1a73e8', '#5f6368', '#1a73e8', '#ffffff', '#202124', '#ffffff', '#cccccc', '#dadce0', '#5f6368', '#1a73e8', '2px', '#1a73e8', '#5f6368', 'left', 'center', '', '', '', false, true),
    
    -- Tema 2: Premium Ouro
    ('premium-ouro', 'Premium Ouro', 'primefaces-premium-ouro', '#d4a574', '#2c2c2c', '#d4a574', '#f5f5f5', '#2c2c2c', '#ffffff', '#cccccc', '#e8dcc8', '#2c2c2c', '#8b7355', '3px', '#d4a574', '#2c2c2c', 'left', 'center', '', '', '', false, true),
    
    -- Tema 3: Moderno Verde Sage
    ('moderno-sage', 'Moderno Verde Sage', 'primefaces-moderno-sage', '#6b8e71', '#c9d6c7', '#6b8e71', '#fcfbf7', '#2c3e2d', '#ffffff', '#d0d0d0', '#b8c4b1', '#c9d6c7', '#5a7660', '2px', '#6b8e71', '#c9d6c7', 'left', 'center', '', '', '', false, true),
    
    -- Tema 4: Corporativo Grafite
    ('corporativo-grafite', 'Corporativo Grafite', 'primefaces-corporativo-grafite', '#4a4a4a', '#00a8e8', '#4a4a4a', '#ffffff', '#3a3a3a', '#ffffff', '#d0d0d0', '#cccccc', '#00a8e8', '#2c2c2c', '3px', '#4a4a4a', '#00a8e8', 'left', 'center', '', '', '', false, true),
    
    -- Tema 5: Vibrante Rosa Coral
    ('vibrante-coral', 'Vibrante Rosa Coral', 'primefaces-vibrante-coral', '#ff6b6b', '#ff8e72', '#ff6b6b', '#fff5f3', '#2d3436', '#ffffff', '#d0d0d0', '#ffe0d6', '#ff8e72', '#c1415e', '2px', '#ff6b6b', '#ff8e72', 'left', 'center', '', '', '', false, true),
    
    -- Tema 6: Luxo Roxo Profundo
    ('luxo-roxo', 'Luxo Roxo Profundo', 'primefaces-luxo-roxo', '#6c4fa1', '#d6cfe2', '#6c4fa1', '#fafaf9', '#3d2d54', '#ffffff', '#d0d0d0', '#c9bdd6', '#d6cfe2', '#4a3669', '3px', '#6c4fa1', '#d6cfe2', 'left', 'center', '', '', '', false, true),
    
    -- Tema 7: Elegante Azul Marinho
    ('elegante-marinho', 'Elegante Azul Marinho', 'primefaces-elegante-marinho', '#0f3460', '#e94560', '#0f3460', '#f5f5f5', '#ffffff', '#ffffff', '#cccccc', '#1a4d7a', '#e94560', '#0a1f35', '3px', '#0f3460', '#e94560', 'left', 'center', '', '', '', false, true),
    
    -- Tema 8: Natura Verde Floresta
    ('natura-floresta', 'Natura Verde Floresta', 'primefaces-natura-floresta', '#2d5016', '#8bc34a', '#2d5016', '#f0f4e8', '#1a1a1a', '#ffffff', '#d0d0d0', '#7a9c59', '#8bc34a', '#1e3a0f', '2px', '#2d5016', '#8bc34a', 'left', 'center', '', '', '', false, true),
    
    -- Tema 9: Moderno Teal
    ('moderno-teal', 'Moderno Teal', 'primefaces-moderno-teal', '#008080', '#ffd700', '#008080', '#f0f8f8', '#1a1a1a', '#ffffff', '#d0d0d0', '#b3d9d9', '#ffd700', '#005555', '2px', '#008080', '#ffd700', 'left', 'center', '', '', '', false, true),
    
    -- Tema 10: Premium Cinza Titânio
    ('premium-titanio', 'Premium Cinza Titânio', 'primefaces-premium-titanio', '#878787', '#a9d6e5', '#878787', '#f2f2f2', '#2b2b2b', '#ffffff', '#cccccc', '#d4d4d4', '#a9d6e5', '#595959', '3px', '#878787', '#a9d6e5', 'left', 'center', '', '', '', false, true),
    
    -- Tema 11: Boutique Rosa Pêssego
    ('boutique-pessego', 'Boutique Rosa Pêssego', 'primefaces-boutique-pessego', '#ffb6a3', '#ffe5d9', '#ffb6a3', '#fffcf9', '#3d2817', '#ffffff', '#d0d0d0', '#ffd9c4', '#ffe5d9', '#d17a5a', '2px', '#ffb6a3', '#ffe5d9', 'left', 'center', '', '', '', false, true),
    
    -- Tema 12: Sofisticado Cinza Chumbo
    ('sofisticado-chumbo', 'Sofisticado Cinza Chumbo', 'primefaces-sofisticado-chumbo', '#36454f', '#a8b8c8', '#36454f', '#f8f8f8', '#ffffff', '#ffffff', '#d0d0d0', '#6a7a8a', '#a8b8c8', '#202830', '3px', '#36454f', '#a8b8c8', 'left', 'center', '', '', '', false, true),
    
    -- Tema 13: Tropical Azul Céu
    ('tropical-ceu', 'Tropical Azul Céu', 'primefaces-tropical-ceu', '#00bfff', '#ffa500', '#00bfff', '#fffaf0', '#1a1a1a', '#ffffff', '#d0d0d0', '#b3e5fc', '#ffa500', '#0088cc', '2px', '#00bfff', '#ffa500', 'left', 'center', '', '', '', false, true),
    
    -- Tema 14: Clássico Preto Elegante
    ('classico-preto', 'Clássico Preto Elegante', 'primefaces-classico-preto', '#1a1a1a', '#d4af37', '#1a1a1a', '#ffffff', '#1a1a1a', '#ffffff', '#cccccc', '#e0e0e0', '#d4af37', '#0d0d0d', '4px', '#d4af37', '#1a1a1a', 'center', 'center', '', '', '', false, true),
    
    -- Tema 15: Moderno Cobre Quente
    ('moderno-cobre', 'Moderno Cobre Quente', 'primefaces-moderno-cobre', '#b87333', '#e8dcc8', '#b87333', '#f9f5f0', '#3d2817', '#ffffff', '#d0d0d0', '#d9c4b3', '#e8dcc8', '#8b5a2b', '2px', '#b87333', '#e8dcc8', 'left', 'center', '', '', '', false, true),
    
    -- Tema 16: Tech Azul Neon
    ('tech-neon', 'Tech Azul Neon', 'primefaces-tech-neon', '#0ea5e9', '#1e293b', '#0ea5e9', '#0f172a', '#e2e8f0', '#ffffff', '#94a3b8', '#334155', '#0ea5e9', '#0284c7', '2px', '#0ea5e9', '#1e293b', 'left', 'center', '', '', '', false, true),
    
    -- Tema 17: Natural Bege Areia
    ('natural-areia', 'Natural Bege Areia', 'primefaces-natural-areia', '#c2b280', '#8b7355', '#c2b280', '#fefdfb', '#3d2817', '#ffffff', '#d0d0d0', '#d9cfc9', '#8b7355', '#9d8a6f', '2px', '#c2b280', '#8b7355', 'left', 'center', '', '', '', false, true),
    
    -- Tema 18: Vibrante Magenta Profundo
    ('vibrante-magenta', 'Vibrante Magenta Profundo', 'primefaces-vibrante-magenta', '#c41e3a', '#ffd700', '#c41e3a', '#f5f5f0', '#1a1a1a', '#ffffff', '#d0d0d0', '#f0d9c8', '#ffd700', '#8b0a1a', '2px', '#c41e3a', '#ffd700', 'left', 'center', '', '', '', false, true),
    
    -- Tema 19: Corporativo Azul Profissional
    ('corporativo-azul-prof', 'Corporativo Azul Profissional', 'primefaces-corporativo-azul-prof', '#003f7f', '#6ca6d4', '#003f7f', '#ffffff', '#2c2c2c', '#ffffff', '#d0d0d0', '#b8d4e8', '#6ca6d4', '#002060', '3px', '#003f7f', '#6ca6d4', 'left', 'center', '', '', '', false, true),
    
    -- Tema 20: Minimalista Branco Puro
    ('minimalista-branco', 'Minimalista Branco Puro', 'primefaces-minimalista-branco', '#f5f5f5', '#666666', '#f5f5f5', '#ffffff', '#1a1a1a', '#ffffff', '#d0d0d0', '#e0e0e0', '#666666', '#cccccc', '1px', '#f5f5f5', '#999999', 'left', 'center', '', '', '', false, true)
ON CONFLICT (tema) DO NOTHING;

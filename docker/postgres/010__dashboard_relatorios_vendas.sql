-- Migration para tabelas de métricas, painel e dashboard executivo
CREATE TABLE IF NOT EXISTS rel_dashboard_metrica (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    valor VARCHAR(50) NOT NULL,
    tendencia VARCHAR(20),
    fl_positivo BOOLEAN DEFAULT TRUE,
    icone VARCHAR(50),
    dh_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rel_dashboard_venda_mensal (
    id SERIAL PRIMARY KEY,
    mes VARCHAR(10) NOT NULL,
    vendas NUMERIC(12, 2) NOT NULL,
    ano INT DEFAULT 2026
);

CREATE TABLE IF NOT EXISTS rel_cliente_recente (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    valor_compra NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pago',
    dh_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed de dados iniciais para o dashboard
INSERT INTO rel_dashboard_metrica (titulo, valor, tendencia, fl_positivo, icone) VALUES
('Receita', 'R$ 45.200', '+45,20%', TRUE, 'DollarSign'),
('Novos Clientes', '+1.230', '+1.230', TRUE, 'Users'),
('Vendas Mensais', '340', '-0,05%', FALSE, 'ShoppingBag')
ON CONFLICT DO NOTHING;

INSERT INTO rel_dashboard_venda_mensal (mes, vendas, ano) VALUES
('Jan', 4000, 2026),
('Fev', 3000, 2026),
('Mar', 5000, 2026),
('Abr', 2780, 2026),
('Mai', 1890, 2026),
('Jun', 2390, 2026),
('Jul', 3490, 2026),
('Ago', 4200, 2026),
('Set', 3100, 2026),
('Out', 4500, 2026),
('Nov', 3800, 2026),
('Dez', 5200, 2026)
ON CONFLICT DO NOTHING;

INSERT INTO rel_cliente_recente (nome, email, valor_compra, status) VALUES
('Marrin Cerne', 'commama@gmail.com', 4.00, 'Pago'),
('Adam Maxtin', 'manmama@gmail.com', 4.00, 'Pendente'),
('Julan Cake', 'lalancekn@gmail.com', 4.00, 'Pendente')
ON CONFLICT DO NOTHING;

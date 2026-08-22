-- Notificacoas - regras de status de matricula e turma
-- Regras adicionais para notificacao sobre alteracoes de status

CREATE TABLE IF NOT EXISTS not_notificacao_regra (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    tipo_regra VARCHAR(50) NOT NULL,
    canal VARCHAR(30) NOT NULL,
    destinatario VARCHAR(50) NOT NULL,
    destinatario_professor BOOLEAN NOT NULL DEFAULT FALSE,
    valor_limite DOUBLE PRECISION,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Regras para Matricula
INSERT INTO not_notificacao_regra (nome, descricao, tipo_regra, canal, destinatario, valor_limite, ativo) VALUES
    ('Matricula Gerada', 'Notificar quando nova matricula e criada', 'matricula_gerada', 'EMAIL', 'DONO_ALUNO', 0.0, TRUE),
    ('Matricula Confirmada', 'Notificar quando matricula e confirmada', 'matricula_confirmada', 'EMAIL', 'DONO_ALUNO', 0.0, TRUE),
    ('Matricula Cancelada', 'Notificar quando matricula e cancelada', 'matricula_cancelada', 'EMAIL', 'DONO_ALUNO', 0.0, TRUE),
    ('Matricula Finalizada', 'Notificar quando cursando e finalizado', 'matricula_finalizada', 'EMAIL', 'DONO_ALUNO', 0.0, TRUE),

    ('Matricula Gerada - App', 'Notificar nova matricula via app', 'matricula_gerada', 'MOBILE', 'DONO_ALUNO', 0.0, TRUE),
    ('Matricula Finalizada - App', 'Notificar finalizacao via app', 'matricula_finalizada', 'MOBILE', 'DONO_ALUNO', 0.0, TRUE),

    ('Responsavel - Matricula Alterada', 'Notificar responsavel da unidade quando matricula e alterada', 'matricula_gerada', 'EMAIL', 'RESPONSABLE_UNIDADE', 0.0, TRUE),

-- Regras para Turma / OferecimentoComponenteCurricular
    ('Turma Aberta', 'Notificar quando turma e liberada para inscricao', 'turma_aberta', 'EMAIL', 'DONO_ALUNO', 0.0, TRUE),
    ('Turma Lota', 'Notificar quando turma atinge capacidade maxima', 'turma_lotada', 'EMAIL', 'DONO_ALUNO', 0.0, TRUE),
    ('Turma Concluida', 'Notificar quando turma e finalizada/concluida', 'turma_concluida', 'EMAIL', 'DONO_ALUNO', 0.0, TRUE),
    ('Turma Cancelada', 'Notificar quando turma e cancelada', 'turma_cancelada', 'EMAIL', 'DONO_ALUNO', 0.0, TRUE),

    ('Turma Aberta - Professor e Aluno', 'Notificar professor e aluno quando turma e liberada', 'turma_aberta', 'EMAIL', 'AMBOS', 0.0, TRUE),
    ('Turma Lota - Professor e Aluno', 'Notificar professor e aluno quando turma atinge capacidade maxima', 'turma_lotada', 'EMAIL', 'AMBOS', 0.0, TRUE),
    ('Turma Concluida - Professor e Aluno', 'Notificar professor e aluno quando turma e finalizada', 'turma_concluida', 'EMAIL', 'AMBOS', 0.0, TRUE),
    ('Turma Cancelada - Professor e Aluno', 'Notificar professor e aluno quando turma e cancelada', 'turma_cancelada', 'EMAIL', 'AMBOS', 0.0, TRUE),

    ('Turma Aberta - App', 'Notificar turma aberta via app', 'turma_aberta', 'MOBILE', 'DONO_ALUNO', 0.0, TRUE),
    ('Turma Lota - App', 'Notificar turma lotada via app', 'turma_lotada', 'MOBILE', 'DONO_ALUNO', 0.0, TRUE),

    ('Turma Aberta - Professor e Aluno - App', 'Notificar professor e aluno via app quando turma e liberada', 'turma_aberta', 'MOBILE', 'AMBOS', 0.0, TRUE),
    ('Turma Lota - Professor e Aluno - App', 'Notificar professor e aluno via app quando turma atinge capacidade maxima', 'turma_lotada', 'MOBILE', 'AMBOS', 0.0, TRUE),

    ('Responsavel - Turma Lota', 'Notificar responsavel da unidade quando turma e lotada', 'turma_lotada', 'EMAIL', 'RESPONSABLE_UNIDADE', 0.0, TRUE),

    ('Status Offering Mudanca', 'Notificacao quando status do offering muda para sistema', 'turma_lotada', 'SISTEMA', 'DONO_ALUNO', 0.0, TRUE)
ON CONFLICT (nome) DO NOTHING;
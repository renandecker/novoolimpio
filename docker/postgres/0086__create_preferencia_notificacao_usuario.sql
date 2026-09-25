-- Preferencias de Notificacao por Usuario
-- Permite configurar quais canais (Push, Telegram, WhatsApp, Email, SMS) sao habilitados
-- para cada tipo de notificacao (Notas, Presencas, Aulas, Registro aula, Alteracao contrato)
-- agrupados por categoria (TURMA, CONTRATO).

CREATE TABLE IF NOT EXISTS not_preferencia_notificacao_usuario (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(120) NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    canal VARCHAR(30) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_pref_notif_user_cat_tipo_canal UNIQUE (username, categoria, tipo, canal)
);

CREATE INDEX IF NOT EXISTS idx_pref_notif_user_cat ON not_preferencia_notificacao_usuario(username, categoria);
CREATE INDEX IF NOT EXISTS idx_pref_notif_user ON not_preferencia_notificacao_usuario(username);

-- Comentarios para documentacao
COMMENT ON TABLE not_preferencia_notificacao_usuario IS 'Preferencias de canais de notificacao por usuario, categoria e tipo';
COMMENT ON COLUMN not_preferencia_notificacao_usuario.categoria IS 'Categoria da notificacao: TURMA ou CONTRATO';
COMMENT ON COLUMN not_preferencia_notificacao_usuario.tipo IS 'Tipo da notificacao: NOTAS, PRESENCAS, AULAS, REGISTRO_AULA, ALTERACAO_CONTRATO';
COMMENT ON COLUMN not_preferencia_notificacao_usuario.canal IS 'Canal de entrega: PUSH, TELEGRAM, WHATSAPP, EMAIL, SMS';
COMMENT ON COLUMN not_preferencia_notificacao_usuario.ativo IS 'Se o canal esta habilitado para este tipo de notificacao';
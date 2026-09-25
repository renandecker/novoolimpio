-- Table for storing mobile device tokens (FCM/APNs) per user
-- Allows multiple tokens per user for multi-device support
-- Used by notification microservice to send push notifications to all active devices

CREATE TABLE IF NOT EXISTS bas_usuario_mobile (
    id BIGSERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES bas_usuario(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    plataforma VARCHAR(20) NOT NULL DEFAULT 'ANDROID', -- ANDROID, IOS
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_uso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_usuario, token)
);

CREATE INDEX IF NOT EXISTS idx_bas_usuario_mobile_id_usuario ON bas_usuario_mobile(id_usuario);
CREATE INDEX IF NOT EXISTS idx_bas_usuario_mobile_ativo ON bas_usuario_mobile(id_usuario, ativo) WHERE ativo = TRUE;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_bas_usuario_mobile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bas_usuario_mobile_updated_at ON bas_usuario_mobile;
CREATE TRIGGER trg_bas_usuario_mobile_updated_at
    BEFORE UPDATE ON bas_usuario_mobile
    FOR EACH ROW
    EXECUTE FUNCTION update_bas_usuario_mobile_updated_at();
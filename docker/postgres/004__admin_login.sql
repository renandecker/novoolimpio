-- Garante o acesso do administrador e o vinculo com bas_usuario, mesmo quando o
-- registro de 'admin' ja existia em bas_login (ex.: criado pelo endpoint bootstrap).
-- username: admin | senha: admin123 (PBKDF2-HMAC-SHA256, 210000 iteracoes)
INSERT INTO bas_login (username, password_hash, permissions, active, id_usuario, created_at, updated_at)
SELECT 'admin',
       'pbkdf2$210000$FH_ClhgOYJwBOat1GSwabw$6xdztO0zi_QkQaowQgaQehEkXM_g5zLPdMilJHeABaA',
       'READ,CREATE,UPDATE,DELETE,EXECUTE',
       TRUE,
       (SELECT id FROM bas_usuario WHERE lower(login) = 'admin' LIMIT 1),
       NOW(),
       NOW()
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    permissions   = EXCLUDED.permissions,
    active        = TRUE,
    id_usuario    = EXCLUDED.id_usuario,
    updated_at    = NOW();

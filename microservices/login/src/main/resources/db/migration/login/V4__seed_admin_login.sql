-- Relaciona bas_login com bas_usuario via campo id_usuario (padrao do esquema legado).
-- Antes chamava-se usuario_id; passa a ser uma FK real para bas_usuario(id).
ALTER TABLE bas_login RENAME COLUMN usuario_id TO id_usuario;

ALTER TABLE bas_login
    ADD CONSTRAINT fk_bas_login_id_usuario FOREIGN KEY (id_usuario) REFERENCES bas_usuario(id);

-- Usuario administrador inicial do novo sistema.
-- username: admin | senha: admin123 (PBKDF2-HMAC-SHA256, 210000 iteracoes)
-- id_usuario aponta para o registro 'admin' da tabela bas_usuario (criado em V1_2__InsertPadrao).
INSERT INTO bas_login (username, password_hash, permissions, active, id_usuario, created_at, updated_at)
SELECT 'admin',
       'pbkdf2$210000$FH_ClhgOYJwBOat1GSwabw$6xdztO0zi_QkQaowQgaQehEkXM_g5zLPdMilJHeABaA',
       'READ,CREATE,UPDATE,DELETE,EXECUTE',
       TRUE,
       (SELECT id FROM bas_usuario WHERE lower(login) = 'admin' LIMIT 1),
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM bas_login WHERE lower(username) = 'admin');

-- Provisiona uma conta no novo sistema (bas_login) para cada usuario do esquema
-- legado (bas_usuario) que possua CPF vinculado (bas_pessoa_fisica).
--   username        = login legado (normalizado para minusculas)
--   senha provisoria = CPF (somente digitos)
--   permissao       = READ (acesso ao portal; a senha e trocada via change-password)
--
-- O hash provisorio usa o marcador 'plain$' porque o PBKDF2 do login nao e
-- computavel em SQL puro; ao trocar a senha, o fluxo change-password grava o
-- hash PBKDF2 padrao e o 'plain$' deixa de existir.
--
-- Idempotente: ON CONFLICT (username) apenas reativa e religa a conta, sem
-- sobrescrever a senha de quem ja trocou a provisoria.
INSERT INTO bas_login (username, password_hash, permissions, active, id_usuario, created_at, updated_at)
SELECT lower(u.login),
       'plain$' || regexp_replace(f.cpf, '\D', '', 'g'),
       'READ',
       TRUE,
       u.id,
       NOW(),
       NOW()
FROM bas_usuario u
JOIN bas_pessoa_fisica f ON f.id_pessoa = u.id_pessoa
WHERE u.fl_ativo = TRUE
  AND u.login IS NOT NULL
  AND u.login <> ''
  AND f.cpf IS NOT NULL
  AND regexp_replace(f.cpf, '\D', '', 'g') <> ''
ON CONFLICT (username) DO UPDATE SET
    active     = TRUE,
    id_usuario = EXCLUDED.id_usuario,
    updated_at = NOW();

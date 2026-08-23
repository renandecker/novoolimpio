#!/bin/bash
# Script para criar acesso para alunos com contrato ativo
# Uso: docker exec -i olimpio-postgres psql -U postgres -d olimpio -f /backup/criar_acesso_alunos.sh
# Ou: docker compose exec postgres psql -U postgres -d olimpio -f /backup/criar_acesso_alunos.sh

set -e

echo "[criar_acesso_alunos] Iniciando criacao de acesso para alunos com contrato ativo..."

# 1) Garante usuario em bas_usuario para cada pessoa com contrato ativo
psql -v ON_ERROR_STOP=1 -U postgres -d olimpio <<'SQL'
INSERT INTO bas_usuario (login, senha, fl_ativo, id_pessoa, fl_senha_provisoria, created_at, updated_at)
SELECT 
    lower(regexp_replace(
        split_part(pf.nome, ' ', 1) || '.' || 
        split_part(pf.nome, ' ', array_length(regexp_split_to_array(pf.nome, '\s+'), 1)),
        '[^a-z0-9.]', '', 'g'
    )),
    'plain$admin123',
    TRUE,
    pf.id_pessoa,
    TRUE,
    NOW(),
    NOW()
FROM bas_pessoa_fisica pf
JOIN edc_contrato c ON c.id_pessoa = pf.id_pessoa
WHERE c.ativo = TRUE
  AND pf.nome IS NOT NULL
  AND pf.nome <> ''
  AND NOT EXISTS (
      SELECT 1 FROM bas_usuario u 
      WHERE u.id_pessoa = pf.id_pessoa
  );
SQL

echo "[criar_acesso_alunos] Usuarios criados/atualizados em bas_usuario"

# 2) Cria/atualiza login em bas_login
psql -v ON_ERROR_STOP=1 -U postgres -d olimpio <<'SQL'
INSERT INTO bas_login (username, password_hash, permissions, active, id_usuario, created_at, updated_at)
SELECT 
    lower(u.login),
    'plain$admin123',
    'READ',
    TRUE,
    u.id,
    NOW(),
    NOW()
FROM bas_usuario u
JOIN bas_pessoa_fisica pf ON pf.id_pessoa = u.id_pessoa
JOIN edc_contrato c ON c.id_pessoa = pf.id_pessoa
WHERE c.ativo = TRUE
  AND u.fl_ativo = TRUE
  AND u.login IS NOT NULL
  AND u.login <> ''
ON CONFLICT (username) DO UPDATE SET
    active      = TRUE,
    id_usuario  = EXCLUDED.id_usuario,
    updated_at  = NOW(),
    password_hash = EXCLUDED.password_hash,
    permissions = EXCLUDED.permissions;
SQL

echo "[criar_acesso_alunos] Logins criados/atualizados em bas_login"

# 3) Vincula perfil "Aluno" (se existir)
psql -v ON_ERROR_STOP=1 -U postgres -d olimpio <<'SQL'
INSERT INTO bas_usuario_perfil (id_usuario, id_perfil)
SELECT u.id, p.id
FROM bas_usuario u
JOIN bas_pessoa_fisica pf ON pf.id_pessoa = u.id_pessoa
JOIN edc_contrato c ON c.id_pessoa = pf.id_pessoa
CROSS JOIN bas_perfil p
WHERE c.ativo = TRUE
  AND u.fl_ativo = TRUE
  AND lower(p.descricao) = 'aluno'
  AND NOT EXISTS (
      SELECT 1 FROM bas_usuario_perfil up
      WHERE up.id_usuario = u.id AND up.id_perfil = p.id
  );
SQL

echo "[criar_acesso_alunos] Perfis vinculados"
echo "[criar_acesso_alunos] Concluido com sucesso!"
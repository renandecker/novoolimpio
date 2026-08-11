#!/bin/bash
# Cria um banco de dados para cada microsservico na mesma instancia do Postgres.
set -e

DATABASES="olimpio_basico olimpio_central olimpio_comercial olimpio_educacao olimpio_estoque olimpio_financeiro olimpio_relatorios olimpio_schedule"

for DB in $DATABASES; do
  echo "Criando banco '$DB' (se ainda nao existir)..."
  psql -v ON_ERROR_STOP=0 --username "$POSTGRES_USER" <<-SQL
    SELECT 'CREATE DATABASE $DB' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB')\gexec
SQL
done

echo "Criando tabela de autenticação no banco olimpio_basico..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname olimpio_basico <<-SQL
    CREATE TABLE IF NOT EXISTS bas_login (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(120) NOT NULL UNIQUE,
        password_hash VARCHAR(512) NOT NULL,
        permissions VARCHAR(500) NOT NULL DEFAULT 'READ',
        active BOOLEAN NOT NULL DEFAULT TRUE,
        id_usuario BIGINT REFERENCES bas_usuario(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_bas_login_active ON bas_login(active);
SQL

echo "Todos os bancos foram criados."

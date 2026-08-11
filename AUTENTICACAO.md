# Autenticacao e autorizacao

O microsservico `login` expoe os endpoints abaixo:

| Endpoint | Uso |
| --- | --- |
| `POST /api/login/bootstrap` | Cria o primeiro usuario administrador. So funciona enquanto `bas_login` estiver vazia. |
| `POST /api/login/authenticate` | Autentica `{ "username", "password" }` e devolve um JWT. |
| `POST /api/login/logout` | Encerra a sessao do token enviado em `Authorization: Bearer <token>`, revogando-o imediatamente. |

O token e valido por uma hora e deve ser enviado como `Authorization: Bearer <token>`. Os clientes web e mobile fazem isso automaticamente depois do login. As senhas sao armazenadas como PBKDF2-HMAC-SHA256, nunca em texto puro. Cada token emitido ganha um `jti` registrado em `bas_login_session`; o deslogamento inativa essa sessao e o filtro JWT passa a rejeitar o token antes mesmo da expiracao.

## Acesso inicial

A migracao `V4__seed_admin_login.sql` cria o usuario administrador inicial:

| username | password |
| --- | --- |
| `admin` | `admin123` |

Use `POST /api/login/authenticate` com `{ "username": "admin", "password": "admin123" }` para obter o JWT. Troque essa senha antes de usar em producao.

## Banco de dados

`microservices/login/src/main/resources/db/migration/login/V2__login.sql` cria `bas_login`, com: `username`, `password_hash`, `permissions`, `active`, `usuario_id`, `created_at` e `updated_at`. A migracao `V4__seed_admin_login.sql` renomeia `usuario_id` para `id_usuario` e cria a foreign key para `bas_usuario(id)`, alem de inserir o acesso do admin.

Em uma instalacao ja existente, aplique esses scripts manualmente no banco `olimpio`. Em uma instalacao Docker nova, o login microservice cria a tabela automaticamente na primeira inicializacao. A migracao `V6__login_session.sql` cria `bas_login_session`, usada para rastrear e revogar sessoes ativas (`id` = `jti` do JWT, `active`).

## Permissoes

As permissoes preservadas da migracao sao `READ`, `CREATE`, `UPDATE`, `DELETE` e `EXECUTE`. O filtro JWT exige, respectivamente, `READ` para GET, `CREATE` para POST, `UPDATE` para PUT/PATCH e `DELETE` para DELETE. O endpoint de acoes exige `EXECUTE`.

Defina `JWT_SECRET` no ambiente antes de publicar. A chave padrao serve apenas para desenvolvimento local.
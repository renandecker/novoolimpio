# Rodando o Olimpio com Docker

Este projeto sobe com um unico comando: Postgres, os 10 microsservicos Quarkus (cada um na sua porta), um gateway Nginx e o app React.

## Pre-requisitos
- [Docker](https://docs.docker.com/get-docker/) e Docker Compose (ja vem junto no Docker Desktop).

## Subir tudo

### Windows
```batch
start-all.bat          # builda e sobe tudo, com logs no terminal
start-all.bat -d       # mesma coisa, mas em background
```

### Linux/Mac
```bash
./start-all.sh          # builda e sobe tudo, com logs no terminal
./start-all.sh -d       # mesma coisa, mas em background
```

Isso equivale a `docker compose up --build`. Na primeira vez demora um pouco (baixa as imagens base e builda os 10 microsservicos Java + o app React).

## Parar tudo

### Windows
```batch
stop-all.bat             # para os containers, mantem os dados do banco
stop-all.bat -v          # para os containers e apaga os dados do banco
```

### Linux/Mac
```bash
./stop-all.sh             # para os containers, mantem os dados do banco
./stop-all.sh -v          # para os containers e apaga os dados do banco
```

## O que sobe e em qual porta

| Servico | Porta no host | O que e |
|---|---|---|
| `web-react` | **3000** | App React (http://localhost:3000) |
| `gateway` | **8080** | Nginx roteando `/api/<modulo>/...` pro microsservico certo |
| `basico` | 8081 | Microsservico |
| `central` | 8083 | Microsservico |
| `comercial` | 8084 | Microsservico |
| `educacao` | 8085 | Microsservico |
| `estoque` | 8086 | Microsservico |
| `financeiro` | 8087 | Microsservico |
| `login` | 8090 | Microsservico de autenticacao (login/bootstrap) |
| `relatorios` | 8088 | Microsservico |
| `schedule` | 8089 | Microsservico |
| `postgres` | 5432 | Banco de dados (um schema/database por microsservico) |

Cada microsservico tambem pode ser chamado **diretamente** na sua porta (ex.: `http://localhost:8081/api/basico/agenda`), sem passar pelo gateway — util para testar um servico isolado.

## Banco de dados

Uma unica instancia do Postgres sobe com **10 bancos separados** (`olimpio_basico`, ..., `olimpio_schedule`), criados automaticamente na primeira subida pelo script `docker/postgres/init-multiple-dbs.sh`. Cada microsserviço só enxerga o seu proprio banco — é assim que ja estava configurado em cada `application.properties` (variaveis `DATABASE_URL`/`DATABASE_USER`/`DATABASE_PASSWORD`, com esses valores como default). As tabelas sao restauradas a cada start a partir do backup `docker/postgres/olimpio.sql` (container `restore`) — por isso nenhum microsservico roda DDL no startup (`quarkus.hibernate-orm.database.generation=none`, para evitar deadlocks de `ALTER TABLE` concorrente entre os modulos que compartilham o banco `olimpio`).

## O gateway

Todo controller dos microsservicos segue o padrao `@Path("/api/<modulo>/<feature>")` (ex.: `/api/basico/agenda`, `/api/educacao/matricula`). O gateway (`docker/gateway/nginx.conf`) usa exatamente esse padrao para saber pra qual container mandar cada requisicao:

```
/api/basico/*      -> basico:8081
/api/central/*     -> central:8083
/api/comercial/*   -> comercial:8084
/api/educacao/*    -> educacao:8085
/api/estoque/*     -> estoque:8086
/api/financeiro/*  -> financeiro:8087
/api/login/*       -> login:8090
/api/relatorios/*  -> relatorios:8088
/api/schedule/*    -> schedule:8089
```

O app React aponta para `http://localhost:8080` (o gateway) via `VITE_API_URL`, entao ele fala com um endereco so e o gateway decide pra onde mandar.

## ⚠️ Sobre o app React

O `web-react/` que veio no projeto é um **scaffold gerado automaticamente**: as telas existem e o roteamento (`react-router-dom`) está montado, mas os caminhos de API chamados por cada tela (ex.: `/api/view/agenda/listAgenda`) ainda são placeholders — eles **não correspondem** aos endpoints reais dos controllers (que são `/api/<modulo>/<feature>`, com verbos `GET/POST/PUT/DELETE` padrão REST). Isso é uma característica de como as telas foram geradas, não algo introduzido agora.

Ajustei o que era necessário pra esse app **buildar e rodar** dentro do Docker (faltava `index.html` completo, `tsconfig.json` e `vite.config.ts` — sem eles o container nem chegava a compilar):
- `index.html` (estava incompleto, faltava a estrutura de página)
- `tsconfig.json` e `vite.config.ts` (não existiam)
- `package.json`: ajustei o script de build para não travar em erros de tipo dos centenas de telas geradas (`vite build` direto, sem o `tsc -b` prévio)

Mas a **ligação de cada tela com o endpoint certo do backend** é um trabalho à parte (são ~400 arquivos de tela) — se quiser, faço isso numa próxima rodada, tela por tela ou por módulo.

## Arquivos criados/ajustados nesta tarefa

```
docker-compose.yml
start-all.sh / start-all.bat
stop-all.sh / stop-all.bat
docker/postgres/init-multiple-dbs.sh
docker/gateway/Dockerfile
docker/gateway/nginx.conf
microservices/<cada modulo>/Dockerfile
microservices/<cada modulo>/.dockerignore
microservices/<cada modulo>/src/main/resources/application.properties  (porta fixa)
web-react/Dockerfile
web-react/nginx.conf
web-react/.dockerignore
web-react/index.html        (corrigido)
web-react/tsconfig.json     (novo)
web-react/vite.config.ts    (novo)
web-react/package.json      (script de build ajustado)
```

## Rodando sem Docker (modo dev local)

Se preferir rodar sem Docker, cada microsserviço pode subir com `mvn quarkus:dev` de dentro da sua pasta (usa a porta fixa ja configurada), e o React com `npm install && npm run dev` dentro de `web-react/` — mas nesse caso você precisa ter um Postgres local com os 10 bancos criados (pode reaproveitar `docker/postgres/init-multiple-dbs.sh` como referencia) e apontar `DATABASE_URL` de cada serviço pra ele.
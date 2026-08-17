# olimpio-fiserv

Microsserviço de pagamentos com **cartão** (à vista e parcelado) para o ecossistema
Olímpio, construído no mesmo padrão do `olimpio-basico-service` (Quarkus 3.15 + Hibernate
Reactive Panache + Postgres reativo + JWT + Kafka), integrando com a **Fiserv Commerce Hub /
Payments Gateway (IPP)** a partir da collection Postman fornecida.

> O fluxo **PIX**, que usava o Asaas como PSP, foi movido para o **asaas-service**
> (rota `/api/asaas/pix`). Este serviço trata apenas cartão Fiserv.

---

## 1. O que foi entregue

| Item | Descrição |
|---|---|
| Estrutura do projeto | Mesmo padrão do `basico.zip`: um pacote por domínio (`entity/repository/service/controller/dto`), classes de segurança JWT e mapeadores de exceção copiados de `shared/`. |
| Integração Fiserv | Módulo `gateway/fiserv`: assinatura HMAC, DTOs de request e o serviço que chama `/payments` (à vista), `/payment-schedules` (parcelado), `/payment-tokens` (cadastro de cartão) e transações secundárias `/payments/{id}` (void/estorno). |
| Cadastro de cartão | Módulo `cartaopessoa`: tokeniza o cartão na Fiserv e grava **apenas** bin, últimos 4 dígitos, CPF e o token — nunca o número completo nem o CVV. |
| Cobrança de cartão | Módulo `parcelacartao`: efetua a cobrança (à vista ou parcelada), cancela (void), estorna (return) e vincula o resultado a `fin_parcela`. |
| PIX | Movido para o `asaas-service` (rota `/api/asaas/pix`, antes `/api/pagamento/pix`). O fiserv agora trata somente cartão Fiserv. |
| Webhook | `POST /api/pagamento/webhook/fiserv`: aplica confirmações assíncronas da Fiserv em `fin_parcela_cartao`. |
| Kafka | Evento `olimpio.pagamento.confirmado` publicado quando um pagamento por **cartão** é confirmado. O fluxo PIX publica o mesmo evento a partir do asaas-service. |
| Orquestração | Módulo `pagamento`: um único endpoint que recebe a forma de pagamento (cartão) e despacha para o módulo certo. |
| Banco de dados | `V2__pagamento_fiserv.sql` (Flyway), aditivo ao `V1__base.sql`. No Docker a mesma migração é aplicada por `0021__pagamento_fiserv.sql` (o `0017__fiserv.sql` cobre apenas o `V17` do login-service). O `V3__ajuste_pix.sql` (PIX) foi movido para o asaas-service. |

---

## 2. ⚠️ PIX foi movido para o asaas-service

O PIX do fiserv (módulo `pix/`, incluindo o provider real `AsaasPixProviderClient`)
foi **movido integralmente para o microsserviço `asaas`** (rota `/api/asaas/pix`, pacote
`br.com.sol7.olimpio.asaas.pagamento_pix`). Os consumidores que chamavam `/api/pagamento/pix`
devem chamar `/api/asaas/pix`.

Motivo: a collection Fiserv fornecida (`fiserv_dev_postman_collection.json`) é a API global de
e-commerce da Fiserv (Commerce Hub / Payments Gateway/IPP) e **não possui endpoint de PIX** —
PIX é um meio de pagamento instantâneo brasileiro. O fluxo de PIX, que já usava o Asaas como PSP,
passou a viver no microsserviço responsável pelo Asaas.

O que este serviço (fiserv) faz hoje:

- **À vista** → `POST /ipp/payments-gateway/v2/payments` com `requestType: PaymentCardSaleTransaction` (ou `PaymentTokenSaleTransaction` quando usa cartão já cadastrado).
- **Parcelado** → `POST /ipp/payments-gateway/v2/payment-schedules` com `requestType: PaymentMethodPaymentSchedulesRequest` (`numberOfPayments` = quantidade de parcelas, `frequency` = periodicidade).
- **Cadastro de cartão** → `POST /ipp/payments-gateway/v2/payment-tokens` (`PaymentCardPaymentTokenizationRequest`), que retorna um `paymentToken` reutilizável.

Para não travar a entrega, o cartão (à vista e parcelado) chama a Fiserv de verdade, e o PIX
foi isolado atrás da interface `PixProviderClient` e movido para o asaas-service.

A migração `V3__ajuste_pix.sql` (revisão de `fin_pix`/`fin_parcela_pix`: `valor`,
`valor_pago`, `moeda`, `provider_charge_id`, `end_to_end_id`, `data_criacao`,
`data_pagamento`, `tipo_chave`, `fl_ativo`) foi **movida para o asaas-service**
(`src/main/resources/db/migration/asaas/V3__ajuste_pix.sql`). No Docker ela continua sendo
aplicada pelo restore (`0022__ajuste_pix.sql`).

---

## 3. Estrutura do projeto

```
fiserv/
├── pom.xml
├── .env.example
├── README.md
└── src/main/
    ├── resources/
    │   ├── application.properties
    │   └── db/migration/
    │       ├── V1__base.sql                 (fornecido por você, copiado para o Flyway rodar em ordem)
    │       └── V2__pagamento_fiserv.sql      (novo — ver seção 4)
    └── java/br/com/sol7/olimpio/
        ├── shared/                          (copiado do basico: JWT, exceptions, PagedResponse)
        │   └── security/
        └── pagamento/
            ├── gateway/fiserv/              (integração Fiserv: HMAC, DTOs, client, service)
            │   └── dto/
            ├── cartaopessoa/                (fin_cartao_pessoa — cadastro de cartão)
            ├── parcelacartao/               (fin_parcela_cartao — cobrança à vista/parcelado)
            ├── parcela/                     (leitura/vínculo de fin_parcela)
            └── pagamento/                   (orquestração — endpoint único, somente cartão)
```

---

## 4. Banco de dados

O script **`src/main/resources/db/migration/V2__pagamento_fiserv.sql`** é **aditivo** ao
`V1__base.sql` (não altera nenhuma tabela/coluna existente) e cria:

### `fin_cartao_pessoa`
Cartões cadastrados por pessoa. Vinculada a `bas_pessoa` por `id_pessoa`. Armazena **somente**:
`bin` (6-8 primeiros dígitos), `ultimos_digitos` (últimos 4), `cpf`, `bandeira`, validade e o
`payment_token` retornado pela Fiserv — nunca o PAN completo nem o CVV (exigência de PCI-DSS).

### `fin_parcela_cartao`
Uma linha por transação de cartão (à vista ou parcelada), com `tipo_pagamento`
(`VISTA`/`PARCELADO`), `qtd_parcelas`, valor, e os identificadores retornados pela Fiserv
(`ipg_transaction_id`, `order_id`/`payment_schedule_id`, `status`). Referencia opcionalmente
`fin_cartao_pessoa`.

### `fin_parcela` (alterada)
Ganha a coluna `id_parcela_cartao` (FK para `fin_parcela_cartao`) — **exatamente o mesmo
padrão** que as colunas já existentes `id_parcela_boleto` e `id_parcela_pix` usam para boleto e
PIX. Assim, `fin_parcela` sabe se (e como) foi paga: boleto, PIX ou cartão (à vista/parcelado).

PIX **não precisou de nenhuma tabela nova** — `fin_pix` e `fin_parcela_pix`, já existentes no
`V1__base.sql`, foram reaproveitadas e completadas de forma aditiva. O script que as ajusta
(`V3__ajuste_pix.sql`) foi movido para o `asaas-service`
(`src/main/resources/db/migration/asaas/V3__ajuste_pix.sql`).

### Como rodar

O Flyway deste serviço está **desativado** (`quarkus.flyway.migrate-at-start=false`): as
migrações de pagamento (o equivalente a `V21__pagamento_fiserv.sql` do
login-service) são aplicadas pelo restore do Docker (`docker/postgres/0017__fiserv.sql` para o
V17 do login e `0021__pagamento_fiserv.sql` = V21). Se precisar
rodar manualmente:

```bash
psql -h localhost -U postgres -d olimpio -f src/main/resources/db/migration/V2__pagamento_fiserv.sql
```

(O script usa `CREATE TABLE IF NOT EXISTS` e blocos `DO $$ ... IF NOT EXISTS` para constraints,
então pode ser reexecutado com segurança.)

---

## 5. Configuração da API Fiserv

1. Crie uma conta no [Fiserv Developer Studio](https://developer.fiserv.com) e gere um
   **Api-Key** e **Api-Secret** de sandbox (ambiente `cert.emea.api.fiservapps.com`).
2. Copie `.env.example` para `.env` e preencha `FISERV_API_KEY`, `FISERV_API_SECRET` e
   `FISERV_STORE_ID`.
3. A autenticação é feita por **HMAC-SHA256** (não é OAuth/Bearer), implementada em
   `FiservSignatureService`:

   ```
   rawSignature      = apiKey + clientRequestId + timestamp(ms) + corpoJSON
   Message-Signature = Base64( HMAC-SHA256(apiSecret, rawSignature) )
   ```

   Enviada em todo request como os headers `Api-Key`, `Client-Request-Id`, `Timestamp` e
   `Message-Signature` — o mesmo mecanismo usado pela collection Postman.
4. Quando quiser ir para produção, troque `FISERV_BASE_URL` para
   `https://prod.emea.api.fiservapps.com` e use as credenciais de produção.

### Configuração da API Asaas

As credenciais do Asaas (`ASAAS_API_KEY`, `ASAAS_BASE_URL`) **não são mais necessárias neste
serviço**: o fluxo PIX/Asaas foi movido para o `asaas-service`. Configure-as no microsserviço
`asaas` (o `AsaasApiAuth` envia o token no header `access_token`).

---

## 6. Rodando o microsserviço

```bash
cp .env.example .env    # preencha os valores
export $(cat .env | xargs)
./mvnw quarkus:dev      # ou: ./mvnw package && java -jar target/quarkus-app/quarkus-run.jar
```

A API sobe em `http://localhost:8085` (porta configurável via `QUARKUS_HTTP_PORT`).

Todas as rotas exigem `Authorization: Bearer <token>` (JWT), validado pelo mesmo
`JWT_SECRET` do `olimpio-basico-service` — gere o token por lá.

---

## 7. Endpoints

### Cadastro de cartão — `/api/pagamento/cartao-pessoa`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/pagamento/cartao-pessoa` | Tokeniza o cartão na Fiserv e cadastra (bin/últimos dígitos/token) vinculado a uma pessoa |
| `GET`  | `/api/pagamento/cartao-pessoa?idPessoa=1` | Lista os cartões ativos de uma pessoa |
| `DELETE` | `/api/pagamento/cartao-pessoa/{id}?idPessoa=1` | Inativa (soft delete) um cartão |

```bash
curl -X POST http://localhost:8085/api/pagamento/cartao-pessoa \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "idPessoa": 1,
    "cpf": "12345678901",
    "numero": "4005519200000004",
    "cvv": "123",
    "validadeMes": "12",
    "validadeAno": "2028",
    "nomeTitular": "Joao da Silva",
    "apelido": "Nubank principal",
    "principal": true
  }'
```

### Cobrança de cartão — `/api/pagamento/cartao`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/pagamento/cartao` | Cobra uma parcela à vista ou parcelada |
| `GET`  | `/api/pagamento/cartao/{id}` | Consulta uma transação de cartão |
| `POST` | `/api/pagamento/cartao/{id}/cancelar` | Cancela (void) a transação na Fiserv e grava o status de reverso |
| `POST` | `/api/pagamento/cartao/{id}/estornar` | Estorna (return) o valor informado na transação |

```bash
# À vista, usando cartão já cadastrado
curl -X POST http://localhost:8085/api/pagamento/cartao \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "idParcela": 501, "idPessoa": 1, "idCartaoPessoa": 10,
    "tipoPagamento": "VISTA", "qtdParcelas": 1, "valor": 299.90
  }'

# Parcelado em 6x, informando o cartão na hora (sem cadastro prévio)
curl -X POST http://localhost:8085/api/pagamento/cartao \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "idParcela": 502, "idPessoa": 1,
    "numeroCartao": "4005519200000004", "cvvCartao": "123",
    "validadeMes": "12", "validadeAno": "2028",
    "tipoPagamento": "PARCELADO", "qtdParcelas": 6, "valor": 49.98
  }'
```

> No `PARCELADO`, `valor` é o valor de **cada** parcela (é assim que a Fiserv espera em
> `payment-schedules`); `qtdParcelas` é o total de cobranças.

```bash
# Cancela (void) a transação de cartão id 123
curl -X POST http://localhost:8085/api/pagamento/cartao/123/cancelar \
  -H "Authorization: Bearer $TOKEN"

# Estorna (return) R$ 100,00 da transação de cartão id 123
curl -X POST http://localhost:8085/api/pagamento/cartao/123/estornar \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"valor": 100.00}'
```

### Webhook Fiserv — `POST /api/pagamento/webhook/fiserv`

Endpoint **público** (isento de JWT) que recebe as notificações assíncronas da Fiserv e atualiza
a `fin_parcela_cartao` correspondente (identificação por `ipgTransactionId`/
`merchantTransactionId`/`orderId`, processamento idempotente):

- `APPROVED`/status de sucesso → marca `fin_parcela_cartao` e `fin_parcela` como pagas e publica o
  evento Kafka `olimpio.pagamento.confirmado`.
- `REVERSED`/`DECLINED` → marca o reverso e limpa a `data_pagamento`.

```bash
curl -X POST http://localhost:8085/api/pagamento/webhook/fiserv \
  -H "Content-Type: application/json" \
  -d '{"transactionStatus": "APPROVED", "ipgTransactionId": "123456", "transactionAmount": 100.00}'
```

### PIX — movido para `/api/asaas/pix`

O fluxo PIX não existe mais neste serviço. Foi movido para o **asaas-service**:

| Método | Rota | Serviço |
|---|---|---|
| `POST` | `/api/asaas/pix` | asaas-service (gera cobrança PIX para uma parcela) |
| `GET`  | `/api/asaas/pix/{id}` | asaas-service (consulta uma cobrança PIX) |
| `POST` | `/api/asaas/pix/{id}/atualizar-status` | asaas-service (atualiza a situação junto ao provider) |

```bash
curl -X POST http://localhost:8094/api/asaas/pix \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"idParcela": 503, "idPessoa": 1, "valor": 150.00, "dataVencimento": "2026-08-20"}'
```

### Endpoint único — `/api/pagamento`

Ponto de entrada único para **cartão** que recebe `formaPagamento` (`CARTAO_VISTA` ou
`CARTAO_PARCELADO`) e despacha internamente para os módulos de cartão:

```bash
curl -X POST http://localhost:8085/api/pagamento \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "idParcela": 504, "idPessoa": 1, "formaPagamento": "CARTAO_VISTA",
    "idCartaoPessoa": 10, "valor": 199.90
  }'
```

---

## 8. Segurança / boas práticas já aplicadas

- **PCI-DSS**: número completo do cartão e CVV trafegam apenas na chamada à Fiserv (em memória)
  e nunca são gravados no banco — só bin, últimos 4 dígitos, CPF e o `paymentToken`.
- **Assinatura HMAC** calculada sobre os bytes exatos enviados (o serviço serializa o corpo uma
  única vez e reusa a mesma string para assinar e enviar).
- **JWT** compartilhado com o `basico-service` protege todas as rotas (exceto o webhook Fiserv,
  que é público por natureza).
- **Kafka**: a publicação de `olimpio.pagamento.confirmado` nunca derruba a transação — falha é
  logada e o fluxo continua.
- Tabelas novas seguem exatamente a convenção (`IF NOT EXISTS`, `DO $$` idempotente,
  nomenclatura `fin_*`) do `V1__base.sql`, para minimizar risco de conflito.

## 9. Não incluído neste MVP (próximos passos sugeridos)

- **Verificação de assinatura no webhook** da Fiserv (o endpoint atual é público; validar o HMAC
  do corpo seria ideal em produção).
- **Retry/idempotência** mais robusta em falhas de rede com a Fiserv (ex.: exponential
  backoff + estado "PROCESSANDO" para reconciliar transações pendentes).
- **Reconciliação**: job periódico para consultar na Fiserv transações que ficaram em status
  intermediário e atualizar o banco. (No asaas-service, o equivalente vale para as cobranças PIX.)

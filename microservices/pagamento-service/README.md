# olimpio-pagamento-service

Microsserviço de pagamentos (cartão à vista, cartão parcelado e PIX) para o ecossistema
Olímpio, construído no mesmo padrão do `olimpio-basico-service` (Quarkus 3.15 + Hibernate
Reactive Panache + Postgres reativo + JWT + Kafka), integrando com a **Fiserv Commerce Hub /
Payments Gateway (IPP)** a partir da collection Postman fornecida.

---

## 1. O que foi entregue

| Item | Descrição |
|---|---|
| Estrutura do projeto | Mesmo padrão do `basico.zip`: um pacote por domínio (`entity/repository/service/controller/dto`), classes de segurança JWT e mapeadores de exceção copiados de `shared/`. |
| Integração Fiserv | Módulo `gateway/fiserv`: assinatura HMAC, DTOs de request e o serviço que chama `/payments` (à vista), `/payment-schedules` (parcelado) e `/payment-tokens` (cadastro de cartão). |
| Cadastro de cartão | Módulo `cartaopessoa`: tokeniza o cartão na Fiserv e grava **apenas** bin, últimos 4 dígitos, CPF e o token — nunca o número completo nem o CVV. |
| Cobrança de cartão | Módulo `parcelacartao`: efetua a cobrança (à vista ou parcelada) e vincula o resultado a `fin_parcela`. |
| PIX | Módulo `pix`: reaproveita as tabelas legadas `fin_pix`/`fin_parcela_pix` já existentes no `V1__base.sql`. |
| Orquestração | Módulo `pagamento`: um único endpoint que recebe a forma de pagamento e despacha para o módulo certo. |
| Banco de dados | `V2__pagamento_fiserv.sql` (Flyway), aditivo ao `V1__base.sql` — cria as tabelas novas e uma única coluna de vínculo em `fin_parcela`. |

---

## 2. ⚠️ Sobre PIX na collection Fiserv fornecida

Fiz uma busca completa em `fiserv_dev_postman_collection.json` (por "pix", "installment",
"parcel") e **não existe nenhum endpoint de PIX nessa collection**. Ela é a API global de
e-commerce da Fiserv (Commerce Hub / Payments Gateway/IPP) — PIX é um meio de pagamento
instantâneo brasileiro e não faz parte dela.

O que a collection tem, e que de fato mapeia para "à vista" e "parcelado", é:

- **À vista** → `POST /ipp/payments-gateway/v2/payments` com `requestType: PaymentCardSaleTransaction` (ou `PaymentTokenSaleTransaction` quando usa cartão já cadastrado).
- **Parcelado** → `POST /ipp/payments-gateway/v2/payment-schedules` com `requestType: PaymentMethodPaymentSchedulesRequest` (`numberOfPayments` = quantidade de parcelas, `frequency` = periodicidade).
- **Cadastro de cartão** → `POST /ipp/payments-gateway/v2/payment-tokens` (`PaymentCardPaymentTokenizationRequest`), que retorna um `paymentToken` reutilizável.

Para não travar a entrega, implementei o **cartão (à vista e parcelado) chamando a Fiserv de
verdade**, e o **PIX como um módulo funcional e persistente** (gera e consulta a cobrança,
vincula a `fin_parcela`), mas com a geração real do QR Code/chave isolada atrás da interface
`PixProviderClient` (`pix/provider/`). Hoje ela tem uma implementação `Stub` (gera um registro
"PENDENTE" local).

**Revisão do schema legado (`V3__ajuste_pix.sql`):** como não existe um schema Fiserv de PIX
para comparar, revisei `fin_pix`/`fin_parcela_pix` (`V1__base.sql`) contra o que uma cobrança
PIX real precisa para funcionar de ponta a ponta e encontrei lacunas reais, corrigidas de forma
aditiva:

- `fin_parcela_pix` **não tinha `valor`** — não dava para saber quanto estava sendo cobrado.
  Adicionei `valor`, `valor_pago`, `moeda`.
- Só existia `id_asaas` (acopla a tabela a um PSP específico). Adicionei `provider_charge_id`
  (genérico, funciona com qualquer `PixProviderClient`) e `end_to_end_id` (comprovante oficial
  do Banco Central, para conciliação).
- Só existia `data_vencimento`. Adicionei `data_criacao` e `data_pagamento`.
- `fin_pix` (chave PIX da unidade/loja) não tinha `tipo_chave` (CPF/CNPJ/EMAIL/TELEFONE/ALEATORIA)
  nem `fl_ativo`. Adicionei ambas.

Todas as colunas foram propagadas para o código (`ParcelaPix`, `PixService`, `ParcelaPixResponse`
e `PixProviderClient.PixChargeStatus`, que agora retorna `valorPago`/`endToEndId`). Para produção,
falta apenas:

1. Implementar `PixProviderClient` para o PSP real (ex.: Asaas — o schema já tem a coluna
   `fin_parcela_pix.id_asaas` pronta para isso — ou uma futura API Fiserv Brasil).
2. Trocar a implementação `@ApplicationScoped` (usar `@Alternative` + `@Priority`, ou remover o
   Stub do classpath).

Nenhuma mudança de schema ou de controller é necessária para isso.

---

## 3. Estrutura do projeto

```
pagamento-service/
├── pom.xml
├── .env.example
├── README.md
└── src/main/
    ├── resources/
    │   ├── application.properties
    │   └── db/migration/
    │       ├── V1__base.sql                 (fornecido por você, copiado para o Flyway rodar em ordem)
    │       ├── V2__pagamento_fiserv.sql      (novo — ver seção 4)
    │       └── V3__ajuste_pix.sql            (novo — completa valor/PSP genérico/E2E em fin_parcela_pix)
    └── java/br/com/sol7/olimpio/
        ├── shared/                          (copiado do basico: JWT, exceptions, PagedResponse)
        │   └── security/
        └── pagamento/
            ├── gateway/fiserv/              (integração Fiserv: HMAC, DTOs, client, service)
            │   └── dto/
            ├── cartaopessoa/                (fin_cartao_pessoa — cadastro de cartão)
            ├── parcelacartao/               (fin_parcela_cartao — cobrança à vista/parcelado)
            ├── pix/                         (fin_pix/fin_parcela_pix — cobrança PIX)
            │   └── provider/                (ponto de extensão para o PSP real)
            ├── parcela/                     (leitura/vínculo de fin_parcela)
            └── pagamento/                   (orquestração — endpoint único)
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
`V1__base.sql`, foram reaproveitadas como estão.

### Como rodar

O Flyway já está configurado para migrar automaticamente (`quarkus.flyway.migrate-at-start`,
controlado por `FLYWAY_MIGRATE_AT_START` no `.env`). Se preferir rodar manualmente:

```bash
psql -h localhost -U postgres -d olimpio -f src/main/resources/db/migration/V2__pagamento_fiserv.sql
psql -h localhost -U postgres -d olimpio -f src/main/resources/db/migration/V3__ajuste_pix.sql
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

### PIX — `/api/pagamento/pix`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/pagamento/pix` | Gera uma cobrança PIX para uma parcela |
| `GET`  | `/api/pagamento/pix/{id}` | Consulta uma cobrança PIX |
| `POST` | `/api/pagamento/pix/{id}/atualizar-status` | Atualiza a situação junto ao provider |

```bash
curl -X POST http://localhost:8085/api/pagamento/pix \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"idParcela": 503, "idPessoa": 1, "valor": 150.00, "dataVencimento": "2026-08-20"}'
```

### Endpoint único — `/api/pagamento`

Ponto de entrada único que recebe `formaPagamento` (`PIX`, `CARTAO_VISTA` ou
`CARTAO_PARCELADO`) e despacha internamente para os módulos acima:

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
- **JWT** compartilhado com o `basico-service` protege todas as rotas.
- Tabelas novas seguem exatamente a convenção (`IF NOT EXISTS`, `DO $$` idempotente,
  nomenclatura `fin_*`) do `V1__base.sql`, para minimizar risco de conflito.

## 9. Não incluído neste MVP (próximos passos sugeridos)

- Estorno/cancelamento (`PATCH /v2/payments/{id}`) e webhooks de confirmação assíncrona da Fiserv.
- Retry/idempotência mais robusta em falhas de rede com a Fiserv.
- Implementação real de `PixProviderClient` (hoje é um Stub — ver seção 2).
- Publicação de evento Kafka `olimpio.pagamento.confirmado` (tópico já configurado em
  `application.properties`, falta o `Emitter` nos services).

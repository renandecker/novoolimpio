# De-Para — Sistemas legados JSF (acesoalunoprofessor.zip / olimpioassas.zip) → microserviços Quarkus + React

Referências:
- Legado (referência funcional mais nova): `olimpioassas.zip` (contém `api/asaas`).
- Legado antigo: `acesoalunoprofessor.zip` (contém `gmail/sendgrip`).
- Schema real do banco (ground truth de tabelas/colunas): `docker/postgres/olimpio.sql`.
- Stack nova: microserviços Quarkus (Hibernate Reactive/Panache, `database.generation=none`) + `web-react`.

Convenções adotadas na migração:
- Relacionamentos `@ManyToOne`/`@OneToOne` do legado são representados por colunas `*_id` (FK) do tipo `Long` (referências cross-service).
- Enums (`Motivo`, `TipoMovimentacao`, `TipoFormaPagamento`) são persistidos como `String` (coluna `text` no banco).
- Tabelas `*_aud` (Hibernate Envers) **não** são migradas (auditoria fica fora de escopo).

---

## 1. Microserviço `estoque`

### 1.1 Entidades e tabelas

| Tabela (banco real) | Entidade legado (JSF) | Entidade nova (pacote `estoque`) | Situação atual | Ação |
|---|---|---|---|---|
| `est_produto` | `estoque.Produto` | `produto.entity.Produto` | Parcial (faltam `id_marca`, unidades, fornecedores, campos) | Corrigir |
| `est_controle_estoque` | `estoque.ControleEstoque` | `controleestoque.entity.ControleEstoque` | Parcial (faltam `valor`, `qtde_solicitado`, `qtde_defeito`, `qtde_falta`, `qtde_naoencontrado`, `qtde_reservado`, `qtde_aprovadonaoentregue`) | Corrigir |
| `est_movimentacao_estoque` | `estoque.MovimentacaoEstoque` | `movimentacaoproduto.entity.MovimentacaoProduto` | **Placeholder** (`nome`, `dadosJson`, tabela `movimentacao_produto`) | Corrigir (renomear p/ `MovimentacaoEstoque`) |
| `est_solicitacao_estoque` | `estoque.SolicitacaoEstoque` | — | Não existe | Criar |
| `est_controle_pedidos` | `estoque.ControlePedidos` | — | Não existe | Criar |
| `est_controle_entrega` | `estoque.ControleEntrega` | — | Não existe | Criar |
| `est_entrega_pedido` | join `ControleEntrega.pedidos` / `ControlePedidos.entregas` | — | Não existe | Criar (join) |
| `est_pendencia_venda_produto` | `estoque.PendenciaVendaProduto` | — | Não existe | Criar |
| `est_produto_campo` | `estoque.ProdutoCampo` | `configuracaoproduto.entity.ConfiguracaoProduto` | **Placeholder** (`nome`, `dadosJson`, tabela `configuracao_produto`) | Corrigir (renomear p/ `ProdutoCampo`) |
| `est_produto_campo_informacao` | `estoque.ProdutoCampoInformacao` | — | Não existe | Criar |
| `est_produto_unidade` | join `Produto.unidades` (tabela join) | — | Não existe | Criar (join) |
| `est_produto_fornecedor` | join `Produto.fornecedores` (tabela join) | — | Não existe | Criar (join) |
| `est_marca` | `estoque.Marca` | — | Não existe | Criar |
| `est_entrega` | `estoque.Entrega` | `entrega.entity.Entrega` | OK | — |
| `est_configuracao_estoque` | `estoque.ConfiguracaoEstoque` | `configuracaoestoque.entity.ConfiguracaoEstoque` | OK | — |
| `fin_venda_produto` | `financeiro.VendaProduto` | `vendaproduto.entity.VendaProduto` | OK | — |

### 1.2 Colunas por tabela (ground truth do `olimpio.sql`)

**`est_produto`**
```
id, nome, tamanho, valor, id_marca, dt_cadastrado, imagem, ativo, quantidade, id_categoria
```
Faltam no atual: `id_marca`.

**`est_controle_estoque`**
```
id, valor, quantidade, id_produto, id_unidade,
qtde_solicitado, qtde_defeito, qtde_falta, qtde_naoencontrado, qtde_reservado, qtde_aprovadonaoentregue
```
Faltam no atual: `valor`, `qtde_solicitado`, `qtde_defeito`, `qtde_falta`, `qtde_naoencontrado`, `qtde_reservado`, `qtde_aprovadonaoentregue`.

**`est_movimentacao_estoque`**
```
id, valor, quantidade, tipo, id_venda, id_usuario, id_produto, id_unidade,
dt_movimento, fl_central, id_fornecedor, id_central
```

**`est_solicitacao_estoque`**
```
id, valor, quantidade, id_venda, id_usuario, id_produto, id_unidade,
dt_solicitacao, ativo, motivo, id_motivo
```

**`est_controle_pedidos`**
```
id, dt_entrega, dt_aprovacao, dt_previsao, valor, quantidade, id_usuario,
id_solicitacao_estoque, id_movimentacao_estoque, id_produto, id_unidade, fl_aprovado
```

**`est_controle_entrega`**
```
id, quantidade, codigo_rastreio, status, dt_saida, id_entrega, id_usuario, fl_ativo
```

**`est_entrega_pedido`** (join)
```
id_entrega, id_pedido
```

**`est_pendencia_venda_produto`**
```
id, id_venda, id_produto, quantidade, dt_entrega
```

**`est_produto_campo`**
```
id (bigint), id_campo, obrigatorio, ordem
```

**`est_produto_campo_informacao`**
```
id (bigint), valor, id_produto, id_campo
```

**`est_produto_unidade`** / **`est_produto_fornecedor`** (joins)
```
id_produto, id_unidade        → est_produto_unidade
id_produto, id_fornecedor     → est_produto_fornecedor
```

**`est_marca`**
```
id, descricao
```

**`est_entrega`** (ok no atual)
```
id, descricao, area, zoom, id_pessoa, longitude, latitude
```

**`est_configuracao_estoque`** (ok no atual)
```
id, fl_estoque_central, dias_previsao, id_usuario, id_unidade, email, zoom, area
```

**`fin_venda_produto`** (ok no atual)
```
id, id_unidade, id_pessoa, id_usuario, data_compra, forma_pagamento, valor, quantidade, id_forma_pagamento
```

### 1.3 Enums

| Enum legado | Valores | Persistência nova |
|---|---|---|
| `TipoMovimentacao` | ENTRADA, SAIDA | `String` na coluna `est_movimentacao_estoque.tipo` |
| `Motivo` | SOLICITADO, NAOENCONTRATO, FALTA, DEFEITO, RESERVADO | `String` na coluna `est_solicitacao_estoque.motivo` (+ `id_motivo` ref. `bas_motivo`) |
| `TipoFormaPagamento` | AVISTA, PARCELA | `String` na coluna `fin_venda_produto.forma_pagamento` |

### 1.4 Controllers legados → novos

| Controller legado (`control.controllers.estoque`) | Módulo novo | Funções principais a portar |
|---|---|---|
| `ProdutoController` | `/api/estoque/produto` | CRUD; `autoComplete`; unidades/fornecedores por produto; prospecto/dynaform (UI) |
| `ControleEstoqueController` | `/api/estoque/controle-estoque` | CRUD; `autoComplete`; `autoCompleteComUnidade`; `buscarExistenciaProduto`; `buscarItenUnidade`; calendário de solicitações/pedidos; mapa; entregas; `confirmarEntrega`; consulta rastreio (Correios) |
| `MovimentacaoProdutoController` | `/api/estoque/movimentacao-estoque` | CRUD de movimentação; `saveOrUpdate` força `TipoMovimentacao.ENTRADA` + data de movimento + atualiza `ControleEstoque.quantidade`; `calcularValor` |
| `EstoqueProdutoController` | `/api/estoque/estoque-produto` | Tela "Estoque do Produto": solicitar item (Motivo), registrar entrada (`salvaEntrada`), pendências de venda (`salvaPendenciaEntregue`), contadores defeito/falta/solicitado/nao-encontrado/reservado/aprovado-nao-entregue |
| `ConfiguracaoProdutoController` | `/api/estoque/configuracao-produto` | Configuração dos campos dinâmicos do produto (`ProdutoCampo`); `saveAll`/`deleteAll` |
| `ConfiguracaoEstoqueController` | `/api/estoque/configuracao-estoque` | CRUD (já ok) |
| `EntregaController` | `/api/estoque/entrega` | CRUD (já ok) |
| `VendaProdutoController` | `/api/estoque/venda-produto` | CRUD (já ok); no legado mais novo (assas) `formaPagamento` é `ValorProduto` único |

---

## 2. Material escolar (matrícula/currículo) — microserviço `educacao`

| Tabela (banco real) | Entidade legada | Entidade nova (pacote `educacao`) | Situação | Ação |
|---|---|---|---|---|
| `edc_material_escolar_curso` | `educacao.MaterialEscolarCurso` | — | Não existe | Criar |
| `edc_material_escolar_matricula` | `educacao.MaterialEscolarMatricula` | — | Não existe | Criar |

**`edc_material_escolar_curso`**
```
id, id_produto (→ est_produto), id_curriculo (→ edc_curriculo), quantidade
```

**`edc_material_escolar_matricula`**
```
id, id_produto (→ est_controle_estoque), id_matricula (→ edc_matricula), quantidade_curso, quantidade_compra
```

Fluxo legado (a portar):
- **Currículo** (`CurriculoController`): na edição, carrega todos os produtos → lista `MaterialEscolarCurso` (quantidade por produto); salva os inseridos via `materialEscolarCursoService.save`.
- **Matrícula** (`MatriculaController`, aba `tabMaterial`): `controleEstoqueService.buscarItenUnidade(unidade)` + `materialEscolarCursoService.buscarMaterialEscolarCursoPeloOferecimento(curriculo)` → monta `MaterialEscolarMatricula` (quantidadeCurso = qtd do currículo; quantidadeCompra = digitado pelo usuário) → `vendaProdutoController.finalizarCompraPorMatricula(unidade, pessoa)`.

---

## 3. Telas React

| Tela atual (arquivo em `web-react/src/screens`) | Estado atual | Ação |
|---|---|---|
| `ViewEstoqueEstoqueprodutoListScreen.tsx` | `DataTable path="/api/view/estoque/estoqueproduto"` genérico | Trocar por tela detalhada (controle de estoque por unidade + entrada + solicitação + pendência) |
| `ViewEstoqueControleestoqueListScreen.tsx` | `DataTable path="/api/view/estoque/controleestoque"` genérico | Trocar por tela com filtro de unidade, contadores (defeito/falta/solicitado/...), mapa/calendário |
| `ViewMovimentacaoFormMovimentacaoEstoqueListScreen.tsx` | `DataTable path="/api/view/movimentacao/formMovimentacaoEstoque"` genérico | Trocar por tela de movimentação (entrada de produto → atualiza controle) |
| `ViewMatriculaFormMatriculaListScreen.tsx` | `Wizard`; aba `tabMaterial` aponta `/api/estoque/venda-produto` | Aba Material deve usar `edc_material_escolar_matricula` (quantidadeCurso × quantidadeCompra por produto) |
| `ViewCurriculoFormCurriculoListScreen.tsx` | `Wizard`; aba Material é placeholder `<p>` | Aba Material deve listar `edc_material_escolar_curso` (produto × quantidade) |

Notas:
- `DataTable` genérico consome `/api/view/{feature}/{resource}` (basico `ViewService`) — servem para consulta inicial, mas as telas de estoque precisam de ações (entrada/solicitação/entrega).
- `MasterDetail`/`Wizard`/`masterDetailSources.ts` são os componentes JSF-like disponíveis.

---

## 4. Diffs relevantes entre os dois zips

- `VendaProdutoController`, `MatriculaController`, `CurriculoController`, `Produto.java`, `VendaProduto.java` diferem.
- Versão **assas** é a mais nova: `VendaProduto.formaPagamento` = `ValorProduto` (sem `diasToleranciaMulta`/`valorProduto` separados). Usar assas como referência.
- Schema real (`olimpio.sql`) é mais novo que ambos os zips: `est_produto.id_marca`, `est_controle_estoque.qtd*`, `est_solicitacao_estoque.valor/id_motivo`, `edc_material_escolar_matricula.id_matricula`. **Prevalência: `olimpio.sql` > assas > aceso.**

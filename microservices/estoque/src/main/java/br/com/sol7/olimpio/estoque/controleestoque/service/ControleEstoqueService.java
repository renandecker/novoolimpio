package br.com.sol7.olimpio.estoque.controleestoque;

import br.com.sol7.olimpio.estoque.controleentrega.ControleEntregaService;
import br.com.sol7.olimpio.estoque.entrega.EntregaRepository;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.TupleHelper;
import br.com.sol7.olimpio.estoque.produto.ProdutoRepository;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;

@ApplicationScoped
@WithTransaction
public class ControleEstoqueService {

    @Inject
    ControleEstoqueRepository repository;
    @Inject
    ProdutoRepository produtoRepository;
    @Inject
    ControleEntregaService controleEntregaService;
    @Inject
    EntregaRepository entregaRepository;

    private final Map<Long, String> unidadeCache = new ConcurrentHashMap<>();
    private final Map<Long, String> usuarioCache = new ConcurrentHashMap<>();

    public Uni<List<ControleEstoqueResponse>> list() {
        return repository.listAll().chain(items -> enrichResponses(items.stream().map(this::toResponse).toList()));
    }

    public Uni<List<ControleEstoqueResponse>> listByUnidade(Long unidadeId) {
        return repository.find("unidadeId = ?1", unidadeId).list().chain(items -> enrichResponses(items.stream().map(this::toResponse).toList()));
    }

    public Uni<PagedResponse<ControleEstoqueResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> {
                            var responses = items.stream().map(this::toResponse).toList();
                            return new PagedResponse<>(responses, count, p, s);
                        }));
    }


    public Uni<ControleEstoqueResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControleEstoque not found"))
                .chain(e -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<ControleEstoqueResponse> create(ControleEstoqueRequest r) {
        var e = new ControleEstoque();
        apply(e, r);
        return repository.persist(e).chain(() -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<ControleEstoqueResponse> update(Long id, ControleEstoqueRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControleEstoque not found"))
                .invoke(e -> apply(e, r))
                .chain(e -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ControleEstoque not found")));
    }

    private void apply(ControleEstoque e, ControleEstoqueRequest r) {
        e.valor = r.valor();
        e.quantidade = r.quantidade();
        e.qtdeSolicitado = r.qtdeSolicitado();
        e.qtdeDefeito = r.qtdeDefeito();
        e.qtdeFalta = r.qtdeFalta();
        e.qtdeNaoEncontrado = r.qtdeNaoEncontrado();
        e.qtdeReservado = r.qtdeReservado();
        e.qtdeAprovadoNaoEntregue = r.qtdeAprovadoNaoEntregue();
        e.produtoId = r.produtoId();
        e.unidadeId = r.unidadeId();
    }

    private ControleEstoqueResponse toResponse(ControleEstoque e) {
        return new ControleEstoqueResponse(e.id, e.valor, e.quantidade, e.qtdeSolicitado, e.qtdeDefeito, e.qtdeFalta, e.qtdeNaoEncontrado, e.qtdeReservado, e.qtdeAprovadoNaoEntregue, e.produtoId, e.unidadeId);
    }

    private Uni<ControleEstoqueResponse> enrichSingleResponse(ControleEstoqueResponse r) {
        if (r.produtoId() == null) return Uni.createFrom().item(r);
        return produtoRepository.findById(r.produtoId())
                .map(produto -> {
                    if (produto == null) return r;
                    return new ControleEstoqueResponse(
                            r.id(), r.valor(), r.quantidade(), r.qtdeSolicitado(), r.qtdeDefeito(),
                            r.qtdeFalta(), r.qtdeNaoEncontrado(), r.qtdeReservado(), r.qtdeAprovadoNaoEntregue(),
                            r.produtoId(), r.unidadeId(),
                            produto.nome, produto.imagem, produto.valor, produto.quantidade,
                            null, null, null
                    );
                });
    }

    private Uni<List<ControleEstoqueResponse>> enrichResponses(List<ControleEstoqueResponse> responses) {
        if (responses.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        List<Uni<ControleEstoqueResponse>> unis = responses.stream().map(this::enrichSingleResponse).toList();
        return Uni.join().all(unis).andFailFast();
    }


    // Migrado de ControleEstoqueController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/ControleEstoqueController.java:275, camada controller)
    // Logica original (adaptar):
    // public List<ControleEstoque> autoComplete(String query) {
    //         if (query.equals("")) {
    //             return controleEstoqueService.autoCompleteComUnidade(unidade);
    //         } else {
    //             return controleEstoqueService.autoComplete(query, unidade);
    //         }
    //     }
    public Uni<List<Long>> autoComplete(String query, Long unidadesId) {
        if (unidadesId == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        if (query == null || query.isBlank()) {
            return repository.find("unidadeId = ?1 order by produto.id", unidadesId).list().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoComplete(query.toLowerCase(), unidadesId).map(list -> list.stream().map(x -> x.id).toList());
    }


// Migrado de ControleEstoqueController.carregarMapa (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/ControleEstoqueController.java:344, camada controller)
    // Observacao: parametro controleEntregaId: era ControleEntrega (referencia por id)
    // Logica original (adaptar):
    // public void carregarMapa(ControleEntrega controleEntrega) {
    //         /*	polyline = new Polyline();*/
    //         this.controleEntrega = controleEntrega;
    //         if (controleEntrega != null) {
    //             verificaMapa = true;
    //             advancedModel = new DefaultMapModel();
    //
    //             if (configuracaoEstoqueService.findAll().size() != 0) {
    //                 configuracaoEstoque = configuracaoEstoqueService.findAll().get(0);
    //                 unidadeCentral = configuracaoEstoque.getUnidade();
    //                 int countAcentos = 0;
    //                 String longitude = "";
    // // ... (truncado, ver fonte original)
    public Uni<Map<String, Object>> carregarMapa(Long controleEntregaId) {
        return controleEntregaService.find(controleEntregaId)
                .onItem().ifNull().failWith(() -> new NotFoundException("ControleEntrega not found: " + controleEntregaId))
                .chain(controleEntrega -> {
                    if (controleEntrega.entregaId() == null) {
                        return Uni.createFrom().item(Map.of("error", "Entrega não associada"));
                    }
                    return entregaRepository.findById(controleEntrega.entregaId())
                            .onItem().ifNull().failWith(() -> new NotFoundException("Entrega not found: " + controleEntrega.entregaId()))
                            .map(entrega -> {
                                Map<String, Object> mapData = new HashMap<>();
                                mapData.put("controleEntregaId", controleEntregaId);
                                mapData.put("entregaDescricao", entrega.descricao);
                                mapData.put("entregaArea", entrega.area);
                                mapData.put("entregaZoom", entrega.zoom);
                                mapData.put("entregaLongitude", entrega.longitude);
                                mapData.put("entregaLatitude", entrega.latitude);
                                mapData.put("verificaMapa", true);
                                return mapData;
                            });
                });
    }


    // Migrado de ControleEstoqueController.buscarEstoque (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/ControleEstoqueController.java:771, camada controller)
    // Logica original (adaptar):
    // public void buscarEstoque() {
    //         alerta = false;
    //         Calendar cal = Calendar.getInstance();
    //         Date inicio = DateUtil.somarDias(DateUtil.getPrimeiroDiaDoMes(cal.getTime()), -10);
    //         cal = Calendar.getInstance();
    //         cal.setTime(new Date());
    //         cal.add(Calendar.DAY_OF_YEAR, 10);
    //         Date fim = DateUtil.somarDias(DateUtil.getUltimoDiaDoMes(new Date()), 10);
    //
    //         Long quantidadeSolicitacaoExistente = new Long(0);
    //         quantidadeSolicitacaoExistente = controlePedidosService.listarSolicitacaoUnidadesQtde(usuarioLogadoController.getUnidadesDisponiveis());
    //
    // // ... (truncado, ver fonte original)
    public Uni<Map<String, Object>> buscarEstoque(Long unidadeId) {
        String sql = """
            SELECT ce.id AS id, ce.valor AS valor, ce.quantidade AS quantidade,
                ce.qtde_solicitado AS qtdeSolicitado, ce.qtde_defeito AS qtdeDefeito,
                ce.qtde_falta AS qtdeFalta, ce.qtde_naoencontrado AS qtdeNaoEncontrado,
                ce.qtde_reservado AS qtdeReservado,
                ce.qtde_aprovadonaoentregue AS qtdeAprovadoNaoEntregue,
                ce.id_produto AS produtoId, ce.id_unidade AS unidadeId,
                p.nome AS produtoNome, p.valor AS produtoValor
            FROM est_controle_estoque ce
            INNER JOIN est_produto p ON p.id = ce.id_produto
            WHERE ce.id_unidade = ?
            ORDER BY p.nome
            """;

        return Panache.getSession()
                .chain(s -> s.createNativeQuery(sql, Tuple.class)
                        .setParameter(1, unidadeId)
                        .getResultList())
                .map(rows -> {
                    List<Map<String, Object>> itens = new ArrayList<>();
                    for (Tuple row : rows) {
                        Map<String, Object> item = new HashMap<>();
                        item.put("id", TupleHelper.getLong(row, "id"));
                        item.put("valor", TupleHelper.getBigDecimal(row, "valor"));
                        item.put("quantidade", TupleHelper.getInteger(row, "quantidade"));
                        item.put("qtdeSolicitado", TupleHelper.getInteger(row, "qtdeSolicitado"));
                        item.put("qtdeDefeito", TupleHelper.getInteger(row, "qtdeDefeito"));
                        item.put("qtdeFalta", TupleHelper.getInteger(row, "qtdeFalta"));
                        item.put("qtdeNaoEncontrado", TupleHelper.getInteger(row, "qtdeNaoEncontrado"));
                        item.put("qtdeReservado", TupleHelper.getInteger(row, "qtdeReservado"));
                        item.put("qtdeAprovadoNaoEntregue", TupleHelper.getInteger(row, "qtdeAprovadoNaoEntregue"));
                        item.put("produtoId", TupleHelper.getLong(row, "produtoId"));
                        item.put("unidadeId", TupleHelper.getLong(row, "unidadeId"));
                        item.put("produtoNome", TupleHelper.getString(row, "produtoNome"));
                        item.put("produtoValor", TupleHelper.getBigDecimal(row, "produtoValor"));
                        itens.add(item);
                    }
                    Map<String, Object> result = new HashMap<>();
                    result.put("unidadeId", unidadeId);
                    result.put("itens", itens);
                    result.put("alerta", itens.stream()
                            .anyMatch(i -> ((Number) i.get("quantidade")).intValue() < ((Number) i.get("qtdeSolicitado")).intValue()));
                    return result;
                });
    }


    // Migrado de ControleEstoqueService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/estoque/ControleEstoqueService.java:25, camada service)
    // Observacao: parametro unidadesId: era Unidade (referencia por id)
    // JPQL original: select distinct ce from ControleEstoque ce inner join ce.produto p left join p.produtoCampos lc where ce.unidade = ?2  and (lower(lc.valor) like '%' || ?1 || '%' OR (p.id) like '%' || ?1 || '%')
    // Logica original (adaptar):
    // public List<ControleEstoque> autoComplete(String query, Unidade unidades) {
    //         return this.getControleEstoqueRepository().autoComplete(query.toLowerCase(), unidades, new PageRequest(0, 20)).getContent();
    //     }
    public Uni<List<Long>> autoComplete2(String query, Long unidadesId) {
        return repository.autoComplete(query.toLowerCase(), unidadesId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ControleEstoqueService.autoCompleteComUnidade (src/main/java/br/com/sol7/olimpio/service/services/estoque/ControleEstoqueService.java:29, camada service)
    // Observacao: parametro unidadesId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<ControleEstoque> autoCompleteComUnidade(Unidade unidades) {
    //         return this.getControleEstoqueRepository().autoCompleteComUnidade(unidades);
    //     }
    public Uni<List<Long>> autoCompleteComUnidade(Long unidadesId) {
        return repository.find("unidadeId = ?1 order by produto.id", unidadesId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ControleEstoqueService.buscarExistenciaProduto (src/main/java/br/com/sol7/olimpio/service/services/estoque/ControleEstoqueService.java:33, camada service)
    // Observacao: retorno: era ControleEstoque (referencia por id); parametro unidadeId: era Unidade (referencia por id); parametro produtoId: era Produto (referencia por id)
    // Logica original (adaptar):
    // public ControleEstoque buscarExistenciaProduto(Unidade unidade, Produto produto) {
    //         return getControleEstoqueRepository().buscarExistenciaProduto(unidade, produto);
    //     }
    public Uni<Long> buscarExistenciaProduto(Long unidadeId, Long produtoId) {
        return repository.find("unidadeId = ?1 and produtoId = ?2", unidadeId, produtoId).firstResult().map(x -> x == null ? null : x.id);
    }


    // Migrado de ControleEstoqueService.buscarProdutoEstoque (src/main/java/br/com/sol7/olimpio/service/services/estoque/ControleEstoqueService.java:37, camada service)
    // Observacao: retorno: era ControleEstoque (referencia por id)
    // Logica original (adaptar):
    // public ControleEstoque buscarProdutoEstoque(int produtoestoque) {
    //         return getControleEstoqueRepository().buscarProdutoEstoque(produtoestoque);
    //     }
    public Uni<Long> buscarProdutoEstoque(Integer produtoestoque) {
        return repository.find("id = ?1", produtoestoque).firstResult().map(x -> x == null ? null : x.id);
    }


    // Migrado de ControleEstoqueService.buscarItenUnidade (src/main/java/br/com/sol7/olimpio/service/services/estoque/ControleEstoqueService.java:41, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<ControleEstoque> buscarItenUnidade(Unidade unidade) {
    //         return getControleEstoqueRepository().buscarItenUnidade(unidade);
    //     }
    public Uni<List<Long>> buscarItenUnidade(Long unidadeId) {
        return repository.find("unidadeId = ?1 order by produto.id", unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}

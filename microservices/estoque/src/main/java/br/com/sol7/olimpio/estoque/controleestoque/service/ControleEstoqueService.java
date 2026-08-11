package br.com.sol7.olimpio.estoque.controleestoque;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import java.util.Date;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ControleEstoqueService {

    @Inject ControleEstoqueRepository repository;

    public Uni<List<ControleEstoqueResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ControleEstoqueResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ControleEstoqueResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControleEstoque not found"))
                .map(this::toResponse);
    }

    public Uni<ControleEstoqueResponse> create(ControleEstoqueRequest r) {
        var e = new ControleEstoque();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ControleEstoqueResponse> update(Long id, ControleEstoqueRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControleEstoque not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
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


    // Migrado de ControleEstoqueController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/ControleEstoqueController.java:275, camada controller)
    // Logica original (adaptar):
    // public List<ControleEstoque> autoComplete(String query) {
    //         if (query.equals("")) {
    //             return controleEstoqueService.autoCompleteComUnidade(unidade);
    //         } else {
    //             return controleEstoqueService.autoComplete(query, unidade);
    //         }
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do usuario logado (unidade selecionada) para escolher entre autoCompleteComUnidade e autoComplete
        return Uni.createFrom().item(java.util.List.of());
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
    public Uni<Void> carregarMapa(Long controleEntregaId) {
        // Obs: logica de UI do controlador JSF legado (mapa PrimeFaces/DefaultMapModel), sem equivalente reativo
        return Uni.createFrom().voidItem();
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
    public Uni<Void> buscarEstoque() {
        // Obs: logica de UI do controlador JSF legado (alerta) e depende do servico de ControlePedidos (nao portado)
        return Uni.createFrom().voidItem();
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

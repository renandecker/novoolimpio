package br.com.sol7.olimpio.comercial.prospectolist;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class ProspectoListService { @Inject ProspectoListRepository repository; public Uni<List<ProspectoListResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<ProspectoListResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<ProspectoListResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("ProspectoList not found")).map(this::toResponse);} public Uni<ProspectoListResponse> create(ProspectoListRequest r){var e=new ProspectoList();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<ProspectoListResponse> update(Long id,ProspectoListRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("ProspectoList not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("ProspectoList not found")));} private void apply(ProspectoList e,ProspectoListRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private ProspectoListResponse toResponse(ProspectoList e){return new ProspectoListResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de ProspectoListController.carregarQuantidadeLigacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoListController.java:140, camada controller)
    // Observacao: parametro prospectoId: era Prospecto (referencia por id)
    // Logica original (adaptar):
    // public void carregarQuantidadeLigacao(Prospecto prospecto) {
    //         ligacaoProspectoList = ligacaoProspectoService.buscarProspectoLigacaoPeloProspecto(prospecto);
    //     }
    public Uni<Void> carregarQuantidadeLigacao(Long prospectoId) {
        // Obs: depende do modulo LigacaoProspecto nao migrado
        return Uni.createFrom().voidItem();
    }


    // Migrado de ProspectoListController.carregarHistoricoLigacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoListController.java:144, camada controller)
    // Observacao: parametro prospectoId: era Prospecto (referencia por id)
    // Logica original (adaptar):
    // public void carregarHistoricoLigacao(Prospecto prospecto) {
    //         historicoLigacoes = ligacaoService.buscarHistoricoTodasLigacaoProspecto(prospecto.getId());
    //     }
    public Uni<Void> carregarHistoricoLigacao(Long prospectoId) {
        // Obs: depende do modulo Ligacao nao migrado
        return Uni.createFrom().voidItem();
    }


    // Migrado de ProspectoListController.carregarProspectosLink (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoListController.java:229, camada controller)
    // Logica original (adaptar):
    // public void carregarProspectosLink() {
    //         prospectoLink = new ProspectoLink();
    // 
    //         FilterProspectoLink filterProspectoLink = new FilterProspectoLink(usuarioLogadoController.getUnidadesDisponiveis());
    //         prospectoLinks = new BaseLazyModelJPASpecific<ProspectoLink>(prospectoLinkService.getProspectoLinkRepository(), filterProspectoLink);
    //     }
    public Uni<Void> carregarProspectosLink() {
        // Obs: metodo de UI (JSF); depende do modulo ProspectoLink nao migrado
        return Uni.createFrom().voidItem();
    }


    // Migrado de ProspectoListController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoListController.java:236, camada controller)
    // Observacao: parametro entityId: era Prospecto (referencia por id)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao(Prospecto entity) {
    //         dynaFormModelAtual = new DynaFormModel();
    //         ProspectoUtil.carregarProspectoParaVisualizacao(prospectoService.buscaProspectoComCampos(entity.getId()), getDynaFormModelAtual());
    //     }
    public Uni<Void> carregarProspectoParaVisualizacao(Long entityId) {
        // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
        return Uni.createFrom().voidItem();
    }

}
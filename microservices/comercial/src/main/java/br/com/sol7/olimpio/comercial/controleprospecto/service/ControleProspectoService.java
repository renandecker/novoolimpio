package br.com.sol7.olimpio.comercial.controleprospecto;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class ControleProspectoService { @Inject ControleProspectoRepository repository; public Uni<List<ControleProspectoResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<ControleProspectoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<ControleProspectoResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("ControleProspecto not found")).map(this::toResponse);} public Uni<ControleProspectoResponse> create(ControleProspectoRequest r){var e=new ControleProspecto();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<ControleProspectoResponse> update(Long id,ControleProspectoRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("ControleProspecto not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("ControleProspecto not found")));} private void apply(ControleProspecto e,ControleProspectoRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private ControleProspectoResponse toResponse(ControleProspecto e){return new ControleProspectoResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de ControleProspectoController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ControleProspectoController.java:139, camada controller)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao(int id) {
    //         dynaFormModelAtual = new DynaFormModel();
    //         Prospecto p = prospectoService.buscaProspectoComCampos(Integer.valueOf(id));
    //         ProspectoUtil.carregarProspectoParaVisualizacao(p, getDynaFormModelAtual());
    //     }
    public Uni<Void> carregarProspectoParaVisualizacao(Integer id) {
        // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
        return Uni.createFrom().voidItem();
    }


    // Migrado de ControleProspectoController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ControleProspectoController.java:145, camada controller)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao(String id) {
    //         dynaFormModelAtual = new DynaFormModel();
    //         Prospecto p = prospectoService.buscaProspectoComCampos(Integer.valueOf(id));
    //         ProspectoUtil.carregarProspectoParaVisualizacao(p, getDynaFormModelAtual());
    //     }
    public Uni<Void> carregarProspectoParaVisualizacao2(String id) {
        // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
        return Uni.createFrom().voidItem();
    }


    // Migrado de ControleProspectoController.carregarOutrosProspecto (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ControleProspectoController.java:151, camada controller)
    // Logica original (adaptar):
    // public void carregarOutrosProspecto(String id, String valor) {
    //         prospectos = prospectoService.buscarOutrosProspectosComValorComCampo(Integer.valueOf(id), valor, campo);
    //         prospecto = prospectoService.findById(Integer.valueOf(id));
    //     }
    public Uni<Void> carregarOutrosProspecto(String id, String valor) {
        // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
        return Uni.createFrom().voidItem();
    }

}
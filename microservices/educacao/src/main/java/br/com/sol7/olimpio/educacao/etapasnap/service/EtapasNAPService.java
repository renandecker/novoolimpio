package br.com.sol7.olimpio.educacao.etapasnap;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class EtapasNAPService {

    @Inject EtapasNAPRepository repository;

    public Uni<List<EtapasNAPResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EtapasNAPResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<EtapasNAPResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("EtapasNAP not found"))
                .map(this::toResponse);
    }

    public Uni<EtapasNAPResponse> create(EtapasNAPRequest r) {
        var e = new EtapasNAP();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EtapasNAPResponse> update(Long id, EtapasNAPRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("EtapasNAP not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("EtapasNAP not found")));
    }

    private void apply(EtapasNAP e, EtapasNAPRequest r) { e.descricao = r.descricao(); e.usuario = r.usuario(); e.perfil = r.perfil(); e.campoCustomizado = r.campoCustomizado(); e.tipoModeloDocumento = r.tipoModeloDocumento(); e.localDocumento = r.localDocumento(); e.nomeDocumento = r.nomeDocumento(); e.campoDetalhes = r.campoDetalhes(); e.customizado = r.customizado(); e.ordem = r.ordem(); }

    private EtapasNAPResponse toResponse(EtapasNAP e) {
        return new EtapasNAPResponse(e.id, e.descricao, e.usuario, e.perfil, e.campoCustomizado, e.tipoModeloDocumento, e.localDocumento, e.nomeDocumento, e.campoDetalhes, e.customizado, e.ordem);
    }


    // Migrado de EtapasNAPController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/EtapasNAPController.java:267, camada controller)
    // Logica original (adaptar):
    // public List<EtapasNAP> autoComplete(String query) {
    //         return etapasNAPService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

}

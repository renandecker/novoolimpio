package br.com.sol7.olimpio.educacao.basetecnologica;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class BaseTecnologicaService {

    @Inject BaseTecnologicaRepository repository;

    public Uni<List<BaseTecnologicaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<BaseTecnologicaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<BaseTecnologicaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("BaseTecnologica not found"))
                .map(this::toResponse);
    }

    public Uni<BaseTecnologicaResponse> create(BaseTecnologicaRequest r) {
        var e = new BaseTecnologica();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<BaseTecnologicaResponse> update(Long id, BaseTecnologicaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("BaseTecnologica not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("BaseTecnologica not found")));
    }

    private void apply(BaseTecnologica e, BaseTecnologicaRequest r) { e.descricao = r.descricao(); e.nome = r.nome(); }

    private BaseTecnologicaResponse toResponse(BaseTecnologica e) {
        return new BaseTecnologicaResponse(e.id, e.descricao, e.nome);
    }


    // Migrado de BaseTecnologicaController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/BaseTecnologicaController.java:90, camada controller)
    // Logica original (adaptar):
    // public List<BaseTecnologica> autoComplete(String query) {
    //         return baseTecnologicaService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query).map(list -> list.stream().map(x -> x.id).toList());
    }

}

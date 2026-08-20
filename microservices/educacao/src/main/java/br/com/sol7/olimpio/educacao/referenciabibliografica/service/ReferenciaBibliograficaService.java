package br.com.sol7.olimpio.educacao.referenciabibliografica;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ReferenciaBibliograficaService {

    @Inject
    ReferenciaBibliograficaRepository repository;

    public Uni<List<ReferenciaBibliograficaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ReferenciaBibliograficaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ReferenciaBibliograficaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ReferenciaBibliografica not found"))
                .map(this::toResponse);
    }

    public Uni<ReferenciaBibliograficaResponse> create(ReferenciaBibliograficaRequest r) {
        var e = new ReferenciaBibliografica();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ReferenciaBibliograficaResponse> update(Long id, ReferenciaBibliograficaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ReferenciaBibliografica not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ReferenciaBibliografica not found")));
    }

    private void apply(ReferenciaBibliografica e, ReferenciaBibliograficaRequest r) {
        e.autor = r.autor();
        e.titulo = r.titulo();
        e.volume = r.volume();
    }

    private ReferenciaBibliograficaResponse toResponse(ReferenciaBibliografica e) {
        return new ReferenciaBibliograficaResponse(e.id, e.autor, e.titulo, e.volume);
    }


    // Migrado de ReferenciaBibliograficaController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ReferenciaBibliograficaController.java:93, camada controller)
    // Logica original (adaptar):
    // public List<ReferenciaBibliografica> autoComplete(String query) {
    //         return referenciaBibliograficaService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query).map(list -> list.stream().map(x -> x.id).toList());
    }

}


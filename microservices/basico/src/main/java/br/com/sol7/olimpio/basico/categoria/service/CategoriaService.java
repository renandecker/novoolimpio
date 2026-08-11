package br.com.sol7.olimpio.basico.categoria.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.categoria.dto.CategoriaRequest;
import br.com.sol7.olimpio.basico.categoria.dto.CategoriaResponse;
import br.com.sol7.olimpio.basico.categoria.entity.Categoria;
import br.com.sol7.olimpio.basico.categoria.repository.CategoriaRepository;

@ApplicationScoped
@WithTransaction
public class CategoriaService {

    @Inject CategoriaRepository repository;

    public Uni<List<CategoriaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CategoriaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CategoriaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Categoria not found"))
                .map(this::toResponse);
    }

    public Uni<CategoriaResponse> create(CategoriaRequest r) {
        var e = new Categoria();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CategoriaResponse> update(Long id, CategoriaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Categoria not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Categoria not found")));
    }

    private void apply(Categoria e, CategoriaRequest r) { e.descricao = r.descricao(); e.descricaocompleta = r.descricaocompleta(); e.categoriaId = r.categoriaId(); }

    private CategoriaResponse toResponse(Categoria e) {
        return new CategoriaResponse(e.id, e.descricao, e.descricaocompleta, e.categoriaId);
    }


    // Migrado de CategoriaController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CategoriaController.java:64, camada controller)
    // Logica original (adaptar):
    // public List<Categoria> autoComplete(String query) {
    //         return categoriaService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

}

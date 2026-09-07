package br.com.sol7.olimpio.relatorios.dimensao;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class DimensaoService {

    @Inject
    DimensaoRepository repository;

    public Uni<List<DimensaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<DimensaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<DimensaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Dimensao not found"))
                .map(this::toResponse);
    }

    public Uni<DimensaoResponse> create(DimensaoRequest r) {
        var e = new Dimensao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<DimensaoResponse> update(Long id, DimensaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Dimensao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Dimensao not found")));
    }

    public Uni<List<Long>> autoComplete(String query) {
        // Simplified - would need estruturaId for proper filtering
        return repository.find("(lower(nomeVisualizacao) like ?1 or lower(tipo) like ?1)", "%" + query.toLowerCase() + "%")
                .page(0, 10)
                .list()
                .map(list -> list.stream().map(e -> e.id).toList());
    }

    private void apply(Dimensao e, DimensaoRequest r) {
        e.tipo = r.tipo();
        e.tipoInfo = r.tipoInfo();
        e.nomeVisualizacao = r.nomeVisualizacao();
        e.estruturaColunaId = r.estruturaColunaId();
        e.estruturaId = r.estruturaId();
    }

    private DimensaoResponse toResponse(Dimensao e) {
        return new DimensaoResponse(e.id, e.tipo, e.tipoInfo, e.nomeVisualizacao, e.estruturaColunaId, e.estruturaId);
    }
}
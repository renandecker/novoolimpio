package br.com.sol7.olimpio.educacao.apresentacaovideo;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ApresentacaoVideoService {

    @Inject
    ApresentacaoVideoRepository repository;

    public Uni<List<ApresentacaoVideoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ApresentacaoVideoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ApresentacaoVideoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ApresentacaoVideo not found"))
                .map(this::toResponse);
    }

    public Uni<ApresentacaoVideoResponse> create(ApresentacaoVideoRequest r) {
        var e = new ApresentacaoVideo();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ApresentacaoVideoResponse> update(Long id, ApresentacaoVideoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ApresentacaoVideo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ApresentacaoVideo not found")));
    }

    private void apply(ApresentacaoVideo e, ApresentacaoVideoRequest r) {
        e.titulo = r.titulo();
        e.local = r.local();
    }

    private ApresentacaoVideoResponse toResponse(ApresentacaoVideo e) {
        return new ApresentacaoVideoResponse(e.id, e.titulo, e.local);
    }
}

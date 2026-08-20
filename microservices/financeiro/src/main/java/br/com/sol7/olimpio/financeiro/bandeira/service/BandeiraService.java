package br.com.sol7.olimpio.financeiro.bandeira;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class BandeiraService {

    @Inject
    BandeiraRepository repository;

    public Uni<List<BandeiraResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<BandeiraResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<BandeiraResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Bandeira not found"))
                .map(this::toResponse);
    }

    public Uni<BandeiraResponse> create(BandeiraRequest r) {
        var e = new Bandeira();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<BandeiraResponse> update(Long id, BandeiraRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Bandeira not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Bandeira not found")));
    }

    private void apply(Bandeira e, BandeiraRequest r) {
        e.descricao = r.descricao();
        e.quantidadeParcelas = r.quantidadeParcelas();
    }

    private BandeiraResponse toResponse(Bandeira e) {
        return new BandeiraResponse(e.id, e.descricao, e.quantidadeParcelas);
    }
}

package br.com.sol7.olimpio.basico.regiao.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.regiao.dto.RegiaoRequest;
import br.com.sol7.olimpio.basico.regiao.dto.RegiaoResponse;
import br.com.sol7.olimpio.basico.regiao.entity.Regiao;
import br.com.sol7.olimpio.basico.regiao.repository.RegiaoRepository;

@ApplicationScoped
@WithTransaction
public class RegiaoService {

    @Inject RegiaoRepository repository;

    public Uni<List<RegiaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<RegiaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<RegiaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Regiao not found"))
                .map(this::toResponse);
    }

    public Uni<RegiaoResponse> create(RegiaoRequest r) {
        var e = new Regiao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<RegiaoResponse> update(Long id, RegiaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Regiao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Regiao not found")));
    }

    private void apply(Regiao e, RegiaoRequest r) { e.descricao = r.descricao(); }

    private RegiaoResponse toResponse(Regiao e) {
        return new RegiaoResponse(e.id, e.descricao);
    }
}

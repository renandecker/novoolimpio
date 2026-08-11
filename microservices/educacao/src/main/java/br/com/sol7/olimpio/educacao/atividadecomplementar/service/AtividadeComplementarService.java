package br.com.sol7.olimpio.educacao.atividadecomplementar;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class AtividadeComplementarService {

    @Inject AtividadeComplementarRepository repository;

    public Uni<List<AtividadeComplementarResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AtividadeComplementarResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<AtividadeComplementarResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("AtividadeComplementar not found"))
                .map(this::toResponse);
    }

    public Uni<AtividadeComplementarResponse> create(AtividadeComplementarRequest r) {
        var e = new AtividadeComplementar();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AtividadeComplementarResponse> update(Long id, AtividadeComplementarRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("AtividadeComplementar not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("AtividadeComplementar not found")));
    }

    private void apply(AtividadeComplementar e, AtividadeComplementarRequest r) { e.descricao = r.descricao(); e.cargaHoraria = r.cargaHoraria(); e.tipoAtividadeId = r.tipoAtividadeId(); }

    private AtividadeComplementarResponse toResponse(AtividadeComplementar e) {
        return new AtividadeComplementarResponse(e.id, e.descricao, e.cargaHoraria, e.tipoAtividadeId);
    }
}

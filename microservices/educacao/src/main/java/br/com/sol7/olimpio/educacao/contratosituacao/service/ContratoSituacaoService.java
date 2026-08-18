package br.com.sol7.olimpio.educacao.contratosituacao;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ContratoSituacaoService {

    @Inject ContratoSituacaoRepository repository;

    public Uni<List<ContratoSituacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ContratoSituacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ContratoSituacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ContratoSituacao not found"))
                .map(this::toResponse);
    }

    public Uni<ContratoSituacaoResponse> create(ContratoSituacaoRequest r) {
        var e = new ContratoSituacao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ContratoSituacaoResponse> update(Long id, ContratoSituacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ContratoSituacao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ContratoSituacao not found")));
    }

    private void apply(ContratoSituacao e, ContratoSituacaoRequest r) { e.descricao = r.descricao(); e.sucinto = r.sucinto(); e.fl_aprovado = r.fl_aprovado(); }

    private ContratoSituacaoResponse toResponse(ContratoSituacao e) {
        return new ContratoSituacaoResponse(e.id, e.descricao, e.sucinto, e.fl_aprovado);
    }
}


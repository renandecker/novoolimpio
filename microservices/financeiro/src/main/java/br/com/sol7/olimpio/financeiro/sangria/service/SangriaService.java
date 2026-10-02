package br.com.sol7.olimpio.financeiro.sangria.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.financeiro.sangria.entity.Sangria;
import br.com.sol7.olimpio.financeiro.sangria.repository.SangriaRepository;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaRequest;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaResponse;

@ApplicationScoped
@WithTransaction
public class SangriaService {
    @Inject
    SangriaRepository repository;

    public Uni<List<SangriaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<SangriaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count().map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<SangriaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Sangria não encontrada")).map(this::toResponse);
    }

    // listagem de sangrias do caixa (usada tambem por CaixaService.registrarSangria)
    public Uni<List<SangriaResponse>> buscarPorCaixa(Long caixaId) {
        return repository.buscarPorCaixa(caixaId).map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<SangriaResponse> create(SangriaRequest r) {
        var e = new Sangria();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<SangriaResponse> update(Long id, SangriaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Sangria não encontrada")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Sangria não encontrada")));
    }

    void apply(Sangria e, SangriaRequest r) {
        e.caixaId = r.caixaId();
        e.data = r.data() != null ? r.data() : new java.util.Date();
        e.valor = r.valor();
    }

    SangriaResponse toResponse(Sangria e) {
        return new SangriaResponse(e.id, e.caixaId, e.data, e.valor);
    }
}

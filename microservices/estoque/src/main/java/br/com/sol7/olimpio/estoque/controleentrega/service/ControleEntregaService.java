package br.com.sol7.olimpio.estoque.controleentrega;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ControleEntregaService {

    @Inject ControleEntregaRepository repository;

    public Uni<List<ControleEntregaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ControleEntregaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ControleEntregaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControleEntrega not found"))
                .map(this::toResponse);
    }

    public Uni<ControleEntregaResponse> create(ControleEntregaRequest r) {
        var e = new ControleEntrega();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ControleEntregaResponse> update(Long id, ControleEntregaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControleEntrega not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ControleEntrega not found")));
    }

    // Migrado de ControleEntregaService.entregasproUnidade (legado)
    public Uni<List<ControleEntregaResponse>> entregasPorUnidade(Long unidadeId) {
        return repository.entregasPorUnidade(unidadeId).map(items -> items.stream().map(this::toResponse).toList());
    }

    private void apply(ControleEntrega e, ControleEntregaRequest r) {
        e.ativo = r.ativo();
        e.quantidade = r.quantidade();
        e.status = r.status();
        e.dataSaida = r.dataSaida();
        e.rastreio = r.rastreio();
        e.entregaId = r.entregaId();
        e.usuarioId = r.usuarioId();
    }

    private ControleEntregaResponse toResponse(ControleEntrega e) {
        return new ControleEntregaResponse(e.id, e.ativo, e.quantidade, e.status, e.dataSaida, e.rastreio, e.entregaId, e.usuarioId);
    }
}

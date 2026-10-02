package br.com.sol7.olimpio.estoque.entrega;

import br.com.sol7.olimpio.estoque.controleentrega.ControleEntregaService;
import br.com.sol7.olimpio.estoque.controleentrega.ControleEntregaResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class EntregaService {

    @Inject
    EntregaRepository repository;

    @Inject
    ControleEntregaService controleEntregaService;

    public Uni<List<EntregaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EntregaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<EntregaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Entrega not found"))
                .map(this::toResponse);
    }

    public Uni<EntregaResponse> create(EntregaRequest r) {
        var e = new Entrega();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EntregaResponse> update(Long id, EntregaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Entrega not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Entrega not found")));
    }

    private void apply(Entrega e, EntregaRequest r) {
        e.descricao = r.descricao();
        e.area = r.area();
        e.zoom = r.zoom();
        e.longitude = r.longitude();
        e.latitude = r.latitude();
        e.pessoaId = r.pessoaId();
    }

    private EntregaResponse toResponse(Entrega e) {
        return new EntregaResponse(e.id, e.descricao, e.area, e.zoom, e.longitude, e.latitude, e.pessoaId);
    }

    public Uni<List<Long>> autoCompleteControleEntrega(String query, Long unidadeId) {
        if (unidadeId != null) {
            if (query != null && !query.isBlank()) {
                return controleEntregaService.autoCompleteComUnidade(query, unidadeId)
                        .map(list -> list.stream().map(ControleEntregaResponse::id).toList());
            } else {
                return controleEntregaService.controleEntregaComUnidade(unidadeId)
                        .map(list -> list.stream().map(ControleEntregaResponse::id).toList());
            }
        } else {
            // Sem unidade específica - buscar todas as unidades disponíveis (simplificado)
            if (query != null && !query.isBlank()) {
                return controleEntregaService.autoComplete(query)
                        .map(list -> list.stream().map(ControleEntregaResponse::id).toList());
            } else {
                return controleEntregaService.list()
                        .map(list -> list.stream().map(ControleEntregaResponse::id).toList());
            }
        }
    }

}

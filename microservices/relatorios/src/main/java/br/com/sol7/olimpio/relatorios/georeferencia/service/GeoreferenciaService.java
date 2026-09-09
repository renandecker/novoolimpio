package br.com.sol7.olimpio.relatorios.georeferencia.service;
import br.com.sol7.olimpio.relatorios.georeferencia.dto.GeoreferenciaRequest;
import br.com.sol7.olimpio.relatorios.georeferencia.dto.GeoreferenciaResponse;
import br.com.sol7.olimpio.relatorios.georeferencia.entity.Georeferencia;
import br.com.sol7.olimpio.relatorios.georeferencia.repository.GeoreferenciaRepository;

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
public class GeoreferenciaService {

    @Inject
    GeoreferenciaRepository repository;

    public Uni<List<GeoreferenciaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GeoreferenciaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<GeoreferenciaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Georeferencia not found"))
                .map(this::toResponse);
    }

    public Uni<GeoreferenciaResponse> create(GeoreferenciaRequest r) {
        var e = new Georeferencia();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GeoreferenciaResponse> update(Long id, GeoreferenciaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Georeferencia not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Georeferencia not found")));
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.find("(lower(nomeVisualizacao) like ?1)", "%" + query.toLowerCase() + "%")
                .page(0, 10)
                .list()
                .map(list -> list.stream().map(e -> e.id).toList());
    }

    private void apply(Georeferencia e, GeoreferenciaRequest r) {
        e.nomeVisualizacao = r.nomeVisualizacao();
        e.estruturaColunaId = r.estruturaColunaId();
        e.estruturaId = r.estruturaId();
    }

    private GeoreferenciaResponse toResponse(Georeferencia e) {
        return new GeoreferenciaResponse(e.id, e.nomeVisualizacao, e.estruturaColunaId, e.estruturaId);
    }
}
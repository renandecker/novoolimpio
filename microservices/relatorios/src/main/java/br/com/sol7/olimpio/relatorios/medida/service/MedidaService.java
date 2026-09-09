package br.com.sol7.olimpio.relatorios.medida.service;
import br.com.sol7.olimpio.relatorios.medida.dto.MedidaRequest;
import br.com.sol7.olimpio.relatorios.medida.dto.MedidaResponse;
import br.com.sol7.olimpio.relatorios.medida.entity.Medida;
import br.com.sol7.olimpio.relatorios.medida.repository.MedidaRepository;

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
public class MedidaService {

    @Inject
    MedidaRepository repository;

    public Uni<List<MedidaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MedidaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<MedidaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Medida not found"))
                .map(this::toResponse);
    }

    public Uni<MedidaResponse> create(MedidaRequest r) {
        var e = new Medida();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MedidaResponse> update(Long id, MedidaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Medida not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Medida not found")));
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.find("(lower(nomeVisualizacao) like ?1 or lower(tipo) like ?1)", "%" + query.toLowerCase() + "%")
                .page(0, 10)
                .list()
                .map(list -> list.stream().map(e -> e.id).toList());
    }

    private void apply(Medida e, MedidaRequest r) {
        e.tipo = r.tipo();
        e.tipoInfo = r.tipoInfo();
        e.nomeVisualizacao = r.nomeVisualizacao();
        e.estruturaColunaId = r.estruturaColunaId();
        e.estruturaId = r.estruturaId();
    }

    private MedidaResponse toResponse(Medida e) {
        return new MedidaResponse(e.id, e.tipo, e.tipoInfo, e.nomeVisualizacao, e.estruturaColunaId, e.estruturaId);
    }
}
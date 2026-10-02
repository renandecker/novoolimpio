package br.com.sol7.olimpio.comercial.indicador;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class IndicadorService {

    @Inject
    IndicadorRepository repository;

    public Uni<List<IndicadorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<IndicadorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<IndicadorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Indicador not found"))
                .map(this::toResponse);
    }

    public Uni<IndicadorResponse> create(IndicadorRequest r) {
        var e = new Indicador();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<IndicadorResponse> update(Long id, IndicadorRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Indicador not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Indicador not found")));
    }

    private void apply(Indicador e, IndicadorRequest r) {
        e.nome = r.nome();
        e.data_criacao = r.data_criacao();
        e.formato_indicador = r.formato_indicador();
        e.dia = r.dia();
        e.mes = r.mes();
        e.ano = r.ano();
        e.semana = r.semana();
        e.vinculadoVendedor = r.vinculadoVendedor();
    }

    private IndicadorResponse toResponse(Indicador e) {
        return new IndicadorResponse(e.id, e.nome, e.data_criacao, e.formato_indicador, e.dia, e.mes, e.ano, e.semana, e.vinculadoVendedor);
    }

    public Uni<List<Long>> autoComplete(String query) {
        if (query == null || query.isEmpty()) {
            return repository.indicadorOrder().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

}

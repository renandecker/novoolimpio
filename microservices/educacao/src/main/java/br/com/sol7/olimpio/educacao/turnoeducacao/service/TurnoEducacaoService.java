package br.com.sol7.olimpio.educacao.turnoeducacao;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class TurnoEducacaoService {

    @Inject TurnoEducacaoRepository repository;

    public Uni<List<TurnoEducacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TurnoEducacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TurnoEducacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoEducacao not found"))
                .map(this::toResponse);
    }

    public Uni<TurnoEducacaoResponse> create(TurnoEducacaoRequest r) {
        var e = new TurnoEducacao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<TurnoEducacaoResponse> update(Long id, TurnoEducacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoEducacao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TurnoEducacao not found")));
    }

    private void apply(TurnoEducacao e, TurnoEducacaoRequest r) { e.descricao = r.descricao(); e.sucinto = r.sucinto(); e.inicio = r.inicio(); e.fim = r.fim(); }

    private TurnoEducacaoResponse toResponse(TurnoEducacao e) {
        return new TurnoEducacaoResponse(e.id, e.descricao, e.sucinto, e.inicio, e.fim);
    }


    // Migrado de TurnoEducacaoController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/TurnoEducacaoController.java:81, camada controller)
    // Logica original (adaptar):
    // public List<TurnoEducacao> autoComplete(String query) {
    //         return turnoEducacaoService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

}


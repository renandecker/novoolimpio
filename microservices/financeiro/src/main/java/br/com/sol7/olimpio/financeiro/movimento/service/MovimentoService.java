package br.com.sol7.olimpio.financeiro.movimento;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class MovimentoService {

    @Inject
    MovimentoRepository repository;

    public Uni<List<MovimentoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MovimentoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<MovimentoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Movimento not found"))
                .map(this::toResponse);
    }

    public Uni<MovimentoResponse> create(MovimentoRequest r) {
        var e = new Movimento();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MovimentoResponse> update(Long id, MovimentoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Movimento not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Movimento not found")));
    }

    private void apply(Movimento e, MovimentoRequest r) {
        e.descricao = r.descricao();
        e.descricaocompleta = r.descricaocompleta();
        e.movimentoId = r.movimentoId();
        e.tipoMovimentoId = r.tipoMovimentoId();
    }

    private MovimentoResponse toResponse(Movimento e) {
        return new MovimentoResponse(e.id, e.descricao, e.descricaocompleta, e.movimentoId, e.tipoMovimentoId);
    }


    // Migrado de MovimentoController.autoCompleteCidade (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/MovimentoController.java:46, camada controller)
    // Logica original (adaptar):
    // public List<Movimento> autoCompleteCidade(String query) {
    //         if (!query.equals("")) {
    //             return movimentoService.autoComplete(query);
    //         }
    //         return movimentoService.findAll();
    //     }
    public Uni<List<Long>> autoCompleteCidade(String query) {
        if (query != null && !query.equals("")) {
            return repository.autoComplete(query).map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.listAll().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MovimentoController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/MovimentoController.java:63, camada controller)
    // Logica original (adaptar):
    // public List<Movimento> autoComplete(String query) {
    //         return movimentoService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MovimentoService.autoCompleteComTipo (src/main/java/br/com/sol7/olimpio/service/services/financeiro/MovimentoService.java:27, camada service)
    // Observacao: parametro tipoMovimentoId: era TipoMovimento (referencia por id)
    // Logica original (adaptar):
    // public List<Movimento> autoCompleteComTipo(String query, TipoMovimento tipoMovimento) {
    //         return getSubCategoriaRepository().autoCompleteComTipo(query.toLowerCase(), tipoMovimento, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComTipo(String query, Long tipoMovimentoId) {
        return repository.autoCompleteComTipo(query, tipoMovimentoId).map(list -> list.stream().map(x -> x.id).toList());
    }

}

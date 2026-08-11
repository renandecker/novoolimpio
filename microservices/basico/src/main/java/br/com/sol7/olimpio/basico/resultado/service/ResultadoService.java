package br.com.sol7.olimpio.basico.resultado.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.resultado.dto.ResultadoRequest;
import br.com.sol7.olimpio.basico.resultado.dto.ResultadoResponse;
import br.com.sol7.olimpio.basico.resultado.entity.Resultado;
import br.com.sol7.olimpio.basico.resultado.repository.ResultadoRepository;

@ApplicationScoped
@WithTransaction
public class ResultadoService {

    @Inject ResultadoRepository repository;

    public Uni<List<ResultadoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ResultadoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ResultadoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Resultado not found"))
                .map(this::toResponse);
    }

    public Uni<ResultadoResponse> create(ResultadoRequest r) {
        var e = new Resultado();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ResultadoResponse> update(Long id, ResultadoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Resultado not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Resultado not found")));
    }

    private void apply(Resultado e, ResultadoRequest r) { e.descricao = r.descricao(); e.venda = r.venda(); }

    private ResultadoResponse toResponse(Resultado e) {
        return new ResultadoResponse(e.id, e.descricao, e.venda);
    }


    // Migrado de ResultadoController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/ResultadoController.java:78, camada controller)
    // Logica original (adaptar):
    // public List<Resultado> autoComplete(String query) {
    //         if (ObjectUtil.nullOrEmpty(query)) {
    //             return resultadoService.findAll();
    //         }
    // 
    //         return resultadoService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        if (query == null || query.isBlank()) {
            return repository.listAll().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

}

package br.com.sol7.olimpio.basico.escolaridade.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.escolaridade.dto.EscolaridadeRequest;
import br.com.sol7.olimpio.basico.escolaridade.dto.EscolaridadeResponse;
import br.com.sol7.olimpio.basico.escolaridade.entity.Escolaridade;
import br.com.sol7.olimpio.basico.escolaridade.repository.EscolaridadeRepository;

@ApplicationScoped
@WithTransaction
public class EscolaridadeService {

    @Inject
    EscolaridadeRepository repository;

    public Uni<List<EscolaridadeResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EscolaridadeResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<EscolaridadeResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Escolaridade not found"))
                .map(this::toResponse);
    }

    public Uni<EscolaridadeResponse> create(EscolaridadeRequest r) {
        var e = new Escolaridade();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EscolaridadeResponse> update(Long id, EscolaridadeRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Escolaridade not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Escolaridade not found")));
    }

    private void apply(Escolaridade e, EscolaridadeRequest r) {
        e.descricao = r.descricao();
        e.ordem = r.ordem();
    }

    private EscolaridadeResponse toResponse(Escolaridade e) {
        return new EscolaridadeResponse(e.id, e.descricao, e.ordem);
    }

    public Uni<List<Long>> autoComplete(String query) {
        if (!query.equals("")) {
            return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
        } else {
            return repository.findAllEscolaridade().map(list -> list.stream().map(x -> x.id).toList());
        }
    }

    public Uni<List<Long>> autoComplete2() {
        return repository.findAllEscolaridade().map(list -> list.stream().map(x -> x.id).toList());
    }

}

package br.com.sol7.olimpio.basico.motivo.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.motivo.dto.MotivoRequest;
import br.com.sol7.olimpio.basico.motivo.dto.MotivoResponse;
import br.com.sol7.olimpio.basico.motivo.entity.Motivo;
import br.com.sol7.olimpio.basico.motivo.repository.MotivoRepository;

@ApplicationScoped
@WithTransaction
public class MotivoService {

    @Inject
    MotivoRepository repository;

    public Uni<List<MotivoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MotivoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<MotivoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Motivo not found"))
                .map(this::toResponse);
    }

    public Uni<MotivoResponse> create(MotivoRequest r) {
        var e = new Motivo();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MotivoResponse> update(Long id, MotivoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Motivo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Motivo not found")));
    }

    private void apply(Motivo e, MotivoRequest r) {
        e.descricao = r.descricao();
        e.style = r.style();
        e.ativo = r.ativo();
    }

    private MotivoResponse toResponse(Motivo e) {
        return new MotivoResponse(e.id, e.descricao, e.style, e.ativo);
    }

    public Uni<List<Long>> autoComplete(String query) {
        if (query == null || query.equals("")) {
            return repository.autoCompleteList().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoComplete(query).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteList() {
        return repository.find("ativo = true order by descricao").page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}

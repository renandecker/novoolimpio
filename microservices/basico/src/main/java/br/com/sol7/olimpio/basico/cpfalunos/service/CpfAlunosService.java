package br.com.sol7.olimpio.basico.cpfalunos.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.cpfalunos.dto.CpfAlunosRequest;
import br.com.sol7.olimpio.basico.cpfalunos.dto.CpfAlunosResponse;
import br.com.sol7.olimpio.basico.cpfalunos.entity.CpfAlunos;
import br.com.sol7.olimpio.basico.cpfalunos.repository.CpfAlunosRepository;

@ApplicationScoped
@WithTransaction
public class CpfAlunosService {

    @Inject
    CpfAlunosRepository repository;

    public Uni<List<CpfAlunosResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CpfAlunosResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CpfAlunosResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CpfAlunos not found"))
                .map(this::toResponse);
    }

    public Uni<CpfAlunosResponse> create(CpfAlunosRequest r) {
        var e = new CpfAlunos();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CpfAlunosResponse> update(Long id, CpfAlunosRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CpfAlunos not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("CpfAlunos not found")));
    }

    private void apply(CpfAlunos e, CpfAlunosRequest r) {
        e.cpf = r.cpf();
        e.nome = r.nome();
    }

    private CpfAlunosResponse toResponse(CpfAlunos e) {
        return new CpfAlunosResponse(e.id, e.cpf, e.nome);
    }
}

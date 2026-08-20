package br.com.sol7.olimpio.basico.alterarsenha.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.alterarsenha.dto.AlterarSenhaRequest;
import br.com.sol7.olimpio.basico.alterarsenha.dto.AlterarSenhaResponse;
import br.com.sol7.olimpio.basico.alterarsenha.entity.AlterarSenha;
import br.com.sol7.olimpio.basico.alterarsenha.repository.AlterarSenhaRepository;

@ApplicationScoped
@WithTransaction
public class AlterarSenhaService {
    @Inject
    AlterarSenhaRepository repository;

    public Uni<List<AlterarSenhaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AlterarSenhaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<AlterarSenhaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("AlterarSenha not found")).map(this::toResponse);
    }

    public Uni<AlterarSenhaResponse> create(AlterarSenhaRequest r) {
        var e = new AlterarSenha();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AlterarSenhaResponse> update(Long id, AlterarSenhaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("AlterarSenha not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("AlterarSenha not found")));
    }

    private void apply(AlterarSenha e, AlterarSenhaRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private AlterarSenhaResponse toResponse(AlterarSenha e) {
        return new AlterarSenhaResponse(e.id, e.nome, e.dadosJson);
    }
}
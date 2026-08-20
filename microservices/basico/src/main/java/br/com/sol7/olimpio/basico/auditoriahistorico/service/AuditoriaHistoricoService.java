package br.com.sol7.olimpio.basico.auditoriahistorico.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.auditoriahistorico.dto.AuditoriaHistoricoRequest;
import br.com.sol7.olimpio.basico.auditoriahistorico.dto.AuditoriaHistoricoResponse;
import br.com.sol7.olimpio.basico.auditoriahistorico.entity.AuditoriaHistorico;
import br.com.sol7.olimpio.basico.auditoriahistorico.repository.AuditoriaHistoricoRepository;

@ApplicationScoped
@WithTransaction
public class AuditoriaHistoricoService {

    @Inject
    AuditoriaHistoricoRepository repository;

    public Uni<List<AuditoriaHistoricoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AuditoriaHistoricoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<AuditoriaHistoricoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("AuditoriaHistorico not found"))
                .map(this::toResponse);
    }

    public Uni<AuditoriaHistoricoResponse> create(AuditoriaHistoricoRequest r) {
        var e = new AuditoriaHistorico();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AuditoriaHistoricoResponse> update(Long id, AuditoriaHistoricoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("AuditoriaHistorico not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("AuditoriaHistorico not found")));
    }

    private void apply(AuditoriaHistorico e, AuditoriaHistoricoRequest r) {
        e.nome = r.nome();
        e.sql = r.sql();
        e.sqlData = r.sqlData();
        e.sqlTipo = r.sqlTipo();
        e.sqlUnidade = r.sqlUnidade();
        e.sqlUsuario = r.sqlUsuario();
    }

    private AuditoriaHistoricoResponse toResponse(AuditoriaHistorico e) {
        return new AuditoriaHistoricoResponse(e.id, e.nome, e.sql, e.sqlData, e.sqlTipo, e.sqlUnidade, e.sqlUsuario);
    }
}

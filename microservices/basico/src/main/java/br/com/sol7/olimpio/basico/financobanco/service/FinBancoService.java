package br.com.sol7.olimpio.basico.financobanco.service;

import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import br.com.sol7.olimpio.basico.financobanco.dto.FinBancoRequest;
import br.com.sol7.olimpio.basico.financobanco.dto.FinBancoResponse;
import br.com.sol7.olimpio.basico.financobanco.entity.FinBanco;
import br.com.sol7.olimpio.basico.financobanco.repository.FinBancoRepository;

@ApplicationScoped
@WithTransaction
public class FinBancoService {

    @Inject
    FinBancoRepository repository;

    @CacheResult(cacheName = "fin-banco-cache")
    public Uni<List<FinBancoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FinBancoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending())
                .page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<FinBancoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FinBanco not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "fin-banco-cache")
    public Uni<FinBancoResponse> create(FinBancoRequest r) {
        var e = new FinBanco();
        apply(e, r);
        e.dataCriacao = LocalDateTime.now();
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "fin-banco-cache")
    public Uni<FinBancoResponse> update(Long id, FinBancoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FinBanco not found"))
                .invoke(e -> {
                    apply(e, r);
                    e.dataAlteracao = LocalDateTime.now();
                })
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "fin-banco-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("FinBanco not found")));
    }

    @CacheResult(cacheName = "fin-banco-config-cache")
    public Uni<Map<String, String>> getConfiguracao(Long unidadeId, String provedor) {
        return repository.find("unidadeId = ?1 and provedor = ?2 and ativo = true", unidadeId, provedor)
                .list()
                .map(items -> items.stream()
                        .collect(Collectors.toMap(b -> b.chave, b -> b.valor != null ? b.valor : "")));
    }

    private void apply(FinBanco e, FinBancoRequest r) {
        e.unidadeId = r.unidadeId();
        e.provedor = r.provedor();
        e.chave = r.chave();
        e.valor = r.valor();
        e.ativo = r.ativo() != null ? r.ativo() : true;
    }

    private FinBancoResponse toResponse(FinBanco e) {
        return new FinBancoResponse(e.id, e.unidadeId, e.provedor, e.chave, e.valor, e.ativo);
    }
}

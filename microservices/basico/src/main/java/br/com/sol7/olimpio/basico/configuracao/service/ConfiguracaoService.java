package br.com.sol7.olimpio.basico.configuracao.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.configuracao.dto.ConfiguracaoRequest;
import br.com.sol7.olimpio.basico.configuracao.dto.ConfiguracaoResponse;
import br.com.sol7.olimpio.basico.configuracao.entity.Configuracao;
import br.com.sol7.olimpio.basico.configuracao.repository.ConfiguracaoRepository;

@ApplicationScoped
@WithTransaction
public class ConfiguracaoService {
    @Inject
    ConfiguracaoRepository repository;

    public Uni<List<ConfiguracaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ConfiguracaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ConfiguracaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Configuracao not found")).map(this::toResponse);
    }

    public Uni<ConfiguracaoResponse> create(ConfiguracaoRequest r) {
        var e = new Configuracao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ConfiguracaoResponse> update(Long id, ConfiguracaoRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Configuracao not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Configuracao not found")));
    }

    private void apply(Configuracao e, ConfiguracaoRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private ConfiguracaoResponse toResponse(Configuracao e) {
        return new ConfiguracaoResponse(e.id, e.nome, e.dadosJson);
    }
}
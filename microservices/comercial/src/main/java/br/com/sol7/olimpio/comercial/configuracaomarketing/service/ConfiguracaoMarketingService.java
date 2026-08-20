package br.com.sol7.olimpio.comercial.configuracaomarketing;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ConfiguracaoMarketingService {

    @Inject
    ConfiguracaoMarketingRepository repository;

    public Uni<List<ConfiguracaoMarketingResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ConfiguracaoMarketingResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ConfiguracaoMarketingResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoMarketing not found"))
                .map(this::toResponse);
    }

    public Uni<ConfiguracaoMarketingResponse> create(ConfiguracaoMarketingRequest r) {
        var e = new ConfiguracaoMarketing();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ConfiguracaoMarketingResponse> update(Long id, ConfiguracaoMarketingRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoMarketing not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ConfiguracaoMarketing not found")));
    }

    private void apply(ConfiguracaoMarketing e, ConfiguracaoMarketingRequest r) {
        e.notaMaximaBloquear = r.notaMaximaBloquear();
        e.notaMaximaConfirmar = r.notaMaximaConfirmar();
        e.tempoMaximoLigacao = r.tempoMaximoLigacao();
        e.diasArquivoProcon = r.diasArquivoProcon();
        e.tempoMaximoIntervalo = r.tempoMaximoIntervalo();
        e.limiteMaximoRadar = r.limiteMaximoRadar();
        e.resultadoContatoExpiradoId = r.resultadoContatoExpiradoId();
        e.resultadoContatoRetornoId = r.resultadoContatoRetornoId();
    }

    private ConfiguracaoMarketingResponse toResponse(ConfiguracaoMarketing e) {
        return new ConfiguracaoMarketingResponse(e.id, e.notaMaximaBloquear, e.notaMaximaConfirmar, e.tempoMaximoLigacao, e.diasArquivoProcon, e.tempoMaximoIntervalo, e.limiteMaximoRadar, e.resultadoContatoExpiradoId, e.resultadoContatoRetornoId);
    }
}

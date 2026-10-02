package br.com.sol7.olimpio.financeiro.etapascobranca;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class EtapasCobrancaService {

    @Inject
    EtapasCobrancaRepository repository;

    public Uni<List<EtapasCobrancaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EtapasCobrancaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<EtapasCobrancaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("EtapasCobranca not found"))
                .map(this::toResponse);
    }

    public Uni<EtapasCobrancaResponse> create(EtapasCobrancaRequest r) {
        var e = new EtapasCobranca();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EtapasCobrancaResponse> update(Long id, EtapasCobrancaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("EtapasCobranca not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("EtapasCobranca not found")));
    }

    private void apply(EtapasCobranca e, EtapasCobrancaRequest r) {
        e.descricao = r.descricao();
        e.ordem = r.ordem();
        e.customizado = r.customizado();
        e.tipoModeloDocumento = r.tipoModeloDocumento();
        e.campoCustomizado = r.campoCustomizado();
        e.localDocumento = r.localDocumento();
        e.nomeDocumento = r.nomeDocumento();
        e.campoDetalhes = r.campoDetalhes();
        e.usuario = r.usuario();
        e.perfil = r.perfil();
    }

    private EtapasCobrancaResponse toResponse(EtapasCobranca e) {
        return new EtapasCobrancaResponse(e.id, e.descricao, e.ordem, e.customizado, e.tipoModeloDocumento, e.campoCustomizado, e.localDocumento, e.nomeDocumento, e.campoDetalhes, e.usuario, e.perfil);
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

}

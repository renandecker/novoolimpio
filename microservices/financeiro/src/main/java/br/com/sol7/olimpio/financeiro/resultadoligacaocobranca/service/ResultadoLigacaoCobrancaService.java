package br.com.sol7.olimpio.financeiro.resultadoligacaocobranca;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ResultadoLigacaoCobrancaService {

    @Inject
    ResultadoLigacaoCobrancaRepository repository;

    public Uni<List<ResultadoLigacaoCobrancaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ResultadoLigacaoCobrancaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ResultadoLigacaoCobrancaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ResultadoLigacaoCobranca not found"))
                .map(this::toResponse);
    }

    public Uni<ResultadoLigacaoCobrancaResponse> create(ResultadoLigacaoCobrancaRequest r) {
        var e = new ResultadoLigacaoCobranca();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ResultadoLigacaoCobrancaResponse> update(Long id, ResultadoLigacaoCobrancaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ResultadoLigacaoCobranca not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ResultadoLigacaoCobranca not found")));
    }

    private void apply(ResultadoLigacaoCobranca e, ResultadoLigacaoCobrancaRequest r) {
        e.descricao = r.descricao();
        e.tela = r.tela();
        e.ordem = r.ordem();
        e.diasRetorno = r.diasRetorno();
    }

    private ResultadoLigacaoCobrancaResponse toResponse(ResultadoLigacaoCobranca e) {
        return new ResultadoLigacaoCobrancaResponse(e.id, e.descricao, e.tela, e.ordem, e.diasRetorno);
    }

    public Uni<List<Long>> autoCompleteComEtapa(String query, Long etapasCobrancaId) {
        return repository.autoCompleteComEtapa(query.toLowerCase().trim(), etapasCobrancaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarResultadoLigacaoCobrancaComEtapas(Long resultadoLigacaoCobrancaId) {
        return repository.buscarResultadoLigacaoCobrancaComEtapas(resultadoLigacaoCobrancaId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> autoCompleteComEtapa2(String query, Long etapasCobrancaId) {
        return repository.autoCompleteComEtapa(query.toLowerCase().trim(), etapasCobrancaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}

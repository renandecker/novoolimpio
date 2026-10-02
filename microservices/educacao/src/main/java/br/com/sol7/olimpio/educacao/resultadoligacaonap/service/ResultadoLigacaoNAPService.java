package br.com.sol7.olimpio.educacao.resultadoligacaonap;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ResultadoLigacaoNAPService {

    @Inject
    ResultadoLigacaoNAPRepository repository;

    public Uni<List<ResultadoLigacaoNAPResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ResultadoLigacaoNAPResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ResultadoLigacaoNAPResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ResultadoLigacaoNAP not found"))
                .map(this::toResponse);
    }

    public Uni<ResultadoLigacaoNAPResponse> create(ResultadoLigacaoNAPRequest r) {
        var e = new ResultadoLigacaoNAP();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ResultadoLigacaoNAPResponse> update(Long id, ResultadoLigacaoNAPRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ResultadoLigacaoNAP not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ResultadoLigacaoNAP not found")));
    }

    private void apply(ResultadoLigacaoNAP e, ResultadoLigacaoNAPRequest r) {
        e.descricao = r.descricao();
        e.tela = r.tela();
        e.ordem = r.ordem();
        e.diasRetorno = r.diasRetorno();
    }

    private ResultadoLigacaoNAPResponse toResponse(ResultadoLigacaoNAP e) {
        return new ResultadoLigacaoNAPResponse(e.id, e.descricao, e.tela, e.ordem, e.diasRetorno);
    }


    // Migrado de ResultadoLigacaoNAPController.autoCompleteComEtapa (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ResultadoLigacaoNAPController.java:73, camada controller)
    // Logica original (adaptar):
    // public List<ResultadoLigacaoNAP> autoCompleteComEtapa(String query) {
    //         if (!query.equals("")) {
    //             return resultadoLigacaoNAPService.autoCompleteComEtapa(query, napController.getEtapasNAP());
    //         }
    //         if (query.equals("")) {
    //             return resultadoLigacaoNAPService.listarResultadoLigacaoLimite(napController.getEtapasNAP());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteComEtapa(String query) {
        // Obs: depende do estado da tela (napController.getEtapasNAP())
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarResultadoLigacaoNAPComEtapas(Long resultadoLigacaoNAPId) {
        return repository.buscarResultadoLigacaoNAPComEtapas(resultadoLigacaoNAPId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> autoCompleteComEtapa2(String query, Long etapasCobrancaId) {
        return repository.autoCompleteComEtapa(query.toLowerCase().trim(), etapasCobrancaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}


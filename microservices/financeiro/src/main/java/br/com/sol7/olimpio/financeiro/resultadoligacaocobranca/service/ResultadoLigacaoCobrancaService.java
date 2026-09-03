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


    // Migrado de ResultadoLigacaoCobrancaController.autoCompleteComEtapa (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/ResultadoLigacaoCobrancaController.java:117, camada controller)
    // Logica original (adaptar):
    // public List<ResultadoLigacaoCobranca> autoCompleteComEtapa(String query) {
    //         if (!query.equals("")) {
    //             return resultadoLigacaoCobrancaService.autoCompleteComEtapa(query, cobrancaController.getEtapasCobranca());
    //         }
    //         if (query.equals("")) {
    //             return resultadoLigacaoCobrancaService.listarResultadoLigacaoLimite(cobrancaController.getEtapasCobranca());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteComEtapa(String query, Long etapasCobrancaId) {
        return repository.autoCompleteComEtapa(query.toLowerCase().trim(), etapasCobrancaId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ResultadoLigacaoCobrancaController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/ResultadoLigacaoCobrancaController.java:127, camada controller)
    // Logica original (adaptar):
    // public List<ResultadoLigacaoCobranca> autoComplete(String query) {
    //         return resultadoLigacaoCobrancaService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ResultadoLigacaoCobrancaService.buscarResultadoLigacaoCobrancaComEtapas (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ResultadoLigacaoCobrancaService.java:24, camada service)
    // Observacao: retorno: era ResultadoLigacaoCobranca (referencia por id); parametro resultadoLigacaoCobrancaId: era ResultadoLigacaoCobranca (referencia por id)
    // JPQL original: select r from ResultadoLigacaoCobranca r left join fetch r.etapasCobrancas  where r = ?1
    // Logica original (adaptar):
    // public ResultadoLigacaoCobranca buscarResultadoLigacaoCobrancaComEtapas(ResultadoLigacaoCobranca resultadoLigacaoCobranca) {
    //         return getResultadoLigacaoCobrancaRepository().buscarResultadoLigacaoCobrancaComEtapas(resultadoLigacaoCobranca);
    //     }
    public Uni<Long> buscarResultadoLigacaoCobrancaComEtapas(Long resultadoLigacaoCobrancaId) {
        return repository.buscarResultadoLigacaoCobrancaComEtapas(resultadoLigacaoCobrancaId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ResultadoLigacaoCobrancaService.autoCompleteComEtapa (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ResultadoLigacaoCobrancaService.java:28, camada service)
    // Observacao: parametro etapasCobrancaId: era EtapasCobranca (referencia por id)
    // JPQL original: select distinct u from ResultadoLigacaoCobranca u inner join u.etapasCobrancas un where un = ?2 and lower(u.descricao) like '%' || ?1 || '%' or str(u.id) like '%' || ?1 || '%' order by u.ordem, u.descricao
    // Logica original (adaptar):
    // public List<ResultadoLigacaoCobranca> autoCompleteComEtapa(String query, EtapasCobranca etapasCobranca) {
    //         return getResultadoLigacaoCobrancaRepository().autoCompleteComEtapa(query.toLowerCase().trim(), etapasCobranca, new PageRequest(0, 20)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComEtapa2(String query, Long etapasCobrancaId) {
        return repository.autoCompleteComEtapa(query.toLowerCase().trim(), etapasCobrancaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}

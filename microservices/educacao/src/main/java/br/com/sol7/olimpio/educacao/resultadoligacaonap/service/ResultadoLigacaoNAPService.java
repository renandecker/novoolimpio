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

    @Inject ResultadoLigacaoNAPRepository repository;

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

    private void apply(ResultadoLigacaoNAP e, ResultadoLigacaoNAPRequest r) { e.descricao = r.descricao(); e.tela = r.tela(); e.ordem = r.ordem(); e.diasRetorno = r.diasRetorno(); }

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


    // Migrado de ResultadoLigacaoNAPController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ResultadoLigacaoNAPController.java:83, camada controller)
    // Logica original (adaptar):
    // public List<ResultadoLigacaoNAP> autoComplete(String query) {
    //         return resultadoLigacaoNAPService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ResultadoLigacaoNAPService.buscarResultadoLigacaoNAPComEtapas (src/main/java/br/com/sol7/olimpio/service/services/educacao/ResultadoLigacaoNAPService.java:23, camada service)
    // Observacao: retorno: era ResultadoLigacaoNAP (referencia por id); parametro resultadoLigacaoNAPId: era ResultadoLigacaoNAP (referencia por id)
    // JPQL original: select r from ResultadoLigacaoNAP r left join fetch r.etapasNAPs where r = ?1
    // Logica original (adaptar):
    // public ResultadoLigacaoNAP buscarResultadoLigacaoNAPComEtapas(ResultadoLigacaoNAP resultadoLigacaoNAP) {
    //         return getResultadoLigacaoNAPRepository().buscarResultadoLigacaoNAPComEtapas(resultadoLigacaoNAP);
    //     }
    public Uni<Long> buscarResultadoLigacaoNAPComEtapas(Long resultadoLigacaoNAPId) {
                return repository.buscarResultadoLigacaoNAPComEtapas(resultadoLigacaoNAPId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ResultadoLigacaoNAPService.autoCompleteComEtapa (src/main/java/br/com/sol7/olimpio/service/services/educacao/ResultadoLigacaoNAPService.java:31, camada service)
    // Observacao: parametro etapasCobrancaId: era EtapasNAP (referencia por id)
    // JPQL original: select distinct u from ResultadoLigacaoNAP u inner join u.etapasNAPs un  where un = ?2 and lower(u.descricao) like '%' || ?1 || '%' or str(u.id) like '%' || ?1 || '%' order by u.ordem, u.descricao
    // Logica original (adaptar):
    // public List<ResultadoLigacaoNAP> autoCompleteComEtapa(String query, EtapasNAP etapasCobranca) {
    //         return getResultadoLigacaoNAPRepository().autoCompleteComEtapa(query.toLowerCase().trim(), etapasCobranca, new PageRequest(0, 20)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComEtapa2(String query, Long etapasCobrancaId) {
                return repository.autoCompleteComEtapa(query.toLowerCase().trim(), etapasCobrancaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}

package br.com.sol7.olimpio.educacao.criterio;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class CriterioService {

    @Inject CriterioRepository repository;

    public Uni<List<CriterioResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CriterioResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CriterioResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Criterio not found"))
                .map(this::toResponse);
    }

    public Uni<CriterioResponse> create(CriterioRequest r) {
        var e = new Criterio();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CriterioResponse> update(Long id, CriterioRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Criterio not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Criterio not found")));
    }

    private void apply(Criterio e, CriterioRequest r) { e.unidadeId = r.unidadeId(); e.curriculoId = r.curriculoId(); e.mes = r.mes(); e.periodo = r.periodo(); e.qtdTurmaAbertas = r.qtdTurmaAbertas(); e.qtdAulasToleraciaMatricula = r.qtdAulasToleraciaMatricula(); e.dataInicio = r.dataInicio(); e.dataFim = r.dataFim(); e.tipoMatricula = r.tipoMatricula(); }

    private CriterioResponse toResponse(Criterio e) {
        return new CriterioResponse(e.id, e.unidadeId, e.curriculoId, e.mes, e.periodo, e.qtdTurmaAbertas, e.qtdAulasToleraciaMatricula, e.dataInicio, e.dataFim, e.tipoMatricula);
    }


    // Migrado de CriterioController.autoCompleteCurriculo (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/CriterioController.java:135, camada controller)
    // Logica original (adaptar):
    // public List<Curriculo> autoCompleteCurriculo(String query) {
    //         if (!query.equals("")) {
    //             return curriculoService.autoCompleteComUnidades(query, usuarioLogadoController.getUnidadesDisponiveis());
    //         }
    //         return curriculoService.autoCompleteComUnidades(usuarioLogadoController.getUnidadesDisponiveis());
    //     }
    public Uni<List<Long>> autoCompleteCurriculo(String query) {
        // Obs: depende do estado da tela (unidades disponiveis do usuario logado, curriculoService)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CriterioController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/CriterioController.java:260, camada controller)
    // Logica original (adaptar):
    // public List<DiaSemana> autoComplete(String query) {
    //         return diaSemanaService.autocomplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do microservico basico (diaSemanaService.autocomplete)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CriterioService.buscarCriterioComDiasSemana (src/main/java/br/com/sol7/olimpio/service/services/educacao/CriterioService.java:27, camada service)
    // Observacao: retorno: era Criterio (referencia por id); parametro curriculoId: era Curriculo (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: Select c from Criterio c left join fetch c.diaSemana where c.curriculo =?1 AND c.unidade = ?2
    // Logica original (adaptar):
    // public Criterio buscarCriterioComDiasSemana(Curriculo curriculo, Unidade unidade) {
    //         return getCriterioRepository().buscarCriterioComDiasSemana(curriculo, unidade);
    //     }
    public Uni<Long> buscarCriterioComDiasSemana(Long curriculoId, Long unidadeId) {
                return repository.buscarCriterioComDiasSemana(curriculoId, unidadeId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de CriterioService.buscarCriterioComTurno (src/main/java/br/com/sol7/olimpio/service/services/educacao/CriterioService.java:31, camada service)
    // Observacao: retorno: era Criterio (referencia por id); parametro curriculoId: era Curriculo (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // JPQL original: Select c from Criterio c left join fetch c.turnoEducacao where c.curriculo =?1 AND c.unidade = ?2
    // Logica original (adaptar):
    // public Criterio buscarCriterioComTurno(Curriculo curriculo, Unidade unidade) {
    //         return getCriterioRepository().buscarCriterioComTurno(curriculo, unidade);
    //     }
    public Uni<Long> buscarCriterioComTurno(Long curriculoId, Long unidadeId) {
                return repository.buscarCriterioComTurno(curriculoId, unidadeId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de CriterioService.buscarCriterio (src/main/java/br/com/sol7/olimpio/service/services/educacao/CriterioService.java:35, camada service)
    // Observacao: parametro curriculoId: era Curriculo (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<Criterio> buscarCriterio(Curriculo curriculo, Unidade unidade) {
    //         return getCriterioRepository().buscarCriterio(curriculo, unidade);
    //     }
    public Uni<List<Long>> buscarCriterio(Long curriculoId, Long unidadeId) {
                return repository.find("curriculoId =?1 and unidadeId = ?2 order by id desc", curriculoId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}


package br.com.sol7.olimpio.educacao.matrizcurricular;

import br.com.sol7.olimpio.educacao.componentecurricular.ComponenteCurricular;
import br.com.sol7.olimpio.educacao.componentecurricular.ComponenteCurricularRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@ApplicationScoped
@WithTransaction
public class MatrizCurricularService {
    @Inject
    MatrizCurricularRepository repository;
    @Inject
    ComponenteCurricularRepository componenteRepository;

    public Uni<List<MatrizCurricularResponse>> list() {
        return withComponentes(repository.findAll().list());
    }

    public Uni<PagedResponse<MatrizCurricularResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return withComponentes(repository.findAll(io.quarkus.panache.common.Sort.by("id").descending())
                .page(io.quarkus.panache.common.Page.of(p, s)).list())
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items, count, p, s)));
    }

    public Uni<List<MatrizCurricularResponse>> listarPorCurriculo(Long curriculoId) {
        return withComponentes(repository.find("curriculoId", curriculoId).list());
    }

    public Uni<MatrizCurricularResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("MatrizCurricular not found"))
                .chain(e -> withComponentes(Uni.createFrom().item(List.of(e))).map(List::getFirst));
    }

    // Criacao idempotente: a tela reenvia toda a matriz a cada salvamento.
    public Uni<MatrizCurricularResponse> create(MatrizCurricularRequest r) {
        if (r.curriculoId() == null || r.componenteCurricularId() == null) {
            throw new BadRequestException("curriculoId e componenteCurricularId sao obrigatorios");
        }
        return repository.find("curriculoId = ?1 and componenteCurricularId = ?2", r.curriculoId(), r.componenteCurricularId())
                .firstResult()
                .chain(existing -> existing != null ? withComponentes(Uni.createFrom().item(List.of(existing))).map(List::getFirst)
                        : persistNew(r));
    }

    private Uni<MatrizCurricularResponse> persistNew(MatrizCurricularRequest r) {
        var e = new MatrizCurricular();
        apply(e, r);
        Uni<Integer> ordemFinal = r.ordem() != null ? Uni.createFrom().item(r.ordem())
                : repository.count("curriculoId", r.curriculoId()).map(c -> (int) (c + 1));
        return ordemFinal.chain(o -> {
            e.ordem = o;
            return repository.persist(e).replaceWith(() ->
                    new MatrizCurricularResponse(e.id, e.curriculoId, e.componenteCurricularId,
                            null, null, e.grupoComponenteCurricularId, e.tipoMatrizCurricularId,
                            e.modalidadeId, e.ordem));
        });
    }

    public Uni<MatrizCurricularResponse> update(Long id, MatrizCurricularRequest r) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("MatrizCurricular not found"))
                .invoke(e -> apply(e, r))
                .chain(e -> withComponentes(Uni.createFrom().item(List.of(e))).map(List::getFirst));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id)
                .onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("MatrizCurricular not found")));
    }

    private void apply(MatrizCurricular e, MatrizCurricularRequest r) {
        if (r.curriculoId() != null) e.curriculoId = r.curriculoId();
        if (r.componenteCurricularId() != null) e.componenteCurricularId = r.componenteCurricularId();
        e.grupoComponenteCurricularId = r.grupoComponenteCurricularId();
        e.tipoMatrizCurricularId = r.tipoMatrizCurricularId();
        e.modalidadeId = r.modalidadeId();
        if (r.ordem() != null) e.ordem = r.ordem();
    }

    // Enriquece com descricao do componente (consultas serializadas: a sessao reativa
    // nao suporta consultas concorrentes).
    private Uni<List<MatrizCurricularResponse>> withComponentes(Uni<List<MatrizCurricular>> itemsUni) {
        return itemsUni.chain(items -> {
            if (items.isEmpty()) return Uni.createFrom().item(List.<MatrizCurricularResponse>of());
            var ids = items.stream().map(i -> i.componenteCurricularId).filter(Objects::nonNull).distinct().toList();
            if (ids.isEmpty()) {
                return Uni.createFrom().item(items.stream().map(i -> toResponse(i, Map.of())).toList());
            }
            return componenteRepository.list("id in ?1", ids).map(componentes -> {
                Map<Long, ComponenteCurricular> byId = new HashMap<>();
                for (var c : componentes) byId.put(c.id, c);
                return items.stream().map(i -> toResponse(i, byId)).toList();
            });
        });
    }

    private MatrizCurricularResponse toResponse(MatrizCurricular e, Map<Long, ComponenteCurricular> componentes) {
        var c = componentes.get(e.componenteCurricularId);
        return new MatrizCurricularResponse(e.id, e.curriculoId, e.componenteCurricularId,
                c != null ? c.descricao : null, c != null ? c.sucinto : null,
                e.grupoComponenteCurricularId, e.tipoMatrizCurricularId, e.modalidadeId, e.ordem);
    }
}

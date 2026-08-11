package br.com.sol7.olimpio.educacao.periodo;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class PeriodoService {

    @Inject PeriodoRepository repository;

    public Uni<List<PeriodoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PeriodoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<PeriodoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Periodo not found"))
                .map(this::toResponse);
    }

    public Uni<PeriodoResponse> create(PeriodoRequest r) {
        var e = new Periodo();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PeriodoResponse> update(Long id, PeriodoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Periodo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Periodo not found")));
    }

    private void apply(Periodo e, PeriodoRequest r) { e.descricao = r.descricao(); e.tipoCursoId = r.tipoCursoId(); e.dataInicio = r.dataInicio(); e.dataFim = r.dataFim(); e.frequenciaMinima = r.frequenciaMinima(); e.mediaSemExame = r.mediaSemExame(); e.mediaFinal = r.mediaFinal(); e.conceitoFinal = r.conceitoFinal(); }

    private PeriodoResponse toResponse(Periodo e) {
        return new PeriodoResponse(e.id, e.descricao, e.tipoCursoId, e.dataInicio, e.dataFim, e.frequenciaMinima, e.mediaSemExame, e.mediaFinal, e.conceitoFinal);
    }


    // Migrado de PeriodoService.buscarPeriodoComUnidades (src/main/java/br/com/sol7/olimpio/service/services/educacao/PeriodoService.java:19, camada service)
    // Observacao: retorno: era Periodo (referencia por id); parametro entityId: era Periodo (referencia por id)
    // JPQL original: Select ca from Periodo ca left join fetch ca.unidades where ca = ?1
    // Logica original (adaptar):
    // public Periodo buscarPeriodoComUnidades(Periodo entity) {
    //         return getPeriodoRepository().buscarPeriodoComUnidades(entity);
    //     }
    public Uni<Long> buscarPeriodoComUnidades(Long entityId) {
                return repository.buscarPeriodoComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

}

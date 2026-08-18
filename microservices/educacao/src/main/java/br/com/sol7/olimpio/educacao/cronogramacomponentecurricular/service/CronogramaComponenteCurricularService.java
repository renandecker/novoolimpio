package br.com.sol7.olimpio.educacao.cronogramacomponentecurricular;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class CronogramaComponenteCurricularService {

    @Inject CronogramaComponenteCurricularRepository repository;

    public Uni<List<CronogramaComponenteCurricularResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CronogramaComponenteCurricularResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CronogramaComponenteCurricularResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CronogramaComponenteCurricular not found"))
                .map(this::toResponse);
    }

    public Uni<CronogramaComponenteCurricularResponse> create(CronogramaComponenteCurricularRequest r) {
        var e = new CronogramaComponenteCurricular();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CronogramaComponenteCurricularResponse> update(Long id, CronogramaComponenteCurricularRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CronogramaComponenteCurricular not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("CronogramaComponenteCurricular not found")));
    }

    private void apply(CronogramaComponenteCurricular e, CronogramaComponenteCurricularRequest r) { e.componenteCurricularId = r.componenteCurricularId(); e.assunto = r.assunto(); e.descricao = r.descricao(); e.ordem = r.ordem(); e.numeroAula = r.numeroAula(); }

    private CronogramaComponenteCurricularResponse toResponse(CronogramaComponenteCurricular e) {
        return new CronogramaComponenteCurricularResponse(e.id, e.componenteCurricularId, e.assunto, e.descricao, e.ordem, e.numeroAula);
    }


    // Migrado de CronogramaComponenteCurricularService.buscarCronogramaComComponente (src/main/java/br/com/sol7/olimpio/service/services/educacao/CronogramaComponenteCurricularService.java:26, camada service)
    // Observacao: parametro componenteCurricularId: era ComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public List<CronogramaComponenteCurricular> buscarCronogramaComComponente(ComponenteCurricular componenteCurricular) {
    //         return getCronogramaComponenteCurricularRepository().buscarCronogramaComComponente(componenteCurricular);
    //     }
    public Uni<List<Long>> buscarCronogramaComComponente(Long componenteCurricularId) {
                return repository.find("componenteCurricularId = ?1 order by ordem", componenteCurricularId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}


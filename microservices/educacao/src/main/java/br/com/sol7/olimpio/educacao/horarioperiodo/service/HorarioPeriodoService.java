package br.com.sol7.olimpio.educacao.horarioperiodo;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class HorarioPeriodoService {

    @Inject HorarioPeriodoRepository repository;

    public Uni<List<HorarioPeriodoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<HorarioPeriodoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<HorarioPeriodoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("HorarioPeriodo not found"))
                .map(this::toResponse);
    }

    public Uni<HorarioPeriodoResponse> create(HorarioPeriodoRequest r) {
        var e = new HorarioPeriodo();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<HorarioPeriodoResponse> update(Long id, HorarioPeriodoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("HorarioPeriodo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("HorarioPeriodo not found")));
    }

    private void apply(HorarioPeriodo e, HorarioPeriodoRequest r) { e.descricao = r.descricao(); e.periodoId = r.periodoId(); e.turnoEducacaoId = r.turnoEducacaoId(); e.dataInicio = r.dataInicio(); e.dataFim = r.dataFim(); e.horaInicio = r.horaInicio(); e.horaFim = r.horaFim(); e.minutosAulaDiario = r.minutosAulaDiario(); e.minutosAula = r.minutosAula(); }

    private HorarioPeriodoResponse toResponse(HorarioPeriodo e) {
        return new HorarioPeriodoResponse(e.id, e.descricao, e.periodoId, e.turnoEducacaoId, e.dataInicio, e.dataFim, e.horaInicio, e.horaFim, e.minutosAulaDiario, e.minutosAula);
    }
}


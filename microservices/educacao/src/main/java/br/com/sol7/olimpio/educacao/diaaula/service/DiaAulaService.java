package br.com.sol7.olimpio.educacao.diaaula;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.RefOption;
import br.com.sol7.olimpio.educacao.tempoaula.TempoAula;
import br.com.sol7.olimpio.educacao.tempoaula.TempoAulaRepository;
import br.com.sol7.olimpio.educacao.turnoeducacao.TurnoEducacao;
import br.com.sol7.olimpio.educacao.turnoeducacao.TurnoEducacaoRepository;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class DiaAulaService {

    @Inject DiaAulaRepository repository;
    @Inject TurnoEducacaoRepository turnoEducacaoRepository;
    @Inject TempoAulaRepository tempoAulaRepository;

    public Uni<List<DiaAulaResponse>> list() {
        return withRefs(repository.listAll());
    }

    public Uni<PagedResponse<DiaAulaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        Uni<List<DiaAula>> items = repository.findAll(Sort.by("id").descending()).page(Page.of(p, s)).list();
        return withRefs(items)
                .onItem().transformToUni(res -> repository.count()
                        .map(count -> new PagedResponse<>(res, count, p, s)));
    }

    public Uni<DiaAulaResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("DiaAula not found"))
                .call(this::hydrate)
                .map(this::toResponse);
    }

    public Uni<DiaAulaResponse> create(DiaAulaRequest r) {
        var e = new DiaAula();
        apply(e, r);
        return repository.persist(e)
                .call(() -> hydrate(e))
                .replaceWith(() -> toResponse(e));
    }

    public Uni<DiaAulaResponse> update(Long id, DiaAulaRequest r) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("DiaAula not found"))
                .invoke(e -> apply(e, r))
                .call(this::hydrate)
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id)
                .onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("DiaAula not found")));
    }

    private void apply(DiaAula e, DiaAulaRequest r) {
        e.diaSemanaId = r.diaSemanaId();
        e.turnoEducacaoId = r.turnoEducacaoId();
        e.tempoAulaId = r.tempoAulaId();
    }

    private DiaAulaResponse toResponse(DiaAula e) {
        return new DiaAulaResponse(e.id, e.diaSemanaId, e.turnoEducacaoId, e.tempoAulaId,
                e.turnoEducacaoId != null ? e.turnoEducacao.descricao : null,
                e.tempoAulaId != null ? e.tempoAula.descricao : null,
                e.turnoEducacaoId != null ? e.turnoEducacao.inicio : null,
                e.turnoEducacaoId != null ? e.turnoEducacao.fim : null,
                e.tempoAulaId != null ? e.tempoAula.minutos : null);
    }

    // Resolve as descricoes de turno/tempo a partir dos ids (mapas locais para evitar N+1).
    private Uni<Void> hydrate(DiaAula e) {
        if (e.turnoEducacaoId == null && e.tempoAulaId == null) {
            return Uni.createFrom().voidItem();
        }
        return loadRefs()
                .invoke(refs -> {
                    e.turnoEducacao = refs.turnoById(e.turnoEducacaoId);
                    e.tempoAula = refs.tempoById(e.tempoAulaId);
                })
                .replaceWithVoid();
    }

    private Uni<List<DiaAulaResponse>> withRefs(Uni<List<DiaAula>> items) {
        return loadRefs().onItem().transformToUni(refs -> items.map(list -> {
            for (DiaAula e : list) {
                e.turnoEducacao = refs.turnoById(e.turnoEducacaoId);
                e.tempoAula = refs.tempoById(e.tempoAulaId);
            }
            return list.stream().map(this::toResponse).toList();
        }));
    }

    private Uni<Refs> loadRefs() {
        return Uni.combine().all()
                .unis(turnoEducacaoRepository.listAll(), tempoAulaRepository.listAll())
                .asTuple()
                .map(tuple -> new Refs(tuple.getItem1(), tuple.getItem2()));
    }

    private record Refs(List<TurnoEducacao> turnos, List<TempoAula> tempos) {
        TurnoEducacao turnoById(Long id) {
            if (id == null) return null;
            return turnos.stream().filter(t -> t.id.equals(id)).findFirst().orElse(null);
        }
        TempoAula tempoById(Long id) {
            if (id == null) return null;
            return tempos.stream().filter(t -> t.id.equals(id)).findFirst().orElse(null);
        }
    }

    // Utilizado pelo fluxo de geracao de aulas (calculo de horas de aula de um DiaAula).
    public double horasAula(DiaAula e) {
        if (e.turnoEducacao == null || e.tempoAula == null || e.turnoEducacao.inicio == null || e.turnoEducacao.fim == null) {
            return 0;
        }
        long minutos = java.time.Duration.between(e.turnoEducacao.inicio, e.turnoEducacao.fim).toMinutes();
        return minutos / (double) (e.tempoAula.minutos > 0 ? e.tempoAula.minutos : 1);
    }

    // Referencias usadas pelos combos da tela (DataTable/RecordModal do react web).
    public Uni<Map<String, List<RefOption>>> refs() {
        return loadRefs().map(refs -> Map.of(
                "turnoEducacaoId", refs.turnos.stream()
                        .map(t -> new RefOption(t.id, t.descricao + (t.inicio != null ? " (" + LocalTime.of(t.inicio.getHour(), t.inicio.getMinute()) + " as " + LocalTime.of(t.fim.getHour(), t.fim.getMinute()) + ")" : "")))
                        .sorted(java.util.Comparator.comparing(RefOption::label, java.util.Comparator.nullsLast(String::compareTo)))
                        .collect(Collectors.toList()),
                "tempoAulaId", refs.tempos.stream()
                        .map(t -> new RefOption(t.id, t.descricao))
                        .sorted(java.util.Comparator.comparing(RefOption::label, java.util.Comparator.nullsLast(String::compareTo)))
                        .collect(Collectors.toList())));
    }
}

package br.com.sol7.olimpio.comercial.atendimentoconsultor;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import io.smallrye.mutiny.Uni;

import br.com.sol7.olimpio.shared.TupleHelper;
import jakarta.persistence.Tuple;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import br.com.sol7.olimpio.comercial.atendimentoconsultor.TurmaOferecidaResponse;
import br.com.sol7.olimpio.comercial.atendimentoconsultor.TurmaOferecidaDiaAulaResponse;
import br.com.sol7.olimpio.comercial.atendimentoconsultor.TurmaOferecidaOcorrenciaResponse;

@ApplicationScoped
@WithTransaction
public class AtendimentoConsultorService {
    @Inject
    AtendimentoConsultorRepository repository;

    public Uni<List<AtendimentoConsultorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AtendimentoConsultorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<AtendimentoConsultorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("AtendimentoConsultor not found")).map(this::toResponse);
    }

    public Uni<AtendimentoConsultorResponse> create(AtendimentoConsultorRequest r) {
        var e = new AtendimentoConsultor();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AtendimentoConsultorResponse> update(Long id, AtendimentoConsultorRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("AtendimentoConsultor not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("AtendimentoConsultor not found")));
    }

    private void apply(AtendimentoConsultor e, AtendimentoConsultorRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private AtendimentoConsultorResponse toResponse(AtendimentoConsultor e) {
        return new AtendimentoConsultorResponse(e.id, e.nome, e.dadosJson);
    }

    public Uni<List<TurmaOferecidaResponse>> buscarTurmasOferecidas(Long curriculoId, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        return repository.buscarTurmasOferecidas(curriculoId, unidadesIds)
                .map(tuples -> {
                    List<Long> ofertaIds = tuples.stream()
                            .map(t -> TupleHelper.getLong(t, "id"))
                            .collect(Collectors.toList());
                    if (ofertaIds.isEmpty()) {
                        return List.of();
                    }
                    return buildTurmasResponse(ofertaIds, tuples);
                });
    }

    private List<TurmaOferecidaResponse> buildTurmasResponse(List<Long> ofertaIds, List<Tuple> turmasTuples) {
        // Buscar dias aula e ocorrencias em paralelo
        List<Tuple> diasTuples = repository.buscarDiasAulaTurmas(ofertaIds).await().indefinitely();
        List<Tuple> ocorrenciasTuples = repository.buscarOcorrenciasTurmas(ofertaIds).await().indefinitely();

        // Agrupar por oferecimento
        Map<Long, List<Tuple>> diasPorOferta = diasTuples.stream()
                .collect(Collectors.groupingBy(t -> TupleHelper.getLong(t, "id_oferecimento")));
        Map<Long, List<Tuple>> ocorrenciasPorOferta = ocorrenciasTuples.stream()
                .collect(Collectors.groupingBy(t -> TupleHelper.getLong(t, "id_oferecimento")));

        return turmasTuples.stream().map(t -> {
            Long id = TupleHelper.getLong(t, "id");
            List<TurmaOferecidaDiaAulaResponse> dias = diasPorOferta.getOrDefault(id, List.of()).stream()
                    .map(d -> new TurmaOferecidaDiaAulaResponse(
                            TupleHelper.getLong(d, "id_dia_aula"),
                            TupleHelper.getLong(d, "id_dia_semana"),
                            TupleHelper.getString(d, "dia_semana"),
                            TupleHelper.getLong(d, "id_turno"),
                            TupleHelper.getString(d, "turno"),
                            TupleHelper.getString(d, "turno_inicio"),
                            TupleHelper.getString(d, "turno_fim")
                    )).collect(Collectors.toList());

            List<TurmaOferecidaOcorrenciaResponse> ocorrencias = ocorrenciasPorOferta.getOrDefault(id, List.of()).stream()
                    .map(o -> new TurmaOferecidaOcorrenciaResponse(
                            TupleHelper.getLong(o, "id"),
                            TupleHelper.getDate(o, "data"),
                            TupleHelper.getLong(o, "id_dia_aula"),
                            TupleHelper.getLong(o, "id_sala"),
                            TupleHelper.getLong(o, "id_professor"),
                            TupleHelper.getBoolean(o, "aula_coringa"),
                            TupleHelper.getBoolean(o, "aula_presencial")
                    )).collect(Collectors.toList());

            return new TurmaOferecidaResponse(
                    id,
                    TupleHelper.getString(t, "status"),
                    TupleHelper.getInteger(t, "vagas"),
                    TupleHelper.getInteger(t, "inscritos"),
                    TupleHelper.getDate(t, "data_inicio"),
                    TupleHelper.getDate(t, "data_fim"),
                    TupleHelper.getLong(t, "id_unidade"),
                    TupleHelper.getString(t, "unidade"),
                    TupleHelper.getLong(t, "id_sala"),
                    TupleHelper.getString(t, "sala"),
                    TupleHelper.getLong(t, "id_componente_curricular"),
                    TupleHelper.getString(t, "componente"),
                    TupleHelper.getLong(t, "id_periodo"),
                    TupleHelper.getLong(t, "id_professor"),
                    dias,
                    ocorrencias
            );
        }).collect(Collectors.toList());
    }

}
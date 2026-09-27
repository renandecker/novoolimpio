package br.com.sol7.olimpio.professor.disponibilidade.service;

import br.com.sol7.olimpio.professor.disponibilidade.entity.DisponibilidadeProfessor;
import br.com.sol7.olimpio.professor.disponibilidade.repository.DisponibilidadeProfessorRepository;
import br.com.sol7.olimpio.professor.disponibilidade.dto.DisponibilidadeProfessorRequest;
import br.com.sol7.olimpio.professor.disponibilidade.dto.DisponibilidadeProfessorResponse;
import br.com.sol7.olimpio.professor.disponibilidade.dto.DisponibilidadeScheduleEventResponse;
import br.com.sol7.olimpio.professor.disponibilidade.dto.DisponibilidadeOpcaoResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.TupleHelper;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;
import org.hibernate.reactive.mutiny.Mutiny;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class DisponibilidadeProfessorService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private static final String SQL_OPCOES_PROFESSORES =
            "SELECT DISTINCT p.id AS id, COALESCE(pf.nome, pj.nome_fantasia, '') AS nome " +
                    " FROM edc_professor p " +
                    " LEFT JOIN bas_pessoa pes ON pes.id = p.id_pessoa " +
                    " LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
                    " LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = pes.id " +
                    " WHERE p.fl_ativo = true " +
                    " ORDER BY COALESCE(pf.nome, pj.nome_fantasia, '')";

    private static final String SQL_UNIDADES_PROFESSOR =
            "SELECT DISTINCT dp.id_unidade AS id_unidade FROM edc_professor_unidade dp WHERE dp.id_professor = ?1";

    private static final String SQL_FERIADOS_NACIONAIS =
            "SELECT DISTINCT f.nome AS nome, f.dt_feriado AS dt_feriado FROM bas_feriado f " +
                    " WHERE f.fl_nacional = true AND f.dt_feriado >= ?1 AND f.dt_feriado < ?2 " +
                    " ORDER BY f.dt_feriado";

    private static final String SQL_FERIADOS_UNIDADES_BASE =
            "SELECT DISTINCT f.nome AS nome, f.dt_feriado AS dt_feriado FROM bas_feriado f " +
                    " LEFT JOIN bas_feriado_unidade fu ON fu.id_feriado = f.id " +
                    " WHERE (f.fl_nacional = true OR fu.id_unidade IN ({placeholders})) AND f.dt_feriado >= ?{dateStart} AND f.dt_feriado < ?{dateEnd} " +
                    " ORDER BY f.dt_feriado";

    private static final String SQL_OCORRENCIAS_PROFESSOR =
            "SELECT o.id AS id, o.data AS data, COALESCE(cc.descricao, '') AS descricao, t.inicio AS inicio, t.fim AS fim " +
                    " FROM edc_ocorrencia_componente_curricular o " +
                    " INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular " +
                    " INNER JOIN edc_componente_curricular cc ON cc.id = ofe.id_componente_curricular " +
                    " INNER JOIN edc_dia_aula da ON da.id = o.id_dia_aula " +
                    " INNER JOIN edc_turno t ON t.id = da.id_turno " +
                    " WHERE o.fl_ativo = true AND o.id_professor = ?1 AND o.data >= ?2 AND o.data < ?3 " +
                    " ORDER BY o.data";

    private static final String SQL_DISPONIBILIDADES_PROFESSOR =
            "SELECT dp.id AS id, dp.id_unidade AS id_unidade, dp.inicio AS inicio, dp.fim AS fim, ds.id AS dia_semana " +
                    " FROM edc_professor_unidade dp " +
                    " LEFT JOIN edc_disponibilidade_professor_dia_semana dps ON dps.id_disponibilidade_professor = dp.id " +
                    " LEFT JOIN bas_dia_semana ds ON ds.id = dps.id_dia_semana " +
                    " WHERE dp.id_professor = ?1";

    private static final String SQL_TURNOS_EXTREMOS =
            "SELECT MIN(t.inicio) AS inicio, MAX(t.fim) AS fim FROM edc_turno t";

    @Inject
    DisponibilidadeProfessorRepository repository;

    public Uni<List<DisponibilidadeProfessorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<DisponibilidadeProfessorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<DisponibilidadeProfessorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("DisponibilidadeProfessor not found"))
                .map(this::toResponse);
    }

    public Uni<DisponibilidadeProfessorResponse> create(DisponibilidadeProfessorRequest r) {
        var e = new DisponibilidadeProfessor();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<DisponibilidadeProfessorResponse> update(Long id, DisponibilidadeProfessorRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("DisponibilidadeProfessor not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("DisponibilidadeProfessor not found")));
    }

    public Uni<List<DisponibilidadeOpcaoResponse>> opcoesProfessores() {
        return nativeQuery(SQL_OPCOES_PROFESSORES)
                .map(rows -> rows.stream().map(r -> new DisponibilidadeOpcaoResponse(TupleHelper.getLong(r, "id"), TupleHelper.getString(r, "nome"))).toList());
    }

    public Uni<List<DisponibilidadeScheduleEventResponse>> scheduleEvents(Long professorId, LocalDate inicio, LocalDate fim) {
        if (professorId == null) {
            return Uni.createFrom().item(List.of());
        }
        LocalDate first = inicio == null ? LocalDate.now().minusDays(6) : inicio.minusDays(6);
        LocalDate last = fim == null ? LocalDate.now().plusDays(6) : fim.plusDays(6);
        Uni<List<Tuple>> ocorrencias = nativeQuery(SQL_OCORRENCIAS_PROFESSOR, professorId, toDate(first), toDate(last.plusDays(1)));
        Uni<List<Tuple>> disponibilidades = nativeQuery(SQL_DISPONIBILIDADES_PROFESSOR, professorId);
        Uni<List<Tuple>> turnos = nativeQuery(SQL_TURNOS_EXTREMOS);
        return nativeQuery(SQL_UNIDADES_PROFESSOR, professorId).map(rows -> rows.stream()
                .map(r -> TupleHelper.getLong(r, "id_unidade")).toList())
                .chain(unidades -> {
                    Uni<List<Tuple>> feriados;
                    if (unidades.isEmpty()) {
                        feriados = nativeQuery(SQL_FERIADOS_NACIONAIS, toDate(first), toDate(last.plusDays(1)));
                    } else {
                        String placeholders = unidades.stream().map(u -> "?").collect(Collectors.joining(","));
                        int unitCount = unidades.size();
                        int dateStartIdx = unitCount + 1;
                        int dateEndIdx = unitCount + 2;
                        String sql = SQL_FERIADOS_UNIDADES_BASE
                                .replace("{placeholders}", placeholders)
                                .replace("{dateStart}", String.valueOf(dateStartIdx))
                                .replace("{dateEnd}", String.valueOf(dateEndIdx));
                        List<Object> params = new ArrayList<>(unidades);
                        params.add(toDate(first));
                        params.add(toDate(last.plusDays(1)));
                        feriados = nativeQuery(sql, params.toArray());
                    }
                    return Uni.combine().all().unis(ocorrencias, disponibilidades, turnos, feriados).asTuple()
                            .map(t -> buildSchedule(t.getItem1(), t.getItem2(), t.getItem3(), t.getItem4(), first, last));
                });
    }

    private List<DisponibilidadeScheduleEventResponse> buildSchedule(List<Tuple> ocorrencias, List<Tuple> disponibilidades,
                                                                     List<Tuple> turnosRows, List<Tuple> feriados,
                                                                     LocalDate first, LocalDate last) {
        List<DisponibilidadeScheduleEventResponse> events = new ArrayList<>();
        for (Tuple f : feriados) {
            String nome = TupleHelper.getString(f, "nome");
            LocalDate data = TupleHelper.getLocalDate(f, "dt_feriado");
            if (data == null) {
                continue;
            }
            String iso = data.atStartOfDay().format(ISO);
            events.add(new DisponibilidadeScheduleEventResponse(nome, iso, iso, true, "evento-blue", null));
        }
        LocalTime minTurno = null;
        LocalTime maxTurno = null;
        if (!turnosRows.isEmpty()) {
            minTurno = toTime(TupleHelper.get(turnosRows.get(0), "inicio"));
            maxTurno = toTime(TupleHelper.get(turnosRows.get(0), "fim"));
        }
        if (minTurno == null || maxTurno == null) {
            return events;
        }
        LocalDateTime cursor = first.atStartOfDay();
        LocalDateTime bound = last.plusDays(1).atStartOfDay();
        while (cursor.isBefore(bound)) {
            LocalDateTime fimSlot = cursor.plusMinutes(30);
            if (cursor.toLocalTime().isAfter(minTurno) && cursor.toLocalTime().isBefore(maxTurno)
                    && disponivel(cursor, disponibilidades)) {
                Tuple conflito = conflito(cursor, fimSlot, ocorrencias);
                if (conflito == null) {
                    events.add(new DisponibilidadeScheduleEventResponse("Disponível", iso(cursor), iso(fimSlot), false, "evento-green", null));
                } else {
                    events.add(new DisponibilidadeScheduleEventResponse(TupleHelper.getString(conflito, "descricao"), iso(cursor), iso(fimSlot), false, "evento-black", TupleHelper.getLong(conflito, "id")));
                }
            }
            cursor = fimSlot;
        }
        return events;
    }

    private boolean disponivel(LocalDateTime slot, List<Tuple> disponibilidades) {
        for (Tuple d : disponibilidades) {
            LocalTime inicio = toTime(TupleHelper.get(d, "inicio"));
            LocalTime fim = toTime(TupleHelper.get(d, "fim"));
            if (inicio != null && fim != null && slot.toLocalTime().isAfter(inicio) && slot.toLocalTime().isBefore(fim)) {
                Long diaSemana = TupleHelper.getLong(d, "dia_semana");
                if (diaSemana == null) {
                    return true;
                }
                int legacyDay = (slot.getDayOfWeek().getValue() % 7) + 1;
                if (legacyDay == diaSemana.intValue()) {
                    return true;
                }
            }
        }
        return false;
    }

    private Tuple conflito(LocalDateTime slot, LocalDateTime fimSlot, List<Tuple> ocorrencias) {
        LocalDate day = slot.toLocalDate();
        for (Tuple o : ocorrencias) {
            LocalDate oData = TupleHelper.getLocalDate(o, "data");
            if (oData == null || !oData.equals(day)) {
                continue;
            }
            LocalTime oInicio = toTime(TupleHelper.get(o, "inicio"));
            LocalTime oFim = toTime(TupleHelper.get(o, "fim"));
            if (oInicio == null || oFim == null) {
                continue;
            }
            if (slot.toLocalTime().isBefore(oFim) && fimSlot.toLocalTime().isAfter(oInicio)) {
                return o;
            }
        }
        return null;
    }

    private Uni<List<Tuple>> nativeQuery(String sql, Object... params) {
        return Panache.getSession().chain(session -> {
            Mutiny.SelectionQuery<Tuple> q = session.createNativeQuery(sql, Tuple.class);
            for (int i = 0; i < params.length; i++) {
                q.setParameter(i + 1, params[i]);
            }
            return q.getResultList();
        });
    }

    private void apply(DisponibilidadeProfessor e, DisponibilidadeProfessorRequest r) {
        e.professorId = r.professorId();
        e.unidadeId = r.unidadeId();
        e.tipoContratoId = r.tipoContratoId();
        e.inicio = r.inicio();
        e.fim = r.fim();
        e.preAutorizado = r.preAutorizado();
    }

    private DisponibilidadeProfessorResponse toResponse(DisponibilidadeProfessor e) {
        return new DisponibilidadeProfessorResponse(e.id, e.professorId, e.unidadeId, e.tipoContratoId, e.inicio, e.fim, e.preAutorizado);
    }

    private String iso(LocalDateTime dt) {
        return dt.format(ISO);
    }

    private LocalTime toTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalTime t)return t;
        if (value instanceof java.sql.Time t)return t.toLocalTime();
        return null;
    }

    private Date toDate(LocalDate d) {
        return Date.from(d.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
}

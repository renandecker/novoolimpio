package br.com.sol7.olimpio.educacao.disponibilidadeprofessor;

import br.com.sol7.olimpio.educacao.disponibilidadeprofessor.dto.DisponibilidadeProfessorRequest;
import br.com.sol7.olimpio.educacao.disponibilidadeprofessor.dto.DisponibilidadeProfessorResponse;
import br.com.sol7.olimpio.educacao.shared.DisponibilidadeScheduleEventResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
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

@ApplicationScoped
@WithTransaction
public class DisponibilidadeProfessorService {

    @Inject
    DisponibilidadeProfessorRepository repository;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private static final String SQL_FERIADOS_UNIDADE =
            "SELECT DISTINCT f.nome, f.dt_feriado FROM bas_feriado f " +
                    " LEFT JOIN bas_feriado_unidade fu ON fu.id_feriado = f.id " +
                    " WHERE (f.fl_nacional = true OR fu.id_unidade = ?1) AND f.dt_feriado >= ?2 AND f.dt_feriado < ?3 " +
                    " ORDER BY f.dt_feriado";

    private static final String SQL_OCORRENCIAS_PROFESSOR =
            "SELECT o.id, o.data, t.inicio, t.fim, COALESCE(cc.descricao, ''), COALESCE(s.numero, 0) " +
                    " FROM edc_ocorrencia_componente_curricular o " +
                    " INNER JOIN edc_oferecimento_componente_curricular off ON off.id = o.id_oferecimento_componente_curricular " +
                    " INNER JOIN edc_componente_curricular cc ON cc.id = off.id_componente_curricular " +
                    " INNER JOIN edc_sala s ON s.id = o.id_sala " +
                    " INNER JOIN edc_dia_aula da ON da.id = o.id_dia_aula " +
                    " INNER JOIN edc_turno t ON t.id = da.id_turno " +
                    " WHERE off.id_unidade = ?1 AND o.fl_ativo = true AND off.id_professor = ?2 " +
                    " AND o.data >= ?3 AND o.data < ?4 ORDER BY o.data, t.inicio";

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
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("DisponibilidadeProfessor not found")).map(this::toResponse);
    }

    public Uni<DisponibilidadeProfessorResponse> create(DisponibilidadeProfessorRequest r) {
        var e = new DisponibilidadeProfessor();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<DisponibilidadeProfessorResponse> update(Long id, DisponibilidadeProfessorRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("DisponibilidadeProfessor not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("DisponibilidadeProfessor not found")));
    }

    private void apply(DisponibilidadeProfessor e, DisponibilidadeProfessorRequest r) {
        e.professorId = r.professorId();
        e.unidadeId = r.unidadeId();
        e.tipoContratoId = r.tipoContratoId();
        e.inicio = r.inicio();
        e.fim = r.fim();
        e.preAutorizado = r.preAutorizado() != null ? r.preAutorizado() : true;
        e.diasSemanaIds = r.diasSemanaIds();
    }

    private DisponibilidadeProfessorResponse toResponse(DisponibilidadeProfessor e) {
        return new DisponibilidadeProfessorResponse(
                e.id, e.professorId, null, e.unidadeId, null, e.tipoContratoId, null,
                e.inicio, e.fim, e.preAutorizado, e.diasSemanaIds
        );
    }

    public Uni<List<DisponibilidadeScheduleEventResponse>> scheduleEvents(Long unidadeId, Long professorId, LocalDate inicio, LocalDate fim) {
        if (unidadeId == null || professorId == null) {
            return Uni.createFrom().item(List.of());
        }
        LocalDate first = inicio == null ? LocalDate.now().minusDays(6) : inicio.minusDays(6);
        LocalDate last = fim == null ? LocalDate.now().plusDays(6) : fim.plusDays(6);
        
        Uni<List<Object[]>> feriados = nativeQuery(SQL_FERIADOS_UNIDADE, unidadeId, toDate(first), toDate(last.plusDays(1)));
        Uni<List<Object[]>> ocorrencias = nativeQuery(SQL_OCORRENCIAS_PROFESSOR, unidadeId, professorId, toDate(first), toDate(last.plusDays(1)));
        
        return Uni.combine().all().unis(feriados, ocorrencias).asTuple()
                .map(t -> buildSchedule(t.getItem1(), t.getItem2(), first, last));
    }

    private List<DisponibilidadeScheduleEventResponse> buildSchedule(List<Object[]> feriados, List<Object[]> ocorrencias,
                                                                      LocalDate first, LocalDate last) {
        List<DisponibilidadeScheduleEventResponse> events = new ArrayList<>();
        for (Object[] f : feriados) {
            LocalDate data = toLocalDate(f[1]);
            if (data == null) {
                continue;
            }
            String iso = data.atStartOfDay().format(ISO);
            events.add(new DisponibilidadeScheduleEventResponse(toStr(f[0]), iso, iso, true, "evento-blue", null));
        }
        for (Object[] o : ocorrencias) {
            LocalDate data = toLocalDate(o[1]);
            if (data == null) {
                continue;
            }
            LocalTime inicio = toTime(o[2]);
            LocalTime fim = toTime(o[3]);
            String descricao = toStr(o[4]);
            String horario = (inicio != null && fim != null) ? hora(inicio) + "-" + hora(fim) + " " : "";
            Integer numero = o.length > 5 ? toInt(o[5]) : null;
            String title = "Sala " + (numero == null ? "" : numero) + " " + horario + descricao;
            String start = iso(data, inicio);
            String end = iso(data, fim == null ? inicio : fim);
            events.add(new DisponibilidadeScheduleEventResponse(title, start, end, false, "evento-green", toLong(o[0])));
        }
        return events;
    }

    private Uni<List<Object[]>> nativeQuery(String sql, Object... params) {
        return Panache.getSession().chain(session -> {
            Mutiny.Query<Object> q = session.createNativeQuery(sql);
            for (int i = 0; i < params.length; i++) {
                q.setParameter(i + 1, params[i]);
            }
            return q.getResultList()
                    .map(list -> list.stream().map(row -> (Object[]) row).toList());
        });
    }

    private String iso(LocalDate data, LocalTime hora) {
        return LocalDateTime.of(data, hora == null ? LocalTime.MIDNIGHT : hora).format(ISO);
    }

    private String hora(LocalTime t) {
        return t.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    private LocalDate toLocalDate(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDate d)return d;
        if (value instanceof java.sql.Date d)return d.toLocalDate();
        if (value instanceof java.sql.Timestamp t)return t.toLocalDateTime().toLocalDate();
        if (value instanceof Date d)return d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        return null;
    }

    private LocalTime toTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalTime t)return t;
        if (value instanceof java.sql.Time t)return t.toLocalTime();
        return null;
    }

    private Integer toInt(Object value) {
        return value == null ? null : ((Number) value).intValue();
    }

    private Long toLong(Object value) {
        return value == null ? null : ((Number) value).longValue();
    }

    private String toStr(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Date toDate(LocalDate d) {
        return Date.from(d.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
}
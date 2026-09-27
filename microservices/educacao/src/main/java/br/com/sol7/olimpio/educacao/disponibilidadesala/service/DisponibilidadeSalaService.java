package br.com.sol7.olimpio.educacao.disponibilidadesala;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.TupleHelper;
import br.com.sol7.olimpio.educacao.shared.DisponibilidadeScheduleEventResponse;
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

@ApplicationScoped
@WithTransaction
public class DisponibilidadeSalaService {
    @Inject
    DisponibilidadeSalaRepository repository;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private static final String SQL_FERIADOS_UNIDADE =
            "SELECT DISTINCT f.nome AS nome, f.dt_feriado AS dt_feriado FROM bas_feriado f " +
                    " LEFT JOIN bas_feriado_unidade fu ON fu.id_feriado = f.id " +
                    " WHERE (f.fl_nacional = true OR fu.id_unidade = ?1) AND f.dt_feriado >= ?2 AND f.dt_feriado < ?3 " +
                    " ORDER BY f.dt_feriado";

    private static final String SQL_OCORRENCIAS_SALA =
            "SELECT o.id AS id, o.data AS data, t.inicio AS inicio, t.fim AS fim, COALESCE(cc.descricao, '') AS descricao " +
                    " FROM edc_ocorrencia_componente_curricular o " +
                    " INNER JOIN edc_oferecimento_componente_curricular off ON off.id = o.id_oferecimento_componente_curricular " +
                    " INNER JOIN edc_componente_curricular cc ON cc.id = off.id_componente_curricular " +
                    " INNER JOIN edc_dia_aula da ON da.id = o.id_dia_aula " +
                    " INNER JOIN edc_turno t ON t.id = da.id_turno " +
                    " WHERE off.id_unidade = ?1 AND o.fl_ativo = true AND o.id_sala = ?2 " +
                    " AND o.data >= ?3 AND o.data < ?4 ORDER BY o.data, t.inicio";

    private static final String SQL_OCORRENCIAS_UNIDADE_SALAS =
            "SELECT o.id AS id, o.data AS data, t.inicio AS inicio, t.fim AS fim, COALESCE(cc.descricao, '') AS descricao, COALESCE(s.numero, 0) AS numero " +
                    " FROM edc_ocorrencia_componente_curricular o " +
                    " INNER JOIN edc_oferecimento_componente_curricular off ON off.id = o.id_oferecimento_componente_curricular " +
                    " INNER JOIN edc_componente_curricular cc ON cc.id = off.id_componente_curricular " +
                    " INNER JOIN edc_sala s ON s.id = o.id_sala " +
                    " INNER JOIN edc_dia_aula da ON da.id = o.id_dia_aula " +
                    " INNER JOIN edc_turno t ON t.id = da.id_turno " +
                    " WHERE off.id_unidade = ?1 AND o.fl_ativo = true AND o.id_sala IS NOT NULL " +
                    " AND o.data >= ?2 AND o.data < ?3 ORDER BY o.data, t.inicio";

    public Uni<List<DisponibilidadeSalaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<DisponibilidadeSalaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<DisponibilidadeSalaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("DisponibilidadeSala not found")).map(this::toResponse);
    }

    public Uni<DisponibilidadeSalaResponse> create(DisponibilidadeSalaRequest r) {
        var e = new DisponibilidadeSala();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<DisponibilidadeSalaResponse> update(Long id, DisponibilidadeSalaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("DisponibilidadeSala not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("DisponibilidadeSala not found")));
    }

    private void apply(DisponibilidadeSala e, DisponibilidadeSalaRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private DisponibilidadeSalaResponse toResponse(DisponibilidadeSala e) {
        return new DisponibilidadeSalaResponse(e.id, e.nome, e.dadosJson);
    }

    public Uni<List<DisponibilidadeScheduleEventResponse>> scheduleEvents(Long unidadeId, Long salaId, LocalDate inicio, LocalDate fim) {
        if (unidadeId == null) {
            return Uni.createFrom().item(List.of());
        }
        LocalDate first = inicio == null ? LocalDate.now().minusDays(6) : inicio.minusDays(6);
        LocalDate last = fim == null ? LocalDate.now().plusDays(6) : fim.plusDays(6);
        boolean porSala = salaId != null;
        Uni<List<Tuple>> feriados = nativeQuery(SQL_FERIADOS_UNIDADE, unidadeId, toDate(first), toDate(last.plusDays(1)));
        Uni<List<Tuple>> ocorrencias = porSala
                ? nativeQuery(SQL_OCORRENCIAS_SALA, unidadeId, salaId, toDate(first), toDate(last.plusDays(1)))
                : nativeQuery(SQL_OCORRENCIAS_UNIDADE_SALAS, unidadeId, toDate(first), toDate(last.plusDays(1)));
        return Uni.combine().all().unis(feriados, ocorrencias).asTuple()
                .map(t -> buildSchedule(t.getItem1(), t.getItem2(), porSala, first, last));
    }

    private List<DisponibilidadeScheduleEventResponse> buildSchedule(List<Tuple> feriados, List<Tuple> ocorrencias,
                                                                     boolean porSala, LocalDate first, LocalDate last) {
        List<DisponibilidadeScheduleEventResponse> events = new ArrayList<>();
        for (Tuple f : feriados) {
            LocalDate data = TupleHelper.getLocalDate(f, "dt_feriado");
            if (data == null) {
                continue;
            }
            String iso = data.atStartOfDay().format(ISO);
            events.add(new DisponibilidadeScheduleEventResponse(TupleHelper.getString(f, "nome"), iso, iso, true, "evento-blue", null));
        }
        for (Tuple o : ocorrencias) {
            LocalDate data = TupleHelper.getLocalDate(o, "data");
            if (data == null) {
                continue;
            }
            LocalTime inicio = toTime(TupleHelper.get(o, "inicio"));
            LocalTime fim = toTime(TupleHelper.get(o, "fim"));
            String descricao = TupleHelper.getString(o, "descricao");
            String horario = (inicio != null && fim != null) ? hora(inicio) + "-" + hora(fim) + " " : "";
            String title;
            String style;
            if (porSala) {
                title = horario + descricao;
                style = "evento-black";
            } else {
                Integer numero = TupleHelper.getInteger(o, "numero");
                title = "Sala " + (numero == null ? "" : numero) + " " + horario + descricao;
                style = "evento-yellow";
            }
            String start = iso(data, inicio);
            String end = iso(data, fim == null ? inicio : fim);
            events.add(new DisponibilidadeScheduleEventResponse(title, start, end, false, style, TupleHelper.getLong(o, "id")));
        }
        return events;
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

    private String iso(LocalDate data, LocalTime hora) {
        return LocalDateTime.of(data, hora == null ? LocalTime.MIDNIGHT : hora).format(ISO);
    }

    private String hora(LocalTime t) {
        return t.format(DateTimeFormatter.ofPattern("HH:mm"));
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

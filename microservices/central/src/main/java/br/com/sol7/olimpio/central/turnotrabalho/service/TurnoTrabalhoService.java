package br.com.sol7.olimpio.central.turnotrabalho;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.hibernate.reactive.mutiny.Mutiny;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@ApplicationScoped
@WithTransaction
public class TurnoTrabalhoService {

    @Inject
    TurnoTrabalhoRepository repository;

    // ========== HorarioUtil replica (extracted_aceso/src/main/java/br/com/sol7/olimpio/util/HorarioUtil.java) ==========

    private void verificarHoraValida(String horaString) {
        String ex = "Ex.: 08:30";
        if (horaString == null || horaString.length() != 5) {
            throw new BadRequestException("A hora deve ter 5 digitos. " + ex);
        }
        if (!horaString.contains(":")) {
            throw new BadRequestException("A hora deve seguir o padrao " + ex);
        }
        String[] split = horaString.split(":");
        if (split[0].length() != 2 || split[1].length() != 2) {
            throw new BadRequestException("A hora deve seguir o padrao " + ex);
        }
        int hora, minuto;
        try {
            hora = Integer.parseInt(split[0]);
            minuto = Integer.parseInt(split[1]);
        } catch (Exception e) {
            throw new BadRequestException("A hora deve seguir o padrao " + ex);
        }
        if (hora < 0 || hora >= 24) {
            throw new BadRequestException("A hora deve estar no intervalo de 0 a 23h. " + ex);
        }
        if (minuto < 0 || minuto >= 60) {
            throw new BadRequestException("O minuto deve estar no intervalo de 0 a 59m. " + ex);
        }
    }

    private void horaInicioMenorQueFim(String horaInicio, String horaFim) {
        int ini = toMinutes(horaInicio);
        int fim = toMinutes(horaFim);
        if (fim - ini <= 0) {
            throw new BadRequestException("A hora de inicio deve ser inferior a hora final.");
        }
    }

    private int toMinutes(String hhmm) {
        String[] p = hhmm.split(":");
        return Integer.parseInt(p[0]) * 60 + Integer.parseInt(p[1]);
    }

    private Double tempoEntreHorarios(String ini, String fim) {
        try {
            return (double) (toMinutes(fim) - toMinutes(ini)) / 60.0;
        } catch (Exception e) {
            return null;
        }
    }

    private void validate(TurnoTrabalhoRequest r) {
        String desc = r.descricao() == null ? "" : r.descricao().trim();
        if (desc.isEmpty()) throw new BadRequestException("Descricao e obrigatoria");
        if (desc.length() < 3) throw new BadRequestException("Descricao deve ter no minimo 3 caracteres");
        if (desc.length() > 255) throw new BadRequestException("Descricao deve ter no maximo 255 caracteres");
        if (r.inicio() == null || r.inicio().trim().isEmpty()) throw new BadRequestException("Inicio e obrigatorio");
        if (r.fim() == null || r.fim().trim().isEmpty()) throw new BadRequestException("Fim e obrigatorio");
        if (r.diaSemanaId() == null) throw new BadRequestException("Dia da semana e obrigatorio");
        verificarHoraValida(r.inicio().trim());
        verificarHoraValida(r.fim().trim());
        horaInicioMenorQueFim(r.inicio().trim(), r.fim().trim());
        if (r.unidadeIds() == null || r.unidadeIds().isEmpty()) {
            throw new BadRequestException("Selecione pelo menos uma unidade");
        }
    }

    // ========== CRUD ==========

    public Uni<List<TurnoTrabalhoResponse>> list() {
        return repository.listAll()
                .flatMap(items -> enrichAll(items));
    }

    public Uni<PagedResponse<TurnoTrabalhoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .flatMap(items -> repository.count()
                        .flatMap(count -> enrichAll(items)
                                .map(enriched -> new PagedResponse<>(enriched, count, p, s))));
    }

    public Uni<TurnoTrabalhoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoTrabalho not found"))
                .flatMap(this::enrichOne);
    }

    public Uni<TurnoTrabalhoResponse> create(TurnoTrabalhoRequest r) {
        validate(r);
        var e = new TurnoTrabalho();
        apply(e, r);
        return checkDiaSemanaExists(r.diaSemanaId())
                .flatMap(v -> checkUnidadesExist(r.unidadeIds()))
                .flatMap(v -> repository.persist(e))
                .flatMap(v -> syncUnidades(e.id, r.unidadeIds()))
                .flatMap(v -> enrichOne(e));
    }

    public Uni<TurnoTrabalhoResponse> update(Long id, TurnoTrabalhoRequest r) {
        validate(r);
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoTrabalho not found"))
                .flatMap(e -> checkDiaSemanaExists(r.diaSemanaId())
                        .flatMap(v -> checkUnidadesExist(r.unidadeIds()))
                        .map(v -> {
                            apply(e, r);
                            return e;
                        }))
                .flatMap(e -> syncUnidades(id, r.unidadeIds()).replaceWith(e))
                .flatMap(this::enrichOne);
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoTrabalho not found"))
                .flatMap(e -> deleteUnidades(id)
                        .flatMap(v -> repository.deleteById(id).map(deleted -> (Void) null)));
    }

    private void apply(TurnoTrabalho e, TurnoTrabalhoRequest r) {
        e.descricao = r.descricao().trim();
        e.inicio = r.inicio().trim();
        e.fim = r.fim().trim();
        e.diaSemanaId = r.diaSemanaId();
    }

    // ========== Enriquecimento (diaSemanaNome + unidadeIds + horas) ==========

    private Uni<TurnoTrabalhoResponse> enrichOne(TurnoTrabalho e) {
        return fetchDiaSemanaNome(e.diaSemanaId)
                .flatMap(nome -> fetchUnidadeIds(e.id)
                        .map(ids -> new TurnoTrabalhoResponse(
                                e.id, e.descricao, e.inicio, e.fim, e.diaSemanaId, nome, ids,
                                tempoEntreHorarios(e.inicio, e.fim))));
    }

    private Uni<List<TurnoTrabalhoResponse>> enrichAll(List<TurnoTrabalho> items) {
        if (items.isEmpty()) return Uni.createFrom().item(List.of());
        List<Uni<TurnoTrabalhoResponse>> unis = items.stream().map(this::enrichOne).toList();
        return Uni.join().all(unis).andCollectFailures();
    }

    private Uni<String> fetchDiaSemanaNome(Long diaSemanaId) {
        if (diaSemanaId == null) return Uni.createFrom().item(null);
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery("SELECT nome FROM bas_dia_semana WHERE id = :id")
                        .setParameter("id", diaSemanaId)
                        .getSingleResultOrNull()
                        .map(o -> o == null ? null : String.valueOf(o)));
    }

    private Uni<List<Long>> fetchUnidadeIds(Long turnoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery("SELECT id_unidade FROM cen_turno_trabalho_unidade WHERE id_turno_trabalho = :id ORDER BY id_unidade")
                        .setParameter("id", turnoId)
                        .getResultList()
                        .map(list -> list.stream().map(o -> ((Number) o).longValue()).toList()));
    }

    private Uni<Void> syncUnidades(Long turnoId, List<Long> unidadeIds) {
        return deleteUnidades(turnoId)
                .flatMap(v -> {
                    if (unidadeIds == null || unidadeIds.isEmpty()) return Uni.createFrom().voidItem();
                    return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                            .chain(session -> {
                                Uni<Void> chain = Uni.createFrom().voidItem();
                                for (Long uid : unidadeIds) {
                                    chain = chain.flatMap(x -> session.createNativeQuery("INSERT INTO cen_turno_trabalho_unidade (id_turno_trabalho, id_unidade) VALUES (:tid, :uid)")
                                            .setParameter("tid", turnoId)
                                            .setParameter("uid", uid)
                                            .executeUpdate()
                                            .replaceWithVoid());
                                }
                                return chain;
                            });
                });
    }

    private Uni<Void> deleteUnidades(Long turnoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery("DELETE FROM cen_turno_trabalho_unidade WHERE id_turno_trabalho = :id")
                        .setParameter("id", turnoId)
                        .executeUpdate()
                        .replaceWithVoid());
    }

    private Uni<Void> checkDiaSemanaExists(Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery("SELECT 1 FROM bas_dia_semana WHERE id = :id")
                        .setParameter("id", id)
                        .getSingleResultOrNull()
                        .flatMap(o -> {
                            if (o != null) return Uni.createFrom().voidItem();
                            // fallback: aceita 1..7 quando tabela vazia (dias estáticos)
                            if (id != null && id >= 1 && id <= 7) {
                                return session.createNativeQuery("SELECT count(*) FROM bas_dia_semana").getSingleResult()
                                        .map(cnt -> ((Number) cnt).longValue())
                                        .flatMap(cnt -> cnt == 0
                                                ? Uni.createFrom().voidItem()
                                                : Uni.createFrom().failure(new BadRequestException("Dia da semana invalido: " + id)));
                            }
                            return Uni.createFrom().failure(new BadRequestException("Dia da semana invalido: " + id));
                        }));
    }

    private Uni<Void> checkUnidadesExist(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return Uni.createFrom().voidItem();
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> {
                    Uni<Void> chain = Uni.createFrom().voidItem();
                    for (Long uid : ids) {
                        chain = chain.flatMap(v -> session.createNativeQuery("SELECT 1 FROM bas_unidade WHERE id = :id")
                                .setParameter("id", uid)
                                .getSingleResultOrNull()
                                .flatMap(o -> o == null
                                        ? Uni.createFrom().failure(new BadRequestException("Unidade invalida: " + uid))
                                        : Uni.createFrom().voidItem()));
                    }
                    return chain;
                });
    }

    // ========== DiaSemana / Unidade opcoes (para combos) ==========

    public Uni<List<Map<String, Object>>> listDiaSemana() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery("SELECT id, nome FROM bas_dia_semana ORDER BY id")
                        .getResultList()
                        .map(list -> {
                            List<Map<String, Object>> out = new ArrayList<>();
                            for (Object row : list) {
                                Object[] arr = (Object[]) row;
                                Map<String, Object> m = new java.util.LinkedHashMap<>();
                                m.put("id", ((Number) arr[0]).longValue());
                                m.put("nome", arr[1] == null ? "" : String.valueOf(arr[1]));
                                out.add(m);
                            }
                            if (!out.isEmpty()) return out;
                            // fallback legado: quando tabela vazia em dev, retorna os 7 dias estáticos (mantém converter funcionando)
                            String[] dias = {"Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"};
                            for (int i = 0; i < dias.length; i++) {
                                Map<String, Object> m = new java.util.LinkedHashMap<>();
                                m.put("id", (long) (i + 1));
                                m.put("nome", dias[i]);
                                out.add(m);
                            }
                            return out;
                        }));
    }

    public Uni<List<Map<String, Object>>> listUnidadeOpcoes(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> {
                    if (query == null || query.trim().isEmpty()) {
                        return session.createNativeQuery("SELECT id, sucinto, razao_social, nome_fantasia FROM bas_unidade WHERE ativo IS TRUE OR ativo IS NULL ORDER BY sucinto LIMIT 50")
                                .getResultList();
                    } else {
                        String q = "%" + query.toLowerCase() + "%";
                        return session.createNativeQuery("SELECT id, sucinto, razao_social, nome_fantasia FROM bas_unidade WHERE (ativo IS TRUE OR ativo IS NULL) AND (lower(sucinto) LIKE :q OR lower(razao_social) LIKE :q OR lower(nome_fantasia) LIKE :q OR CAST(id AS TEXT) = :exact) ORDER BY sucinto LIMIT 50")
                                .setParameter("q", q)
                                .setParameter("exact", query.trim())
                                .getResultList();
                    }
                })
                .map(list -> {
                    List<Map<String, Object>> out = new ArrayList<>();
                    for (Object row : list) {
                        Object[] arr = (Object[]) row;
                        Map<String, Object> m = new java.util.LinkedHashMap<>();
                        m.put("id", ((Number) arr[0]).longValue());
                        m.put("sucinto", arr[1] == null ? "" : String.valueOf(arr[1]));
                        m.put("razaoSocial", arr[2] == null ? "" : String.valueOf(arr[2]));
                        m.put("nomeFantasia", arr[3] == null ? "" : String.valueOf(arr[3]));
                        m.put("label", (arr[1] == null ? "#" + arr[0] : arr[1] + " - " + String.valueOf(arr[2])));
                        out.add(m);
                    }
                    return out;
                });
    }

    // ========== Metodos legados preservados (retornam IDs para compatibilidade) ==========

    public Uni<List<Long>> autoComplete(String query) {
        if (query == null || query.isEmpty()) {
            return repository.find("order by inicio").list().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.find("(lower(descricao) like '%' || ?1 || '%' OR str(id) = ?1) order by descricao", query.toLowerCase()).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteTurnoTrabalho(String query) {
        return repository.find("(lower(descricao) like '%' || ?1 || '%' OR str(id) = ?1) order by descricao", query.toLowerCase()).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarTurnoTrabalhoComUnidades(Long entityId) {
        return repository.buscarTurnoTrabalhoComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarTurnosDaUnidade() {
        return repository.find("order by inicio").list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarUnidadeIds(Long turnoId) {
        return fetchUnidadeIds(turnoId);
    }

    public Uni<String> minTurno() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery("SELECT min(inicio) FROM cen_turno_trabalho").getSingleResultOrNull()
                        .map(o -> o == null ? null : String.valueOf(o)));
    }

    public Uni<String> maxTurno() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery("SELECT max(fim) FROM cen_turno_trabalho").getSingleResultOrNull()
                        .map(o -> o == null ? null : String.valueOf(o)));
    }
}

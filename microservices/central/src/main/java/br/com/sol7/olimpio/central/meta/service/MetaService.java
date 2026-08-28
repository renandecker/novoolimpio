package br.com.sol7.olimpio.central.meta;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.hibernate.reactive.mutiny.Mutiny;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class MetaService {

    @Inject
    MetaRepository repository;

    public Uni<List<MetaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MetaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<Map<String, Object>>> pagedEnriched(int page, int size, String operadorLogin, Long operacionalId, String dataStr) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return Panache.getSession().chain(session -> {
            StringBuilder where = new StringBuilder(" WHERE 1=1 ");
            Map<String, Object> params = new HashMap<>();
            if (operadorLogin != null && !operadorLogin.isBlank()) {
                where.append(" AND lower(uOp.login) LIKE lower(:opLogin) ");
                params.put("opLogin", "%" + operadorLogin.trim() + "%");
            }
            if (operacionalId != null) {
                where.append(" AND m.id_operacional = :opId ");
                params.put("opId", operacionalId);
            }
            if (dataStr != null && !dataStr.isBlank()) {
                where.append(" AND (m.data = :data OR (m.data_inicial IS NOT NULL AND m.data_inicial <= :data AND m.data_final >= :data)) ");
                try {
                    LocalDate ld = LocalDate.parse(dataStr);
                    params.put("data", java.sql.Date.valueOf(ld));
                } catch (Exception ignored) {}
            }
            String baseSelect = "SELECT m.id, m.meta, m.data, m.data_inicial, m.data_final, m.id_operador, m.id_operacional, m.id_usuario_lancou_media, "
                    + "uOp.login as operador_login, "
                    + "cp.id as operacional_pacote_id, cp.descricao as operacional_pacote_descricao "
                    + "FROM cen_meta m "
                    + "LEFT JOIN bas_usuario uOp ON uOp.id = m.id_operador "
                    + "LEFT JOIN cen_operacional cOp ON cOp.id = m.id_operacional "
                    + "LEFT JOIN com_pacote cp ON cp.id = cOp.id_pacote ";

            String countSql = "SELECT count(*) FROM cen_meta m "
                    + "LEFT JOIN bas_usuario uOp ON uOp.id = m.id_operador "
                    + "LEFT JOIN cen_operacional cOp ON cOp.id = m.id_operacional "
                    + "LEFT JOIN com_pacote cp ON cp.id = cOp.id_pacote " + where;
            String selectSql = baseSelect + where + " ORDER BY m.id DESC LIMIT :limit OFFSET :offset";

            Mutiny.Query countQuery = session.createNativeQuery(countSql);
            for (var e : params.entrySet()) countQuery.setParameter(e.getKey(), e.getValue());
            Uni<Long> total = countQuery.getSingleResult().map(r -> ((Number) r).longValue());

            Mutiny.Query selectQuery = session.createNativeQuery(selectSql);
            for (var e : params.entrySet()) selectQuery.setParameter(e.getKey(), e.getValue());
            selectQuery.setParameter("limit", s);
            selectQuery.setParameter("offset", (long) p * s);
            Uni<List<Map<String, Object>>> rows = selectQuery.getResultList().map(list -> {
                List<Map<String, Object>> out = new ArrayList<>();
                for (Object rowObj : list) {
                    Object[] arr = (Object[]) rowObj;
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", arr[0]);
                    m.put("meta", arr[1]);
                    m.put("data", arr[2]);
                    m.put("dataInicial", arr[3]);
                    m.put("dataFinal", arr[4]);
                    m.put("operadorId", arr[5]);
                    m.put("operacionalId", arr[6]);
                    m.put("usuarioId", arr[7]);
                    m.put("operadorLogin", arr[8]);
                    m.put("operacionalPacoteId", arr[9]);
                    m.put("operacionalPacoteDescricao", arr[10]);
                    out.add(m);
                }
                return out;
            });
            return total.flatMap(count -> rows.map(content -> new PagedResponse<>(content, count, p, s)));
        });
    }

    public Uni<MetaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Meta not found"))
                .map(this::toResponse);
    }

    public Uni<MetaResponse> create(MetaRequest r) {
        validateCreate(r);
        var e = new Meta();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MetaResponse> update(Long id, MetaRequest r) {
        validateUpdate(id, r);
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Meta not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Meta not found")));
    }

    private void apply(Meta e, MetaRequest r) {
        e.operadorId = r.operadorId();
        e.meta = r.meta();
        e.data = r.data();
        e.dataInicial = r.dataInicial();
        e.dataFinal = r.dataFinal();
        e.operacionalId = r.operacionalId();
        e.usuarioId = r.usuarioId();
    }

    private MetaResponse toResponse(Meta e) {
        return new MetaResponse(e.id, e.operadorId, e.meta, e.data, e.dataInicial, e.dataFinal, e.operacionalId, e.usuarioId, null, null, null);
    }

    private void validateCreate(MetaRequest r) {
        if (r.meta() == null) throw new BadRequestException("Meta diaria e obrigatoria");
        Boolean periodo = r.periodo() != null ? r.periodo() : false;
        Boolean equipe = r.equipe() != null ? r.equipe() : false;
        LocalDate hojeMenosUm = LocalDate.now().minusDays(1);

        if (periodo) {
            if (r.dataInicial() == null) throw new BadRequestException("Data inicial e obrigatoria");
            if (r.dataFinal() == null) throw new BadRequestException("Data final e obrigatoria");
            if (r.data() != null) throw new BadRequestException("Data deve ser nula quando periodo e true");
            if (equipe) {
                if (r.operacionalId() == null) throw new BadRequestException("Equipe e obrigatoria");
                if (r.operadorId() != null) throw new BadRequestException("Operador deve ser nulo quando equipe e true");
                // conflito equipe - verificar no service
                List<Long> conflitos = repository.find("operacionalId=?3 and (dataInicial BETWEEN ?1 AND ?2 or dataFinal BETWEEN ?1 AND ?2)", r.dataInicial(), r.dataFinal(), r.operacionalId()).list().await().indefinitely().stream().map(x -> x.id).toList();
                if (!conflitos.isEmpty()) throw new BadRequestException("Já existe uma meta cadastrada para essa equipe no periodo selecionado");
            } else {
                if (r.operadorId() == null) throw new BadRequestException("Operador e obrigatorio");
                if (r.operacionalId() != null) throw new BadRequestException("Equipe deve ser nula quando operador e true");
                List<Long> conflitos = repository.find("operadorId=?3 and (dataInicial BETWEEN ?1 AND ?2 or dataFinal BETWEEN ?1 AND ?2)", r.dataInicial(), r.dataFinal(), r.operadorId()).list().await().indefinitely().stream().map(x -> x.id).toList();
                if (!conflitos.isEmpty()) throw new BadRequestException("Já existe uma meta cadastrada para esse operador no periodo selecionado");
            }
            try {
                LocalDate dataIni = r.dataInicial().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (hojeMenosUm.isAfter(dataIni)) throw new BadRequestException("Data selecionada invalida, dia inferior ao dia de hoje");
            } catch (Exception ignored) {}
        } else {
            if (r.data() == null) throw new BadRequestException("Data e obrigatoria");
            if (r.dataInicial() != null) throw new BadRequestException("Data inicial deve ser nula quando periodo e false");
            try {
                LocalDate data = r.data().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (hojeMenosUm.isAfter(data)) throw new BadRequestException("Data selecionada invalida, dia inferior ao dia de hoje");
            } catch (Exception ignored) {}
        }
    }

    private void validateUpdate(Long id, MetaRequest r) {
        if (r.meta() == null) throw new BadRequestException("Meta diaria e obrigatoria");
        Boolean periodo = r.periodo() != null ? r.periodo() : false;
        Boolean equipe = r.equipe() != null ? r.equipe() : false;
        LocalDate hojeMenosUm = LocalDate.now().minusDays(1);

        if (periodo) {
            if (r.dataInicial() == null) throw new BadRequestException("Data inicial e obrigatoria");
            if (r.dataFinal() == null) throw new BadRequestException("Data final e obrigatoria");
            if (r.data() != null) throw new BadRequestException("Data deve ser nula quando periodo e true");
            if (equipe) {
                if (r.operacionalId() == null) throw new BadRequestException("Equipe e obrigatoria");
                if (r.operadorId() != null) throw new BadRequestException("Operador deve ser nulo quando equipe e true");
                List<Long> conflitos = repository.find("operacionalId=?3 and (dataInicial BETWEEN ?1 AND ?2 or dataFinal BETWEEN ?1 AND ?2) and id <> ?4", r.dataInicial(), r.dataFinal(), r.operacionalId(), id).list().await().indefinitely().stream().map(x -> x.id).toList();
                if (!conflitos.isEmpty()) throw new BadRequestException("Já existe uma meta cadastrada para essa equipe no periodo selecionado");
            } else {
                if (r.operadorId() == null) throw new BadRequestException("Operador e obrigatorio");
                if (r.operacionalId() != null) throw new BadRequestException("Equipe deve ser nula quando operador e true");
                List<Long> conflitos = repository.find("operadorId=?3 and (dataInicial BETWEEN ?1 AND ?2 or dataFinal BETWEEN ?1 AND ?2) and id <> ?4", r.dataInicial(), r.dataFinal(), r.operadorId(), id).list().await().indefinitely().stream().map(x -> x.id).toList();
                if (!conflitos.isEmpty()) throw new BadRequestException("Já existe uma meta cadastrada para esse operador no periodo selecionado");
            }
            try {
                LocalDate dataIni = r.dataInicial().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                if (hojeMenosUm.isAfter(dataIni)) throw new BadRequestException("Data selecionada invalida, dia inferior ao dia de hoje");
            } catch (Exception ignored) {}
        } else {
            if (r.data() == null) throw new BadRequestException("Data e obrigatoria");
            if (r.dataInicial() != null) throw new BadRequestException("Data inicial deve ser nula quando periodo e false");
        }
    }

    public Uni<Void> atualizarOperadores(String event) {
        return Uni.createFrom().voidItem();
    }

    public Uni<Integer> buscarMetaOperadorDia(Date data, Long operadorId) {
        return repository.buscarMetaOperadorDia(data, operadorId).map(list -> list.isEmpty() ? null : list.get(0).meta);
    }

    public Uni<Integer> buscarMetaOperador(Date data, Long operadorId) {
        return repository.buscarMetaOperador(data, operadorId).map(list -> list.isEmpty() ? null : list.get(0).meta);
    }

    public Uni<List<Long>> buscarConflitoDatasComEquipe(Date dataInicial, Date dataFinal, Long operacionalId) {
        return repository.buscarConflitoDatasComEquipe(dataInicial, dataFinal, operacionalId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarConflitoDatasComEquipeComMeta(Date dataInicial, Date dataFinal, Long operacionalId, Integer id) {
        return repository.buscarConflitoDatasComEquipeComMeta(dataInicial, dataFinal, operacionalId, id).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarConflitoDatasComOperador(Date dataInicial, Date dataFinal, Long operadorId) {
        return repository.buscarConflitoDatasComOperador(dataInicial, dataFinal, operadorId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarConflitoDatasComOperadorComMeta(Date dataInicial, Date dataFinal, Long operadorId, Integer id) {
        return repository.buscarConflitoDatasComOperadorComMeta(dataInicial, dataFinal, operadorId, id).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Integer> buscarMetaOperadorPeriodo(Date data, Long operadorId) {
        return repository.buscarMetaOperadorPeriodo(data, operadorId).map(list -> list.isEmpty() ? null : list.get(0).meta);
    }

    public Uni<List<Map<String, Object>>> operadoresDisponiveis(Long coordenadorId, String dataStr) {
        if (coordenadorId == null || dataStr == null || dataStr.isBlank()) {
            return Uni.createFrom().item(List.of());
        }
        return Panache.getSession().chain(session -> {
            LocalDate data;
            try {
                data = LocalDate.parse(dataStr);
            } catch (Exception e) {
                return Uni.createFrom().item(List.of());
            }
            String sql = "SELECT u.id, u.login "
                    + "FROM bas_usuario u "
                    + "JOIN cen_operacional_usuario cou ON cou.id_usuario = u.id "
                    + "JOIN cen_operacional o ON o.id = cou.id_operacional "
                    + "WHERE o.id_coordenador = :coordId "
                    + "AND o.status = 'INICIADO' "
                    + "AND u.id NOT IN ("
                    + "  SELECT m.id_operador FROM cen_meta m "
                    + "  WHERE m.data = :data OR (m.data_inicial IS NOT NULL AND m.data_inicial <= :data AND m.data_final >= :data)"
                    + ") "
                    + "ORDER BY u.login";
            return session.createNativeQuery(sql)
                    .setParameter("coordId", coordenadorId)
                    .setParameter("data", java.sql.Date.valueOf(data))
                    .getResultList().map(list -> {
                        List<Map<String, Object>> out = new ArrayList<>();
                        for (Object rowObj : list) {
                            Object[] arr = (Object[]) rowObj;
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", arr[0]);
                            m.put("login", arr[1]);
                            out.add(m);
                        }
                        return out;
                    });
        });
    }

    public Uni<List<Map<String, Object>>> operacionaisDoCoordenador(Long coordenadorId) {
        if (coordenadorId == null) {
            return Uni.createFrom().item(List.of());
        }
        return Panache.getSession().chain(session -> {
            String sql = "SELECT o.id, o.id_pacote, cp.descricao "
                    + "FROM cen_operacional o "
                    + "LEFT JOIN com_pacote cp ON cp.id = o.id_pacote "
                    + "WHERE o.id_coordenador = :coordId AND o.status = 'INICIADO' "
                    + "ORDER BY o.id";
            return session.createNativeQuery(sql)
                    .setParameter("coordId", coordenadorId)
                    .getResultList().map(list -> {
                        List<Map<String, Object>> out = new ArrayList<>();
                        for (Object rowObj : list) {
                            Object[] arr = (Object[]) rowObj;
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", arr[0]);
                            m.put("pacoteId", arr[1]);
                            m.put("pacoteDescricao", arr[2]);
                            out.add(m);
                        }
                        return out;
                    });
        });
    }
}
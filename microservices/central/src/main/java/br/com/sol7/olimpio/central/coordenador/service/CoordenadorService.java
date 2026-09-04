package br.com.sol7.olimpio.central.coordenador;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.GenericSearchService;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.hibernate.reactive.mutiny.Mutiny;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@ApplicationScoped
@WithTransaction
public class CoordenadorService {
    @Inject
    CoordenadorRepository repository;

    @Inject
    GenericSearchService genericSearch;

    public Uni<List<CoordenadorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toEnrichedResponse).toList());
    }

    public Uni<PagedResponse<CoordenadorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toEnrichedResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<CoordenadorResponse>> search(SearchFilterRequest request, int page, int size) {
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return genericSearch.search(Coordenador.class, request, page, s)
                .map(paged -> new PagedResponse<>(
                        paged.content().stream().map(this::toEnrichedResponse).toList(),
                        paged.totalElements(), paged.page(), paged.size()));
    }

    public Uni<PagedResponse<Map<String, Object>>> pagedEnriched(int page, int size, String operadorLogin, String coordenadorLogin, String dataStr) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return Panache.getSession().chain(session -> {
            StringBuilder where = new StringBuilder(" WHERE 1=1 ");
            Map<String, Object> params = new HashMap<>();
            if (operadorLogin != null && !operadorLogin.isBlank()) {
                where.append(" AND lower(uOp.login) LIKE lower(:opLogin) ");
                params.put("opLogin", "%" + operadorLogin.trim() + "%");
            }
            if (coordenadorLogin != null && !coordenadorLogin.isBlank()) {
                where.append(" AND lower(uCoord.login) LIKE lower(:coordLogin) ");
                params.put("coordLogin", "%" + coordenadorLogin.trim() + "%");
            }
            if (dataStr != null && !dataStr.isBlank()) {
                where.append(" AND c.data = :data ");
                try {
                    LocalDate ld = LocalDate.parse(dataStr);
                    params.put("data", java.sql.Date.valueOf(ld));
                } catch (Exception ignored) {}
            }
            String baseSelect = "SELECT c.id, c.id_operador, c.id_coordenador, c.data, c.ligacao, c.meta, c.agendado, c.pausa, c.prioritario, " +
                    " uOp.login as op_login, COALESCE(pfOp.nome, pjOp.razao_social, uOp.login) as op_nome, " +
                    " uCoord.login as coord_login, COALESCE(pfCoord.nome, pjCoord.razao_social, uCoord.login) as coord_nome " +
                    " FROM cen_coordenador c " +
                    " LEFT JOIN bas_usuario uOp ON uOp.id = c.id_operador " +
                    " LEFT JOIN bas_pessoa pOp ON pOp.id = uOp.id_pessoa " +
                    " LEFT JOIN bas_pessoa_fisica pfOp ON pfOp.id_pessoa = pOp.id " +
                    " LEFT JOIN bas_pessoa_juridica pjOp ON pjOp.id_pessoa = pOp.id " +
                    " LEFT JOIN bas_usuario uCoord ON uCoord.id = c.id_coordenador " +
                    " LEFT JOIN bas_pessoa pCoord ON pCoord.id = uCoord.id_pessoa " +
                    " LEFT JOIN bas_pessoa_fisica pfCoord ON pfCoord.id_pessoa = pCoord.id " +
                    " LEFT JOIN bas_pessoa_juridica pjCoord ON pjCoord.id_pessoa = pCoord.id ";

            String countSql = "SELECT count(*) FROM cen_coordenador c " +
                    " LEFT JOIN bas_usuario uOp ON uOp.id = c.id_operador " +
                    " LEFT JOIN bas_usuario uCoord ON uCoord.id = c.id_coordenador " + where;
            String selectSql = baseSelect + where + " ORDER BY c.id DESC LIMIT :limit OFFSET :offset";

            Mutiny.Query countQuery = session.createNativeQuery(countSql);
            for (var e : params.entrySet()) countQuery.setParameter(e.getKey(), e.getValue());
            Uni<Long> total = countQuery.getSingleResult().map(r -> ((Number) r).longValue());

            Mutiny.Query selectQuery = session.createNativeQuery(selectSql);
            for (var e : params.entrySet()) selectQuery.setParameter(e.getKey(), e.getValue());
            selectQuery.setParameter("limit", s);
            selectQuery.setParameter("offset", (long) p * s);
            Uni<List<Map<String,Object>>> rows = selectQuery.getResultList().map(list -> {
                List<Map<String,Object>> out = new ArrayList<>();
                List<?> rawList = (List<?>) list;
                for (Object rowObj : rawList) {
                    Object[] arr = (Object[]) rowObj;
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", arr[0]);
                    m.put("id_operador", arr[1]);
                    m.put("id_coordenador", arr[2]);
                    m.put("data", arr[3]);
                    m.put("ligacao", arr[4]);
                    m.put("meta", arr[5]);
                    m.put("agendado", arr[6]);
                    m.put("pausa", arr[7]);
                    m.put("prioritario", arr[8]);
                    m.put("operador_login", arr[9]);
                    m.put("operador_descricao", arr[10] != null ? arr[10] : arr[9]);
                    m.put("coordenador_login", arr[11]);
                    m.put("coordenador_descricao", arr[12] != null ? arr[12] : arr[11]);
                    // computed fields placeholders - will be filled async if needed, for now static
                    m.put("turno", "");
                    m.put("situacao", "");
                    m.put("operador_nome", arr[10]);
                    m.put("coordenador_nome", arr[12]);
                    out.add(m);
                }
                return out;
            });
            return total.flatMap(count -> rows.map(content -> new PagedResponse<>(content, count, p, s)));
        });
    }

    public Uni<CoordenadorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Coordenador not found")).map(this::toEnrichedResponse);
    }

    public Uni<CoordenadorResponse> create(CoordenadorRequest r) {
        var e = new Coordenador();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toEnrichedResponse(e));
    }

    public Uni<CoordenadorResponse> update(Long id, CoordenadorRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Coordenador not found")).invoke(e -> apply(e, r)).map(this::toEnrichedResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Coordenador not found")));
    }

    private void apply(Coordenador e, CoordenadorRequest r) {
        e.operadorId = r.idOperador();
        e.coordenadorId = r.idCoordenador();
        e.data = r.data();
        e.ligacao = r.ligacao();
        e.meta = r.meta();
        e.agendado = r.agendado();
        e.pausa = r.pausa();
        e.prioritario = r.prioritario();
    }

    private CoordenadorResponse toEnrichedResponse(Coordenador e) {
        return new CoordenadorResponse(e.id, e.operadorId, null, null, e.coordenadorId, null, null, e.data, e.ligacao, e.meta, e.agendado, e.pausa, e.prioritario, "", "");
    }

    public Uni<List<Map<String,Object>>> autoCompleteCoordenador(String query) {
        String q = query == null ? "" : query.toLowerCase();
        return Panache.getSession().chain(session ->
            session.createNativeQuery(
                "SELECT u.id, u.login, COALESCE(pf.nome, pj.razao_social, u.login) as nome " +
                " FROM bas_usuario u " +
                " LEFT JOIN bas_pessoa p ON p.id = u.id_pessoa " +
                " LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
                " LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = p.id " +
                " WHERE lower(u.login) LIKE :q OR lower(COALESCE(pf.nome,'')) LIKE :q OR lower(COALESCE(pj.razao_social,'')) LIKE :q " +
                " ORDER BY u.login LIMIT 20"
            ).setParameter("q", "%" + q + "%").getResultList().map(list -> {
                List<Map<String,Object>> out = new ArrayList<>();
                for (Object rowObj : list) {
                    Object[] arr = (Object[]) rowObj;
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", arr[0]);
                    m.put("login", arr[1]);
                    m.put("nome", arr[2]);
                    m.put("label", arr[1] + " - " + arr[2]);
                    out.add(m);
                }
                return out;
            })
        );
    }

    public Uni<String> obterTurnos(Long operadorId) {
        if (operadorId == null) return Uni.createFrom().item("");
        int diaSemana = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
        return Panache.getSession().chain(session ->
            session.createNativeQuery(
                "SELECT t.descricao, t.inicio, t.fim FROM cen_turno_trabalho t " +
                " JOIN cen_turno_usuario tu ON tu.id_turno = t.id WHERE tu.id_usuario = :uid AND t.id_dia_semana = :dia"
            ).setParameter("uid", operadorId.intValue()).setParameter("dia", diaSemana).getResultList().map(list -> {
                if (list.isEmpty()) return "";
                StringBuilder sb = new StringBuilder();
                for (Object rowObj : list) {
                    Object[] arr = (Object[]) rowObj;
                    if (sb.length()>0) sb.append(" / ");
                    sb.append(arr[0]).append(" ").append(arr[1]).append("-").append(arr[2]);
                }
                return sb.toString();
            })
        );
    }

    public Uni<String> situacao(Long operadorId) {
        if (operadorId == null) return Uni.createFrom().item("");
        return Panache.getSession().chain(session ->
            session.createNativeQuery("SELECT id FROM cen_pausa WHERE id_operador = :uid AND data_final IS NULL LIMIT 1")
                .setParameter("uid", operadorId.intValue()).getResultList().flatMap(pausas -> {
                    if (!pausas.isEmpty()) return Uni.createFrom().item("Pausa");
                    return session.createNativeQuery("SELECT tipo FROM cen_ponto WHERE id_usuario = :uid AND data = CURRENT_DATE ORDER BY id DESC LIMIT 1")
                        .setParameter("uid", operadorId.intValue()).getResultList().map(pontos -> {
                            if (pontos.isEmpty()) return "Ausente";
                            Object tp = pontos.get(0);
                            String tipo = tp instanceof Object[] ? String.valueOf(((Object[]) tp)[0]) : String.valueOf(tp);
                            if ("S".equalsIgnoreCase(tipo)) return "Saiu";
                            return "Acessando";
                        });
                })
        );
    }

    public Uni<Void> pausarOperador(Long operadorId, Long usuarioLogadoId) {
        return Panache.getSession().chain(session ->
            session.createNativeQuery("INSERT INTO cen_pausa (id_operador, id_usuario, data_inicial, fl_estorado) VALUES (:op, :usr, now(), false)")
                .setParameter("op", operadorId.intValue()).setParameter("usr", usuarioLogadoId != null ? usuarioLogadoId.intValue() : operadorId.intValue()).executeUpdate().replaceWithVoid()
        );
    }

    public Uni<Void> removerPausa(Long operadorId) {
        return Panache.getSession().chain(session ->
            session.createNativeQuery("UPDATE cen_pausa SET data_final = now() WHERE id_operador = :op AND data_final IS NULL")
                .setParameter("op", operadorId.intValue()).executeUpdate().replaceWithVoid()
        );
    }

    public Uni<String> verificaPausado(Long operadorId) {
        return Panache.getSession().chain(session ->
            session.createNativeQuery("SELECT count(*) FROM cen_pausa WHERE id_operador = :op AND data_final IS NULL")
                .setParameter("op", operadorId.intValue()).getSingleResult().map(c -> ((Number) c).longValue() > 0 ? "true" : "false")
        );
    }

    public Uni<List<Map<String,Object>>> listarLigacoes(Long operadorId, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return Panache.getSession().chain(session ->
            session.createNativeQuery(
                "SELECT l.id, l.data_inicial, l.data_final, l.telefone_discado, l.relato, l.id_resultado_contato, rc.descricao as resultado_desc, l.id_ordem_ligacao, ol.id_prospecto, pr.nome as prospecto_nome, l.id_compromisso, c.data as compromisso_data " +
                " FROM cen_ligacao l LEFT JOIN cen_resultado_contato rc ON rc.id = l.id_resultado_contato " +
                " LEFT JOIN cen_ordem_ligacao ol ON ol.id = l.id_ordem_ligacao " +
                " LEFT JOIN com_prospecto pr ON pr.id = ol.id_prospecto " +
                " LEFT JOIN bas_compromisso c ON c.id = l.id_compromisso " +
                " WHERE l.id_usuario = :op ORDER BY l.data_inicial DESC LIMIT :lim OFFSET :off"
            ).setParameter("op", operadorId.intValue()).setParameter("lim", s).setParameter("off", (long)p*s).getResultList().map(list -> {
                List<Map<String,Object>> out = new ArrayList<>();
                for (Object rowObj : list) {
                    Object[] arr = (Object[]) rowObj;
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", arr[0]);
                    m.put("dataInicial", arr[1]);
                    m.put("dataFinal", arr[2]);
                    m.put("telefoneDiscado", arr[3]);
                    m.put("relato", arr[4]);
                    m.put("resultadoContatoId", arr[5]);
                    m.put("resultadoDescricao", arr[6]);
                    m.put("ordemLigacaoId", arr[7]);
                    m.put("prospectoId", arr[8]);
                    m.put("prospectoNome", arr[9]);
                    m.put("compromissoId", arr[10]);
                    m.put("compromissoData", arr[11]);
                    // tempo calculado no frontend
                    out.add(m);
                }
                return out;
            })
        );
    }

    public Uni<List<Map<String,Object>>> listarOrdemLigacoes(Long operadorId, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return Panache.getSession().chain(session ->
            session.createNativeQuery(
                "SELECT ol.id, ol.id_prospecto, pr.nome as prospecto_nome FROM cen_ordem_ligacao ol " +
                " LEFT JOIN com_prospecto pr ON pr.id = ol.id_prospecto WHERE ol.id_operador = :op ORDER BY ol.id DESC LIMIT :lim OFFSET :off"
            ).setParameter("op", operadorId.intValue()).setParameter("lim", s).setParameter("off", (long)p*s).getResultList().map(list -> {
                List<Map<String,Object>> out = new ArrayList<>();
                for (Object rowObj : list) {
                    Object[] arr = (Object[]) rowObj;
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", arr[0]);
                    m.put("prospectoId", arr[1]);
                    m.put("prospectoNome", arr[2]);
                    out.add(m);
                }
                return out;
            })
        );
    }

    public Uni<List<Map<String,Object>>> listarFilaPrioritaria(Long operadorId, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return Panache.getSession().chain(session ->
            session.createNativeQuery(
                "SELECT fp.id, fp.data, fp.id_ligacao, l.telefone_discado, l.relato, rc.descricao as res_desc, pr.nome as prospecto_nome, l.data_inicial, l.data_final FROM cen_fila_prioritaria fp " +
                " LEFT JOIN cen_ligacao l ON l.id = fp.id_ligacao LEFT JOIN cen_resultado_contato rc ON rc.id = l.id_resultado_contato " +
                " LEFT JOIN cen_ordem_ligacao ol ON ol.id = l.id_ordem_ligacao LEFT JOIN com_prospecto pr ON pr.id = ol.id_prospecto " +
                " WHERE l.id_usuario = :op ORDER BY fp.data DESC LIMIT :lim OFFSET :off"
            ).setParameter("op", operadorId.intValue()).setParameter("lim", s).setParameter("off", (long)p*s).getResultList().map(list -> {
                List<Map<String,Object>> out = new ArrayList<>();
                for (Object rowObj : list) {
                    Object[] arr = (Object[]) rowObj;
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", arr[0]);
                    m.put("data", arr[1]);
                    m.put("ligacaoId", arr[2]);
                    m.put("telefoneDiscado", arr[3]);
                    m.put("relato", arr[4]);
                    m.put("resultadoDescricao", arr[5]);
                    m.put("prospectoNome", arr[6]);
                    m.put("dataInicial", arr[7]);
                    m.put("dataFinal", arr[8]);
                    out.add(m);
                }
                return out;
            })
        );
    }

    public Uni<List<Map<String,Object>>> listarPausas(Long operadorId, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return Panache.getSession().chain(session ->
            session.createNativeQuery(
                "SELECT p.id, p.id_usuario, u.login as usuario_login, p.data_inicial, p.data_final, p.id_tipo_pausa, tp.descricao as tipo_desc, p.observacao, p.fl_estorado FROM cen_pausa p " +
                " LEFT JOIN bas_usuario u ON u.id = p.id_usuario LEFT JOIN cen_tipo_pausa tp ON tp.id = p.id_tipo_pausa WHERE p.id_operador = :op ORDER BY p.data_inicial DESC LIMIT :lim OFFSET :off"
            ).setParameter("op", operadorId.intValue()).setParameter("lim", s).setParameter("off", (long)p*s).getResultList().map(list -> {
                List<Map<String,Object>> out = new ArrayList<>();
                for (Object rowObj : list) {
                    Object[] arr = (Object[]) rowObj;
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", arr[0]);
                    m.put("usuarioId", arr[1]);
                    m.put("usuarioLogin", arr[2]);
                    m.put("dataInicial", arr[3]);
                    m.put("dataFinal", arr[4]);
                    m.put("tipoPausaId", arr[5]);
                    m.put("tipoPausaDescricao", arr[6]);
                    m.put("observacao", arr[7]);
                    m.put("estorado", arr[8]);
                    out.add(m);
                }
                return out;
            })
        );
    }

    public Uni<List<Map<String,Object>>> listarCompromissos(Long operadorId, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return Panache.getSession().chain(session ->
            session.createNativeQuery(
                "SELECT c.id, c.descricao, c.data, c.observacao, sc.descricao as status_desc FROM bas_compromisso c LEFT JOIN bas_status_compromisso sc ON sc.id = c.id_status_compromisso WHERE c.id_usuario = :op OR c.id_atendente = :op ORDER BY c.data DESC LIMIT :lim OFFSET :off"
            ).setParameter("op", operadorId.intValue()).setParameter("lim", s).setParameter("off", (long)p*s).getResultList().map(list -> {
                List<Map<String,Object>> out = new ArrayList<>();
                for (Object rowObj : list) {
                    Object[] arr = (Object[]) rowObj;
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id", arr[0]);
                    m.put("descricao", arr[1]);
                    m.put("data", arr[2]);
                    m.put("observacao", arr[3]);
                    m.put("statusDescricao", arr[4]);
                    out.add(m);
                }
                return out;
            })
        );
    }

    public Uni<Map<String,Object>> buscarLigacoesPie(Long operadorId) {
        return Panache.getSession().chain(session ->
            session.createNativeQuery("SELECT rc.descricao, count(l.id) FROM cen_ligacao l JOIN cen_resultado_contato rc ON rc.id = l.id_resultado_contato WHERE l.id_usuario = :op GROUP BY rc.descricao")
                .setParameter("op", operadorId.intValue()).getResultList().map(list -> {
                    Map<String,Object> out = new LinkedHashMap<>();
                    long total = 0;
                    for (Object rowObj : list) {
                        Object[] arr = (Object[]) rowObj;
                        String desc = String.valueOf(arr[0]);
                        long cnt = ((Number) arr[1]).longValue();
                        out.put(desc, cnt);
                        total += cnt;
                    }
                    out.put("total", total);
                    return out;
                })
        );
    }

    public Uni<Void> confirmaTrocaPrioritaria(Long deOperadorId, Long paraOperadorId) {
        return Panache.getSession().chain(session ->
            session.createNativeQuery("UPDATE cen_ligacao SET id_usuario = :para WHERE id IN (SELECT l.id FROM cen_fila_prioritaria fp JOIN cen_ligacao l ON l.id = fp.id_ligacao WHERE l.id_usuario = :de)")
                .setParameter("para", paraOperadorId.intValue()).setParameter("de", deOperadorId.intValue()).executeUpdate().replaceWithVoid()
        );
    }

    public Uni<Void> confirmaTrocaLigacao(Long operadorId) {
        return Panache.getSession().chain(session ->
            session.createNativeQuery("SELECT id_usuario FROM bas_usuario WHERE id IN (SELECT id_operador FROM cen_coordenador WHERE id_coordenador = (SELECT id_coordenador FROM cen_coordenador WHERE id_operador = :op LIMIT 1) AND id_operador != :op)")
                .setParameter("op", operadorId.intValue()).getResultList().flatMap(outros -> {
                    if (outros.isEmpty()) return Uni.createFrom().voidItem();
                    return session.createNativeQuery("SELECT id FROM cen_ordem_ligacao WHERE id_operador = :op ORDER BY id")
                        .setParameter("op", operadorId.intValue()).getResultList().flatMap(ordens -> {
                            if (ordens.isEmpty()) return Uni.createFrom().voidItem();
                            List<Uni<Void>> updates = new ArrayList<>();
                            int idx = 0;
                            for (Object ordIdObj : ordens) {
                                Long ordId = ((Number) ordIdObj).longValue();
                                Object targetOpObj = outros.get(idx % outros.size());
                                Long targetOp = targetOpObj instanceof Number ? ((Number) targetOpObj).longValue() : Long.valueOf(String.valueOf(targetOpObj));
                                updates.add(session.createNativeQuery("UPDATE cen_ordem_ligacao SET id_operador = :novo WHERE id = :id")
                                    .setParameter("novo", targetOp.intValue()).setParameter("id", ordId.intValue()).executeUpdate().replaceWithVoid());
                                idx++;
                            }
                            Uni<Void> chain = Uni.createFrom().voidItem();
                            for (Uni<Void> u : updates) chain = chain.chain(() -> u);
                            return chain;
                        });
                })
        );
    }

    public Uni<List<String>> telefonesProspecto(Long prospectoId){
        return Panache.getSession().chain(session ->
            session.createNativeQuery("SELECT valor FROM com_prospecto_campo pc JOIN com_campo c ON c.id = pc.id_campo WHERE pc.id_prospecto = :pid AND lower(c.descricao) LIKE '%telefone%'")
                .setParameter("pid", prospectoId.intValue()).getResultList().map(list -> list.stream().map(o -> o instanceof Object[] ? String.valueOf(((Object[])o)[0]) : String.valueOf(o)).toList())
        );
    }
}

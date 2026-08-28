package br.com.sol7.olimpio.comercial.prospectolist;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.hibernate.query.Tuple;
import org.hibernate.reactive.mutiny.Mutiny;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;

import io.smallrye.mutiny.Uni;

@ApplicationScoped
@WithTransaction
public class ProspectoListService {
    @Inject
    ProspectoListRepository repository;

    public Uni<List<ProspectoListResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ProspectoListResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ProspectoListResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("ProspectoList not found")).map(this::toResponse);
    }

    public Uni<ProspectoListResponse> create(ProspectoListRequest r) {
        var e = new ProspectoList();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ProspectoListResponse> update(Long id, ProspectoListRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("ProspectoList not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("ProspectoList not found")));
    }

    private void apply(ProspectoList e, ProspectoListRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private ProspectoListResponse toResponse(ProspectoList e) {
        return new ProspectoListResponse(e.id, e.nome, e.dadosJson);
    }

    // ===== Native SQL Business Methods =====

    /**
     * Retorna quantidade de ligações por resultado para um prospecto.
     * Equivalent to: LigacaoProspectoService.buscarProspectoLigacaoPeloProspecto
     * Source table: cen_ligacao_prospecto join cen_resultado_contato
     */
    public Uni<List<Map<String, Object>>> carregarQuantidadeLigacao(Long prospectoId) {
        String sql = """
            SELECT rc.descricao AS resultado, lp.quantidade
            FROM cen_ligacao_prospecto lp
            JOIN cen_resultado_contato rc ON rc.id = lp.id_resultado_contato
            WHERE lp.id_prospecto = :pid
            ORDER BY lp.quantidade DESC
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter("pid", prospectoId)
                        .getResultList())
                .map(rows -> toMapList(rows, List.of("resultado", "quantidade")));
    }

    /**
     * Retorna histórico de ligações do prospecto com detalhes.
     * Equivalent to: LigacaoService.buscarHistoricoTodasLigacaoProspecto
     * Source: cen_ligacao join cen_ordem_ligacao join bas_usuario (operador) join cen_resultado_contato
     */
    public Uni<List<Map<String, Object>>> carregarHistoricoLigacao(Long prospectoId) {
        String sql = """
            SELECT
                l.id,
                u.login AS operador,
                l.data_inicial AS dataInicial,
                l.data_final AS dataFinal,
                rc.descricao AS resultado,
                l.relato
            FROM cen_ligacao l
            JOIN cen_ordem_ligacao ol ON ol.id = l.id_ordem_ligacao
            LEFT JOIN bas_usuario u ON u.id = l.id_usuario
            LEFT JOIN cen_resultado_contato rc ON rc.id = l.id_resultado_contato
            WHERE ol.id_prospecto = :pid
            ORDER BY l.data_inicial DESC
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter("pid", prospectoId)
                        .getResultList())
                .map(rows -> toMapList(rows, List.of("id", "operador", "dataInicial", "dataFinal", "resultado", "relato")));
    }

    /**
     * Lista links de prospecto (gerador de link para cadastro).
     * Equivalent to: carregarProspectosLink() in JSF controller
     * Source: com_prospecto_link join bas_usuario join com_acao join bas_unidade
     */
    public Uni<List<Map<String, Object>>> carregarProspectosLink() {
        String sql = """
            SELECT
                pl.id,
                a.descricao AS acao,
                un.nome_fantasia AS unidade,
                u.login AS usuario,
                pl.fl_ativo AS ativo,
                pl.link,
                pl.token
            FROM com_prospecto_link pl
            JOIN bas_usuario u ON u.id = pl.id_usuario
            JOIN com_acao a ON a.id = pl.id_acao
            JOIN bas_unidade un ON un.id = pl.id_unidade
            ORDER BY pl.id DESC
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .getResultList())
                .map(rows -> toMapList(rows, List.of("id", "acao", "unidade", "usuario", "ativo", "link", "token")));
    }

    /**
     * Salva um novo link de prospecto.
     * Validations: usuario, acao, unidade required; same user cannot have different action.
     * Creates token (encrypted) and link.
     */
    public Uni<Map<String, Object>> salvarProspectoLink(Map<String, Object> r) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> {
                    Long usuarioId = toLong(r.get("id_usuario") ?? r.get("usuario"));
                    Long acaoId = toLong(r.get("id_acao") ?? r.get("acao"));
                    Long unidadeId = toLong(r.get("id_unidade") ?? r.get("unidade"));

                    if (usuarioId == null) {
                        return Uni.createFrom().failure(new IllegalArgumentException("Usuário é obrigatório"));
                    }
                    if (acaoId == null) {
                        return Uni.createFrom().failure(new IllegalArgumentException("Ação é obrigatória"));
                    }
                    if (unidadeId == null) {
                        return Uni.createFrom().failure(new IllegalArgumentException("Unidade é obrigatória"));
                    }

                    // Check: same user cannot have different action (verificaLinkProspecto)
                    String checkSql = """
                        SELECT id_acao FROM com_prospecto_link
                        WHERE id_usuario = :uid AND id_acao <> :aid
                        LIMIT 1
                    """;
                    return session.createNativeQuery(checkSql)
                            .setParameter("uid", usuarioId)
                            .setParameter("aid", acaoId)
                            .getSingleResultOrNull()
                            .flatMap(existing -> {
                                if (existing != null) {
                                    return Uni.createFrom().failure(new IllegalArgumentException("Não pode ter ações diferentes para mesmo usuário"));
                                }
                                // Generate token and link
                                String token = java.util.Base64.getEncoder().encodeToString(
                                        (usuarioId + ":" + System.currentTimeMillis()).getBytes()
                                );
                                String link = "?acao=" + acaoId + "&usuario=" + usuarioId + "&token=" + token;

                                String insertSql = """
                                    INSERT INTO com_prospecto_link (id_usuario, id_acao, id_unidade, token, link, fl_ativo)
                                    VALUES (:uid, :aid, :unid, :token, :link, true)
                                    RETURNING id, id_usuario, id_acao, id_unidade, token, link, fl_ativo
                                """;
                                return session.createNativeQuery(insertSql)
                                        .setParameter("uid", usuarioId)
                                        .setParameter("aid", acaoId)
                                        .setParameter("unid", unidadeId)
                                        .setParameter("token", token)
                                        .setParameter("link", link)
                                        .getSingleResult()
                                        .map(row -> toSingleMap(row, List.of("id", "id_usuario", "id_acao", "id_unidade", "token", "link", "fl_ativo")));
                            });
                });
    }

    /**
     * Toggle ativo/inativo status do link de prospecto.
     */
    public Uni<Map<String, Object>> alterarStatusProspectoLink(Long id) {
        String sql = """
            UPDATE com_prospecto_link
            SET fl_ativo = NOT fl_ativo
            WHERE id = :id
            RETURNING id, id_usuario, id_acao, id_unidade, token, link, fl_ativo
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter("id", id)
                        .getSingleResultOrNull()
                        .map(row -> row != null ? toSingleMap(row, List.of("id", "id_usuario", "id_acao", "id_unidade", "token", "link", "fl_ativo")) : Map.of()));
    }

    /**
     * Remove link de prospecto.
     */
    public Uni<Void> removerProspectoLink(Long id) {
        String sql = "DELETE FROM com_prospecto_link WHERE id = :id";
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter("id", id)
                        .executeUpdate())
                .replaceWithVoid();
    }

    /**
     * Inativa prospecto: set fl_ativo=false on com_prospecto and disponivel=false on cen_ordem_ligacao.
     */
    public Uni<Boolean> inativar(Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> {
                    String sql1 = "UPDATE com_prospecto SET fl_ativo = false WHERE id = :id";
                    String sql2 = "UPDATE cen_ordem_ligacao SET disponivel = false WHERE id_prospecto = :id";
                    return session.createNativeQuery(sql1)
                            .setParameter("id", id)
                            .executeUpdate()
                            .flatMap(v -> session.createNativeQuery(sql2)
                                    .setParameter("id", id)
                                    .executeUpdate()
                                    .replaceWith(true));
                });
    }

    /**
     * Remove prospecto e todas as referências (cascade delete).
     * Deletes: com_pacote_prospecto, com_prospecto_campo, cen_ligacao, bas_compromisso,
     * cen_ordem_ligacao, com_prospecto.
     */
    public Uni<Boolean> remover(Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> {
                    String[] deletes = {
                        "DELETE FROM com_pacote_prospecto WHERE id_prospecto = :id",
                        "DELETE FROM com_prospecto_campo WHERE id_prospecto = :id",
                        "DELETE FROM cen_ligacao WHERE id_ordem_ligacao IN (SELECT id FROM cen_ordem_ligacao WHERE id_prospecto = :id)",
                        "DELETE FROM bas_compromisso WHERE id IN (SELECT id_compromisso FROM cen_ligacao WHERE id_ordem_ligacao IN (SELECT id FROM cen_ordem_ligacao WHERE id_prospecto = :id))",
                        "DELETE FROM cen_ordem_ligacao WHERE id_prospecto = :id",
                        "DELETE FROM com_prospecto WHERE id = :id"
                    };
                    Uni<Integer> chain = Uni.createFrom().item(0);
                    for (String d : deletes) {
                        final String sql = d;
                        chain = chain.flatMap(v -> session.createNativeQuery(sql)
                                .setParameter("id", id)
                                .executeUpdate());
                    }
                    return chain.replaceWith(true);
                });
    }

    /**
     * Carrega prospecto para visualização (campos dinâmicos).
     * Returns list of {campo_id, rotulo, tipo, categoria, valor}
     */
    public Uni<List<Map<String, Object>>> carregarProspectoParaVisualizacao(Long id) {
        String sql = """
            SELECT c.id AS campo_id, c.rotulo, c.tipo, cat.descricao AS categoria, pc.valor
            FROM com_prospecto p
            INNER JOIN com_prospecto_campo pc ON pc.id_prospecto = p.id
            INNER JOIN com_campo c ON c.id = pc.id_campo
            LEFT JOIN com_categoria cat ON cat.id = c.id_categoria
            WHERE p.id = :id
            ORDER BY cat.id, c.rotulo
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter("id", id)
                        .getResultList())
                .map(rows -> toMapList(rows, List.of("campo_id", "rotulo", "tipo", "categoria", "valor")));
    }

    // ===== Helper methods =====

    private List<Map<String, Object>> toMapList(List<?> rows, List<String> cols) {
        List<Map<String, Object>> out = new ArrayList<>();
        if (rows == null) return out;
        for (Object row : rows) {
            Map<String, Object> m = new HashMap<>();
            if (row instanceof Tuple t) {
                for (int i = 0; i < cols.size(); i++) {
                    m.put(cols.get(i), t.get(i));
                }
            } else if (row instanceof Object[] arr) {
                for (int i = 0; i < cols.size() && i < arr.length; i++) {
                    m.put(cols.get(i), arr[i]);
                }
            }
            out.add(m);
        }
        return out;
    }

    private Map<String, Object> toSingleMap(Object row, List<String> cols) {
        Map<String, Object> m = new HashMap<>();
        if (row instanceof Tuple t) {
            for (int i = 0; i < cols.size(); i++) {
                m.put(cols.get(i), t.get(i));
            }
        } else if (row instanceof Object[] arr) {
            for (int i = 0; i < cols.size() && i < arr.length; i++) {
                m.put(cols.get(i), arr[i]);
            }
        }
        return m;
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        try { return Long.valueOf(v.toString()); } catch (Exception e) { return null; }
    }
}
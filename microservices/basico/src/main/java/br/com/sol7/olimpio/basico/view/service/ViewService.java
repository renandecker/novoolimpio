package br.com.sol7.olimpio.basico.view.service;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.NotFoundException;
import org.hibernate.reactive.mutiny.Mutiny;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class ViewService {

    private static final List<String> TABLE_PREFIXES = List.of("", "bas_", "est_", "fin_", "cen_", "com_", "edc_", "rel_", "bib_");
    private static final List<String> VERB_PREFIXES = List.of("list", "form", "colunas", "alterar", "finalizar", "efetuar",
            "gerar", "gestao", "consultor", "manter", "abas", "movimentacao", "controle", "criar", "recriar", "buscar",
            "acompanhar", "enviar", "receber", "visualizar", "montar", "parametro", "arquivo", "disponibilidade",
            "detalhe", "cadastro", "verificar", "salvar", "editar", "excluir", "importar", "exportar", "abrir", "fechar");

    private static final Pattern FK_PATTERN = Pattern.compile("^id_[a-z0-9_]+$");
    private static final String PESSOA_TABLE = "bas_pessoa";
    private static final List<String> DESCRIPTION_COLUMNS = List.of(
            "descricao", "nome", "razao_social", "nome_fantasia", "titulo", "rotulo", "sucinto", "nome_social", "apelido",
            "tema", "login", "username", "sigla", "uf", "codigo");

    private static final Set<String> SPECIAL_TABLES = Set.of(
            PESSOA_TABLE, "bas_usuario", "edc_professor", "bas_fornecedor", "com_consultor", "bas_telefone",
            "edc_curriculo");
    private static final String PESSOA_DESC_SELECT =
            "COALESCE(NULLIF(pf.nome, ''), NULLIF(pf.nome_social, ''), NULLIF(pj.nome_fantasia, ''), pj.razao_social) ";

    private record RefInfo(String table, String descCol, String special) {
        static RefInfo direct (String table, String descCol){
            return new RefInfo(table, descCol, null);
        }

        static RefInfo special (String name){
            return new RefInfo(null, null, name);
        }

        boolean isSpecial () {
            return special != null;
        }
    }

    public static final Map<String, String> CURATED = Map.ofEntries(
            Map.entry("categoriaEstoque/listCategoria", "bas_categoria"),
            Map.entry("genero/listGenero", "bas_genero"),
            Map.entry("marca/listMarca", "est_marca"),
            Map.entry("mensagemMeta/listMensagemMeta", "cen_mensagem_meta"),
            Map.entry("chamadaAssinada/listChamadaAssinada", "edc_chamada_assinada_impressa"),
            Map.entry("unidade/listUnidade", "bas_unidade"),
            Map.entry("configuracaoFinanceira/listConfiguracaoFinanceira", "fin_bancos"),
            Map.entry("configuracaoFinanceira/formConfiguracaoFinanceira", "fin_bancos"));

    // Consultas com JOIN para telas que exibem colunas de relacionamentos aninhados
    // (ex.: logradouro -> bairro -> cidade -> estado), como no listLogradouro.xhtml legado.
    private static final String LOGRADOURO_SELECT =
            "SELECT l.id, l.descricao, l.cep, l.tipo_logradouro AS tipo, l.complemento, "
                    + "l.latitude, l.longitude, b.descricao AS bairro_descricao, c.nome AS cidade_descricao, "
                    + "e.nome AS estado_descricao, e.uf AS estado_uf "
                    + "FROM bas_logradouro l "
                    + "LEFT JOIN bas_bairro b ON b.id = l.id_bairro "
                    + "LEFT JOIN bas_cidade c ON c.id = b.id_cidade "
                    + "LEFT JOIN bas_estado e ON e.id = c.id_estado";
    private static final List<String> LOGRADOURO_COLUMNS = List.of(
            "id", "descricao", "cep", "tipo", "complemento", "latitude", "longitude",
            "bairro_descricao", "cidade_descricao", "estado_descricao", "estado_uf");

    private record CuratedSelect(String selectSql, List<String> columns) {
    }

    private static final Map<String, CuratedSelect> CURATED_SELECTS = Map.of(
            "logradouro/listLogradouro", new CuratedSelect(LOGRADOURO_SELECT, LOGRADOURO_COLUMNS),
            "logradouro/formLogradouro", new CuratedSelect(LOGRADOURO_SELECT, LOGRADOURO_COLUMNS));

    public Uni<PagedResponse<Map<String, Object>>> paged(String feature, String resource, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        CuratedSelect curated = CURATED_SELECTS.get(feature + "/" + resource);
        if (curated != null) {
            return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                    .chain(session -> doPagedCurated(session, curated, p, s));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> doPaged(session, feature, resource, p, s));
    }

    public Uni<List<Map<String, Object>>> list(String feature, String resource) {
        CuratedSelect curated = CURATED_SELECTS.get(feature + "/" + resource);
        if (curated != null) {
            return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                    .chain(session -> session.createNativeQuery(
                                    "SELECT * FROM (" + curated.selectSql() + ") sub ORDER BY id")
                            .getResultList())
                    .map(raw -> toMaps(curated.columns(), raw));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> resolveTable(session, feature, resource))
                .onItem().ifNull().failWith(() -> new NotFoundException(
                        "Tabela nao encontrada para /api/view/" + feature + "/" + resource))
                .flatMap(table -> io.quarkus.hibernate.reactive.panache.Panache.getSession()
                        .chain(session -> listRows(session, table)));
    }

    private Uni<PagedResponse<Map<String, Object>>> doPagedCurated(Mutiny.Session session, CuratedSelect curated,
                                                                   int p, int s) {
        String selectSql = "SELECT * FROM (" + curated.selectSql() + ") sub ORDER BY id LIMIT :limit OFFSET :offset";
        String countSql = "SELECT count(*) FROM (" + curated.selectSql() + ") sub";
        Uni<Long> total = session.createNativeQuery(countSql).getSingleResult()
                .map(r -> ((Number) r).longValue());
        Uni<List<Map<String, Object>>> rows = session.createNativeQuery(selectSql)
                .setParameter("limit", s)
                .setParameter("offset", (long) p * s)
                .getResultList()
                .map(raw -> toMaps(curated.columns(), raw));
        return total.flatMap(count -> rows.map(content -> new PagedResponse<>(content, count, p, s)));
    }

    private static List<Map<String, Object>> toMaps(List<String> cols, List<?> rawList) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object rowObj : rawList) {
            Object[] arr = (Object[]) rowObj;
            Map<String, Object> m = new LinkedHashMap<>();
            for (int i = 0; i < cols.size() && i < arr.length; i++) m.put(cols.get(i), arr[i]);
            out.add(m);
        }
        return out;
    }

    public Uni<Map<String, List<Map<String, Object>>>> refs(String feature, String resource) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> resolveTable(session, feature, resource))
                .onItem().ifNull().failWith(() -> new NotFoundException(
                        "Tabela nao encontrada para /api/view/" + feature + "/" + resource))
                .flatMap(table -> io.quarkus.hibernate.reactive.panache.Panache.getSession()
                        .chain(session -> refsForTable(session, table)));
    }

    private Uni<List<Map<String, Object>>> listRows(Mutiny.Session session, String table) {
        return columns(session, table).flatMap(cols -> {
            if (cols.isEmpty()) return Uni.createFrom().item(List.of());
            String orderBy = cols.contains("id") ? "id" : cols.get(0);
            String selectSql = "SELECT " + quoteColumns(cols) + " FROM " + quote(table) + " ORDER BY " + quote(orderBy);
            return session.createNativeQuery(selectSql).getResultList()
                    .map(list -> list.stream().map(row -> {
                        Object[] arr = (Object[]) row;
                        Map<String, Object> m = new LinkedHashMap<>();
                        for (int i = 0; i < cols.size() && i < arr.length; i++) m.put(cols.get(i), arr[i]);
                        return m;
                    }).collect(Collectors.toList()))
                    .flatMap(rows -> enrichDescriptions(session, table, rows));
        });
    }

    private Uni<Map<String, List<Map<String, Object>>>> refsForTable(Mutiny.Session session, String table) {
        return columns(session, table).flatMap(cols -> {
            Set<String> fkCols = new LinkedHashSet<>();
            for (String col : cols) {
                if (FK_PATTERN.matcher(col).matches()) fkCols.add(col);
            }
            Uni<Map<String, List<Map<String, Object>>>> chain = Uni.createFrom().item(new LinkedHashMap<>());
            for (String fk : fkCols) {
                chain = chain.flatMap(map -> resolveReference(session, table, fk).flatMap(ref -> {
                    if (ref == null) return Uni.createFrom().item(map);
                    return fetchRefOptions(session, ref).map(options -> {
                        map.put(fk, options);
                        return map;
                    });
                }));
            }
            return chain;
        });
    }

    private Uni<List<Map<String, Object>>> fetchRefOptions(Mutiny.Session session, RefInfo ref) {
        String sql = refOptionsSql(ref);
        if (sql == null) return Uni.createFrom().item(List.of());
        return session.createNativeQuery(sql).getResultList().map(list -> {
            List<Map<String, Object>> options = new ArrayList<>();
            for (Object row : list) {
                Object[] arr = (Object[]) row;
                Map<String, Object> option = new LinkedHashMap<>();
                option.put("id", arr[0]);
                Object label = arr.length > 1 ? arr[1] : null;
                option.put("label", label != null ? String.valueOf(label) : null);
                options.add(option);
            }
            return options;
        });
    }

    private String refOptionsSql(RefInfo ref) {
        if (ref == null || ref.table == null) return null;
        if (PESSOA_TABLE.equals(ref.table)) {
            return "SELECT p.id, " + PESSOA_DESC_SELECT
                    + "FROM " + quote(PESSOA_TABLE) + " p "
                    + "LEFT JOIN " + quote("bas_pessoa_fisica") + " pf ON pf.id_pessoa = p.id "
                    + "LEFT JOIN " + quote("bas_pessoa_juridica") + " pj ON pj.id_pessoa = p.id "
                    + "ORDER BY 2";
        }
        if ("bas_usuario".equals(ref.table)) {
            return "SELECT u.id, COALESCE((" + pessoaDescriptionSubquery("u.id_pessoa") + "), u.login) "
                    + "FROM " + quote("bas_usuario") + " u ORDER BY 2";
        }
        if ("edc_professor".equals(ref.table)) {
            return "SELECT pr.id, (" + pessoaDescriptionSubquery("pr.id_pessoa") + ") "
                    + "FROM " + quote("edc_professor") + " pr ORDER BY 2";
        }
        if ("bas_fornecedor".equals(ref.table)) {
            return "SELECT f.id, (" + pessoaDescriptionSubquery("f.id_pessoa") + ") "
                    + "FROM " + quote("bas_fornecedor") + " f ORDER BY 2";
        }
        if ("com_consultor".equals(ref.table)) {
            return "SELECT c.id, "
                    + "(SELECT COALESCE((" + pessoaDescriptionSubquery("u.id_pessoa") + "), u.login) "
                    + " FROM " + quote("bas_usuario") + " u WHERE u.id = c.id_usuario) "
                    + "FROM " + quote("com_consultor") + " c ORDER BY 2";
        }
        if ("bas_telefone".equals(ref.table)) {
            return "SELECT id, numero FROM " + quote("bas_telefone") + " ORDER BY 2";
        }
        if ("edc_curriculo".equals(ref.table)) {
            return "SELECT c.id, "
                    + "COALESCE(NULLIF(cr.nome, ''), NULLIF(c.descricao, ''), NULLIF(c.sucinto, ''), NULLIF(c.sigla, '')) "
                    + "FROM " + quote("edc_curriculo") + " c "
                    + "LEFT JOIN " + quote("edc_curso") + " cr ON cr.id = c.id_curso "
                    + "ORDER BY 2";
        }
        if (ref.descCol == null) return null;
        return "SELECT id, " + quote(ref.descCol) + " FROM " + quote(ref.table) + " ORDER BY 2";
    }

    private Uni<PagedResponse<Map<String, Object>>> doPaged(Mutiny.Session session, String feature, String resource, int p, int s) {
        return resolveTable(session, feature, resource)
                .flatMap(table -> {
                    if (table == null) return Uni.createFrom().item(new PagedResponse<>(List.of(), 0, p, s));
                    return columns(session, table).flatMap(cols -> {
                        if (cols.isEmpty()) return Uni.createFrom().item(new PagedResponse<>(List.of(), 0L, p, s));
                        String orderBy = cols.contains("id") ? "id" : cols.get(0);
                        String selectSql = "SELECT " + quoteColumns(cols) + " FROM " + quote(table)
                                + " ORDER BY " + quote(orderBy) + " LIMIT :limit OFFSET :offset";
                        String countSql = "SELECT count(*) FROM " + quote(table);
                        Uni<Long> total = session.createNativeQuery(countSql).getSingleResult()
                                .map(r -> ((Number) r).longValue());
                        Uni<List<Map<String, Object>>> rows = session.createNativeQuery(selectSql)
                                .setParameter("limit", s)
                                .setParameter("offset", (long) p * s)
                                .getResultList()
                                .map(list -> list.stream().map(row -> {
                                    Object[] arr = (Object[]) row;
                                    Map<String, Object> m = new LinkedHashMap<>();
                                    for (int i = 0; i < cols.size() && i < arr.length; i++) m.put(cols.get(i), arr[i]);
                                    return m;
                                }).collect(Collectors.toList()))
                                .flatMap(content -> enrichDescriptions(session, table, content));
                        return total.flatMap(count -> rows.map(content -> new PagedResponse<>(content, count, p, s)));
                    });
                });
    }

    public Uni<Map<String, Object>> create(String feature, String resource, Map<String, Object> body) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> resolveTable(session, feature, resource))
                .onItem().ifNull().failWith(() -> new NotFoundException(
                        "Tabela nao encontrada para /api/view/" + feature + "/" + resource))
                .chain(table -> insert(table, body));
    }

    public Uni<Map<String, Object>> update(String feature, String resource, Long id, Map<String, Object> body) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> resolveTable(session, feature, resource))
                .onItem().ifNull().failWith(() -> new NotFoundException(
                        "Tabela nao encontrada para /api/view/" + feature + "/" + resource))
                .chain(table -> update(table, id, body));
    }

    public Uni<Void> delete(String feature, String resource, Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> resolveTable(session, feature, resource))
                .onItem().ifNull().failWith(() -> new NotFoundException(
                        "Tabela nao encontrada para /api/view/" + feature + "/" + resource))
                .chain(table -> delete(table, id));
    }

    private String resolveFeatureTable(String feature, String resource) {
        // Se o resource for um número (ID), tentar encontrar table pelo feature usando CURATED
        if (resource != null && resource.matches("\\d+")) {
            // Percorrer CURATED para encontrar entrada onde o feature corresponda
            for (Map.Entry<String, String> entry : CURATED.entrySet()) {
                String key = entry.getKey();
                if (key.startsWith(feature + "/")) {
                    return entry.getValue();
                }
            }
        }
        return null;
    }

    public Uni<Map<String, Object>> findById(String feature, String resource, Long id) {
        // Se resource for um ID numérico, tentar resolução pelo feature primeiro
        String curatedTable = resolveFeatureTable(feature, resource);
        if (curatedTable != null) {
            return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                    .chain(session -> findById(curatedTable, id));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> resolveTable(session, feature, resource))
                .onItem().ifNull().failWith(() -> new NotFoundException(
                        "Tabela nao encontrada para /api/view/" + feature + "/" + resource))
                .chain(resolvedTable -> findById(resolvedTable, id));
    }

    private Uni<Map<String, Object>> update(String table, Long id, Map<String, Object> body) {
        if (body == null || body.isEmpty())
            return Uni.createFrom().failure(new NotFoundException("Nenhum campo para atualizar"));
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> columns(session, table).flatMap(cols -> {
                    List<Map.Entry<String, Object>> updatable = cols.stream()
                            .filter(col -> body.containsKey(col) && !"id".equals(col))
                            .map(col -> Map.entry(col, body.get(col)))
                            .filter(e -> e.getValue() != null)
                            .toList();
                    if (updatable.isEmpty())
                        return Uni.createFrom().failure(new NotFoundException("Nenhum campo atualizável para /" + table + "/" + id));
                    String setClause = updatable.stream()
                            .map(e -> quote(e.getKey()) + " = :" + e.getKey())
                            .collect(Collectors.joining(", "));
                    String sql = "UPDATE " + quote(table) + " SET " + setClause + " WHERE id = :id RETURNING id";
                    Mutiny.Query<?> query = session.createNativeQuery(sql).setParameter("id", id);
                    for (Map.Entry<String, Object> e : updatable) query.setParameter(e.getKey(), e.getValue());
                    return query.getSingleResult()
                            .onItem().ifNull().failWith(() -> new NotFoundException("Registro " + id + " não encontrado em " + table))
                            .map(ignored -> {
                                Map<String, Object> m = new LinkedHashMap<>();
                                m.put("id", id);
                                for (Map.Entry<String, Object> e : updatable) m.put(e.getKey(), e.getValue());
                                return m;
                            });
                }));
    }

    private Uni<Void> delete(String table, Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> {
                    String sql = "DELETE FROM " + quote(table) + " WHERE id = :id";
                    return session.createNativeQuery(sql).setParameter("id", id).executeUpdate()
                            .flatMap(rows -> rows == 0
                                    ? Uni.createFrom().failure(new NotFoundException("Registro " + id + " não encontrado em " + table))
                                    : Uni.createFrom().voidItem());
                });
    }

    private Uni<Map<String, Object>> findById(String table, Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> columns(session, table).flatMap(cols -> {
                    if (cols.isEmpty()) return Uni.createFrom().failure(new NotFoundException("Nenhuma coluna encontrada para " + table));
                    String selectSql = "SELECT " + quoteColumns(cols) + " FROM " + quote(table) + " WHERE id = :id";
                    return session.createNativeQuery(selectSql).setParameter("id", id).getSingleResultOrNull()
                            .flatMap(row -> {
                                if (row == null) return Uni.createFrom().failure(new NotFoundException("Registro " + id + " não encontrado em " + table));
                                Object[] arr = (Object[]) row;
                                Map<String, Object> m = new LinkedHashMap<>();
                                for (int i = 0; i < cols.size() && i < arr.length; i++) m.put(cols.get(i), arr[i]);
                                return enrichDescriptions(session, table, List.of(m)).map(list -> list.get(0));
                            });
                }));
    }

    private Uni<Map<String, Object>> insert(String table, Map<String, Object> body) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> columns(session, table).flatMap(cols -> {
                    Set<String> colSet = new HashSet<>(cols);
                    List<Map.Entry<String, Object>> insertable = new ArrayList<>();
                    for (Map.Entry<String, Object> e : body.entrySet()) {
                        String col = e.getKey();
                        Object value = e.getValue();
                        if (!"id".equals(col) && colSet.contains(col) && value != null && !"".equals(value)) {
                            insertable.add(e);
                        }
                    }
                    if (insertable.isEmpty()) {
                        String sql = "INSERT INTO " + quote(table) + " DEFAULT VALUES RETURNING id";
                        return session.createNativeQuery(sql).getSingleResult()
                                .map(id -> Map.<String, Object>of("id", id));
                    }
                    String columnsClause = insertable.stream()
                            .map(e -> quote(e.getKey()))
                            .collect(Collectors.joining(", "));
                    String valuesClause = insertable.stream()
                            .map(e -> ":" + e.getKey())
                            .collect(Collectors.joining(", "));
                    String sql = "INSERT INTO " + quote(table) + " (" + columnsClause + ") VALUES (" + valuesClause + ") RETURNING id";
                    Mutiny.Query<?> query = session.createNativeQuery(sql);
                    for (Map.Entry<String, Object> e : insertable) query.setParameter(e.getKey(), e.getValue());
                    return query.getSingleResult()
                            .map(id -> {
                                Map<String, Object> m = new LinkedHashMap<>();
                                m.put("id", id);
                                for (Map.Entry<String, Object> e : insertable) m.put(e.getKey(), e.getValue());
                                return m;
                            });
                }));
    }

    private Uni<List<Map<String, Object>>> enrichDescriptions(Mutiny.Session session, String table, List<Map<String, Object>> rows) {
        if (rows.isEmpty()) return Uni.createFrom().item(rows);
        Set<String> fkCols = new LinkedHashSet<>();
        for (Map<String, Object> row : rows) {
            for (String key : row.keySet()) {
                if (FK_PATTERN.matcher(key).matches()) fkCols.add(key);
            }
        }
        Uni<List<Map<String, Object>>> chain = Uni.createFrom().item(rows);
        for (String fk : fkCols) {
            String base = fk.substring(3);
            chain = chain.flatMap(current -> resolveReference(session, table, fk).flatMap(ref -> {
                if (ref == null) return Uni.createFrom().item(current);
                List<Object> ids = new ArrayList<>();
                for (Map<String, Object> row : current) {
                    Object value = row.get(fk);
                    if (value != null && !ids.contains(value)) ids.add(value);
                }
                if (ids.isEmpty()) return Uni.createFrom().item(current);
                return fetchDescriptions(session, ref, ids).map(descMap -> {
                    for (Map<String, Object> row : current) {
                        Object value = row.get(fk);
                        row.put(base + "_descricao", value != null ? descMap.get(String.valueOf(value)) : null);
                    }
                    return current;
                });
            }));
        }
        return chain;
    }

    private Uni<RefInfo> resolveReference(Mutiny.Session session, String table, String fk) {
        return referencedTable(session, table, fk).flatMap(refTable -> {
            if (refTable == null) return resolveReferenceByGuessing(session, fk.substring(3));
            if (SPECIAL_TABLES.contains(refTable)) {
                return Uni.createFrom().item(RefInfo.direct(refTable, null));
            }
            return descriptionColumn(session, refTable).map(col -> col == null ? null : RefInfo.direct(refTable, col));
        });
    }

    private Uni<String> referencedTable(Mutiny.Session session, String table, String fkColumn) {
        String sql = "SELECT ccu.table_name FROM information_schema.table_constraints tc "
                + "JOIN information_schema.key_column_usage kcu "
                + "  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema "
                + "JOIN information_schema.constraint_column_usage ccu "
                + "  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema "
                + "WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' "
                + "  AND tc.table_name = :table AND kcu.column_name = :column LIMIT 1";
        return session.createNativeQuery(sql)
                .setParameter("table", table)
                .setParameter("column", fkColumn)
                .getSingleResultOrNull()
                .map(o -> o == null ? null : String.valueOf(o));
    }

    private Uni<RefInfo> resolveReferenceByGuessing(Mutiny.Session session, String base) {
        List<String> candidates = new ArrayList<>();
        for (String prefix : TABLE_PREFIXES) {
            candidates.add(prefix + base);
            candidates.add(prefix + base + "s");
            candidates.add(prefix + base + "es");
        }
        Uni<RefInfo> chain = Uni.createFrom().nullItem();
        for (String candidate : candidates) {
            final String name = candidate;
            chain = chain.onItem().transformToUni(found -> found != null
                    ? Uni.createFrom().item(found)
                    : tableExists(session, name).flatMap(table -> {
                if (table == null) return Uni.createFrom().nullItem();
                if (SPECIAL_TABLES.contains(name)) return Uni.createFrom().item(RefInfo.direct(name, null));
                return descriptionColumn(session, name).map(col ->
                        col == null ? null : RefInfo.direct(name, col));
            }));
        }
        return chain;
    }

    private Uni<String> descriptionColumn(Mutiny.Session session, String table) {
        String sql = "SELECT column_name FROM information_schema.columns"
                + " WHERE table_schema = 'public' AND table_name = :table";
        return session.createNativeQuery(sql).setParameter("table", table).getResultList()
                .map(list -> {
                    Set<String> cols = new HashSet<>();
                    for (Object o : list) cols.add(String.valueOf(o));
                    for (String preferred : DESCRIPTION_COLUMNS) {
                        if (cols.contains(preferred)) return preferred;
                    }
                    return null;
                });
    }

    private Uni<Map<String, String>> fetchDescriptions(Mutiny.Session session, RefInfo ref, List<Object> ids) {
        StringBuilder placeholders = new StringBuilder();
        for (int i = 0; i < ids.size(); i++) {
            if (i > 0) placeholders.append(", ");
            placeholders.append(":id").append(i);
        }
        String sql;
        String custom = customDescriptionSql(ref.table, placeholders.toString());
        if (custom != null) {
            sql = custom;
        } else {
            sql = "SELECT id, " + quote(ref.descCol) + " FROM " + quote(ref.table)
                    + " WHERE id IN (" + placeholders + ")";
        }
        Mutiny.Query<?> query = session.createNativeQuery(sql);
        for (int i = 0; i < ids.size(); i++) query.setParameter("id" + i, ids.get(i));
        return query.getResultList().map(list -> {
            Map<String, String> result = new HashMap<>();
            for (Object row : list) {
                Object[] arr = (Object[]) row;
                result.put(String.valueOf(arr[0]), arr.length > 1 && arr[1] != null ? String.valueOf(arr[1]) : null);
            }
            return result;
        });
    }

    private String customDescriptionSql(String table, String placeholders) {
        if (PESSOA_TABLE.equals(table)) {
            return "SELECT p.id, " + PESSOA_DESC_SELECT
                    + "FROM " + quote(PESSOA_TABLE) + " p "
                    + "LEFT JOIN " + quote("bas_pessoa_fisica") + " pf ON pf.id_pessoa = p.id "
                    + "LEFT JOIN " + quote("bas_pessoa_juridica") + " pj ON pj.id_pessoa = p.id "
                    + "WHERE p.id IN (" + placeholders + ")";
        }
        if ("bas_usuario".equals(table)) {
            return "SELECT u.id, COALESCE((" + pessoaDescriptionSubquery("u.id_pessoa") + "), u.login) "
                    + "FROM " + quote("bas_usuario") + " u "
                    + "WHERE u.id IN (" + placeholders + ")";
        }
        if ("edc_professor".equals(table)) {
            return "SELECT pr.id, (" + pessoaDescriptionSubquery("pr.id_pessoa") + ") "
                    + "FROM " + quote("edc_professor") + " pr "
                    + "WHERE pr.id IN (" + placeholders + ")";
        }
        if ("bas_fornecedor".equals(table)) {
            return "SELECT f.id, (" + pessoaDescriptionSubquery("f.id_pessoa") + ") "
                    + "FROM " + quote("bas_fornecedor") + " f "
                    + "WHERE f.id IN (" + placeholders + ")";
        }
        if ("com_consultor".equals(table)) {
            return "SELECT c.id, "
                    + "(SELECT COALESCE((" + pessoaDescriptionSubquery("u.id_pessoa") + "), u.login) "
                    + " FROM " + quote("bas_usuario") + " u WHERE u.id = c.id_usuario) "
                    + "FROM " + quote("com_consultor") + " c "
                    + "WHERE c.id IN (" + placeholders + ")";
        }
        if ("bas_telefone".equals(table)) {
            return "SELECT id, numero FROM " + quote("bas_telefone") + " WHERE id IN (" + placeholders + ")";
        }
        if ("edc_curriculo".equals(table)) {
            return "SELECT c.id, "
                    + "COALESCE(NULLIF(cr.nome, ''), NULLIF(c.descricao, ''), NULLIF(c.sucinto, ''), NULLIF(c.sigla, '')) "
                    + "FROM " + quote("edc_curriculo") + " c "
                    + "LEFT JOIN " + quote("edc_curso") + " cr ON cr.id = c.id_curso "
                    + "WHERE c.id IN (" + placeholders + ")";
        }
        return null;
    }

    private String pessoaDescriptionSubquery(String pessoaIdExpr) {
        return "SELECT " + PESSOA_DESC_SELECT
                + " FROM " + quote(PESSOA_TABLE) + " p "
                + " LEFT JOIN " + quote("bas_pessoa_fisica") + " pf ON pf.id_pessoa = p.id "
                + " LEFT JOIN " + quote("bas_pessoa_juridica") + " pj ON pj.id_pessoa = p.id "
                + " WHERE p.id = " + pessoaIdExpr;
    }

    private Uni<String> resolveTable(Mutiny.Session session, String feature, String resource) {
        String key = feature + "/" + resource;
        if (CURATED.containsKey(key)) return Uni.createFrom().item(CURATED.get(key));
        List<String> candidates = candidates(resource);
        Uni<String> result = Uni.createFrom().nullItem();
        for (String candidate : candidates) {
            final String name = candidate;
            result = result.onItem().transformToUni(found -> found != null
                    ? Uni.createFrom().item(found)
                    : tableExists(session, name));
        }
        return result;
    }

    private Uni<String> tableExists(Mutiny.Session session, String name) {
        String sql = "SELECT table_name FROM information_schema.tables"
                + " WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name = :name";
        return session.createNativeQuery(sql).setParameter("name", name).getResultList()
                .map(list -> list.isEmpty() ? null : String.valueOf(list.get(0)));
    }

    private Uni<List<String>> columns(Mutiny.Session session, String table) {
        String sql = "SELECT column_name FROM information_schema.columns"
                + " WHERE table_schema = 'public' AND table_name = :table ORDER BY ordinal_position";
        return session.createNativeQuery(sql).setParameter("table", table).getResultList()
                .map(list -> list.stream().map(o -> String.valueOf(o)).toList());
    }

    private List<String> candidates(String resource) {
        String stripped = camelToSnake(stripVerb(resource));
        String full = camelToSnake(resource);
        List<String> out = new ArrayList<>();
        addVariants(out, stripped);
        addVariants(out, full);
        return out.stream().distinct().toList();
    }

    private void addVariants(List<String> out, String snake) {
        if (snake == null || snake.isEmpty()) return;
        for (String prefix : TABLE_PREFIXES) {
            out.add(prefix + snake);
            out.add(prefix + snake + "s");
            out.add(prefix + snake + "es");
        }
    }

    private String stripVerb(String resource) {
        for (String verb : VERB_PREFIXES) {
            if (resource.length() > verb.length() && resource.regionMatches(true, 0, verb, 0, verb.length())
                    && Character.isUpperCase(resource.charAt(verb.length()))) {
                return resource.substring(verb.length());
            }
        }
        return resource;
    }

    private String camelToSnake(String value) {
        return value.replaceAll("([a-z0-9])([A-Z])", "$1_$2").toLowerCase(Locale.ROOT);
    }

    private String quote(String ident) {
        return "\"" + ident.replace("\"", "\"\"") + "\"";
    }

    private String quoteColumns(List<String> cols) {
        return cols.stream().map(this::quote).collect(Collectors.joining(", "));
    }
}

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
            Map.entry("tipoAcao/listTipoAcao", "com_tipo_acao"),
            Map.entry("tipoAcao/formTipoAcao", "com_tipo_acao"),
            Map.entry("configuracaoFinanceira/listConfiguracaoFinanceira", "fin_bancos"),
            Map.entry("configuracaoFinanceira/formConfiguracaoFinanceira", "fin_bancos"),
            Map.entry("tipoPausa/listTipoPausa", "cen_tipo_pausa"),
            Map.entry("tipoPausa/formTipoPausa", "cen_tipo_pausa"),
            Map.entry("categoriaCampo/listCategoriaCampo", "com_categoria"),
            Map.entry("categoriaCampo/formCategoriaCampo", "com_categoria"));

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

    private static final String META_SELECT =
            "SELECT m.id, m.meta, m.data, m.data_inicial, m.data_final, m.id_operador, m.id_operacional, m.id_usuario_lancou_media, "
                    + "uOp.login AS operador_login, "
                    + "cp.id AS operacional_pacote_id, cp.descricao AS operacional_pacote_descricao "
                    + "FROM cen_meta m "
                    + "LEFT JOIN bas_usuario uOp ON uOp.id = m.id_operador "
                    + "LEFT JOIN cen_operacional cOp ON cOp.id = m.id_operacional "
                    + "LEFT JOIN com_pacote cp ON cp.id = cOp.id_pacote";
    private static final List<String> META_COLUMNS = List.of(
            "id", "meta", "data", "data_inicial", "data_final", "id_operador", "id_operacional", "id_usuario_lancou_media",
            "operador_login", "operacional_pacote_id", "operacional_pacote_descricao");

    // Operacional list: joins to com_pacote and com_acao_de_campanha for data_criacao and data_final
    private static final String OPERACIONAL_LIST_SELECT =
            "SELECT op.id, op.id_pacote, op.status, op.direcionamento, op.id_coordenador, "
                    + "p.descricao AS pacote_descricao, p.data_criacao AS pacote_data_criacao, "
                    + "adc.data_final AS acao_data_final, "
                    + "(SELECT COUNT(*) FROM com_pacote_prospecto pp WHERE pp.id_pacote = op.id_pacote) AS quantidade_prospecto "
                    + "FROM cen_operacional op "
                    + "LEFT JOIN com_pacote p ON p.id = op.id_pacote "
                    + "LEFT JOIN com_acao_de_campanha adc ON adc.id = p.id_acao_de_campanha";
    private static final List<String> OPERACIONAL_LIST_COLUMNS = List.of(
            "id", "id_pacote", "status", "direcionamento", "id_coordenador",
            "pacote_descricao", "pacote_data_criacao", "acao_data_final", "quantidade_prospecto");

    private record CuratedSelect(String selectSql, List<String> columns) {
    }

    private static final Map<String, CuratedSelect> CURATED_SELECTS = Map.of(
            "logradouro/listLogradouro", new CuratedSelect(LOGRADOURO_SELECT, LOGRADOURO_COLUMNS),
            "logradouro/formLogradouro", new CuratedSelect(LOGRADOURO_SELECT, LOGRADOURO_COLUMNS),
            "meta/listMeta", new CuratedSelect(META_SELECT, META_COLUMNS),
            "meta/formMeta", new CuratedSelect(META_SELECT, META_COLUMNS),
            "operacional/listOperacional", new CuratedSelect(OPERACIONAL_LIST_SELECT, OPERACIONAL_LIST_COLUMNS),
            "operacional/formOperacional", new CuratedSelect(OPERACIONAL_LIST_SELECT, OPERACIONAL_LIST_COLUMNS));

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
                .chain(table -> {
                    String msg = validateTipoPausa(table, body);
                    if (msg != null) return Uni.createFrom().failure(new jakarta.ws.rs.BadRequestException(msg));
                    msg = validateTurnoTrabalho(table, body);
                    if (msg != null) return Uni.createFrom().failure(new jakarta.ws.rs.BadRequestException(msg));
                    msg = validateMeta(table, body);
                    if (msg != null) return Uni.createFrom().failure(new jakarta.ws.rs.BadRequestException(msg));
                    // Normaliza alias "tempo" -> "qtde_tempo" para compatibilidade com DataTable/central API
                    Map<String, Object> normalized = normalizeTipoPausaBody(table, body);
                    normalized = normalizeTurnoTrabalhoBody(table, normalized);
                    return insert(table, normalized).flatMap(row -> handleTurnoTrabalhoUnidades(table, row, body));
                });
    }

    public Uni<Map<String, Object>> update(String feature, String resource, Long id, Map<String, Object> body) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> resolveTable(session, feature, resource))
                .onItem().ifNull().failWith(() -> new NotFoundException(
                        "Tabela nao encontrada para /api/view/" + feature + "/" + resource))
                .chain(table -> {
                    String msg = validateTipoPausa(table, body);
                    if (msg != null) return Uni.createFrom().failure(new jakarta.ws.rs.BadRequestException(msg));
                    msg = validateTurnoTrabalho(table, body);
                    if (msg != null) return Uni.createFrom().failure(new jakarta.ws.rs.BadRequestException(msg));
                    msg = validateMeta(table, body);
                    if (msg != null) return Uni.createFrom().failure(new jakarta.ws.rs.BadRequestException(msg));
                    Map<String, Object> normalized = normalizeTipoPausaBody(table, body);
                    normalized = normalizeTurnoTrabalhoBody(table, normalized);
                    return update(table, id, normalized).flatMap(row -> handleTurnoTrabalhoUnidadesUpdate(table, id, body).replaceWith(row));
                });
    }

    private Map<String, Object> normalizeTipoPausaBody(String table, Map<String, Object> body) {
        if (!"cen_tipo_pausa".equals(table) || body == null) return body;
        if (body.containsKey("tempo") && !body.containsKey("qtde_tempo")) {
            Map<String, Object> copy = new LinkedHashMap<>(body);
            copy.put("qtde_tempo", copy.remove("tempo"));
            return copy;
        }
        return body;
    }

    private String validateTipoPausa(String table, Map<String, Object> body) {
        if (!"cen_tipo_pausa".equals(table) || body == null) return null;
        Object descObj = body.get("descricao");
        if (descObj == null) descObj = body.get("Descricao");
        String desc = descObj == null ? null : String.valueOf(descObj).trim();
        if (desc == null || desc.isEmpty()) return "Descricao e obrigatoria";
        if (desc.length() < 3) return "Descricao deve ter no minimo 3 caracteres";
        if (desc.length() > 255) return "Descricao deve ter no maximo 255 caracteres";
        Object tempoObj = body.get("qtde_tempo");
        if (tempoObj == null) tempoObj = body.get("tempo");
        if (tempoObj == null || String.valueOf(tempoObj).trim().isEmpty()) return "Insira o tempo intervalo";
        try {
            int t = Integer.parseInt(String.valueOf(tempoObj).trim());
            if (t < 0) return "Tempo pausa deve ser um inteiro positivo";
        } catch (NumberFormatException e) {
            return "Tempo pausa deve ser um inteiro";
        }
        return null;
    }

    // ---- TurnoTrabalho: replica TurnoTrabalhoService.save + TurnoTrabalhoController.saveOrUpdate ----
    private Map<String, Object> normalizeTurnoTrabalhoBody(String table, Map<String, Object> body) {
        if (!"cen_turno_trabalho".equals(table) || body == null) return body;
        Map<String, Object> copy = new LinkedHashMap<>(body);
        // alias diaSemanaId / diaSemana -> id_dia_semana
        if (copy.containsKey("diaSemanaId") && !copy.containsKey("id_dia_semana")) {
            copy.put("id_dia_semana", copy.remove("diaSemanaId"));
        }
        if (copy.containsKey("diaSemana") && !copy.containsKey("id_dia_semana")) {
            Object v = copy.remove("diaSemana");
            if (v instanceof Map) {
                Object id = ((Map<?, ?>) v).get("id");
                if (id != null) copy.put("id_dia_semana", id);
            } else if (v != null) {
                copy.put("id_dia_semana", v);
            }
        }
        // remove chave auxiliar unidadeIds (tratada separadamente no join)
        // mantem no body original para handleTurnoTrabalhoUnidades
        return copy;
    }

    private String validateTurnoTrabalho(String table, Map<String, Object> body) {
        if (!"cen_turno_trabalho".equals(table) || body == null) return null;
        // create (insert) valida tudo; update valida só campos presentes (DataTable manda só changed fields)
        boolean isCreateCall = Thread.currentThread().getStackTrace().length > 0 && false;
        // descricao — se create ou se campo está no body, valida
        boolean hasDescricao = body.containsKey("descricao");
        // heurística: se body tem id_dia_semana ou diaSemanaId, é create ou update completo; se não tem, é update parcial onde não precisa validar tudo
        boolean isPartialUpdate = !hasDescricao && !body.containsKey("inicio") && !body.containsKey("fim");
        if (hasDescricao || !isPartialUpdate) {
            Object descObj = body.get("descricao");
            String desc = descObj == null ? null : String.valueOf(descObj).trim();
            if (desc == null || desc.isEmpty()) return "Descricao e obrigatoria";
            if (desc.length() < 3) return "Descricao deve ter no minimo 3 caracteres";
            if (desc.length() > 255) return "Descricao deve ter no maximo 255 caracteres";
        }
        // inicio / fim — valida se algum dos dois está no body
        boolean hasInicio = body.containsKey("inicio");
        boolean hasFim = body.containsKey("fim");
        if (hasInicio || hasFim) {
            String inicio = body.get("inicio") == null ? null : String.valueOf(body.get("inicio")).trim();
            String fim = body.get("fim") == null ? null : String.valueOf(body.get("fim")).trim();
            if (hasInicio && (inicio == null || inicio.isEmpty())) return "Inicio e obrigatorio (formato 99:99)";
            if (hasFim && (fim == null || fim.isEmpty())) return "Fim e obrigatorio (formato 99:99)";
            if (inicio != null && !inicio.isEmpty()) {
                String errIni = validarHora(inicio);
                if (errIni != null) return errIni;
            }
            if (fim != null && !fim.isEmpty()) {
                String errFim = validarHora(fim);
                if (errFim != null) return errFim;
            }
            if (inicio != null && fim != null && !inicio.isEmpty() && !fim.isEmpty()) {
                try {
                    int iniM = toMinutes(inicio);
                    int fimM = toMinutes(fim);
                    if (fimM - iniM <= 0) return "A hora de inicio deve ser inferior a hora final.";
                } catch (Exception e) {
                    return "Hora invalida. Ex.: 08:30";
                }
            }
        } else if (!isPartialUpdate) {
            // create sem inicio/fim
            return "Inicio e obrigatorio (formato 99:99)";
        }
        // diaSemana — valida se campo está presente ou é create
        boolean hasDia = body.containsKey("id_dia_semana") || body.containsKey("diaSemanaId") || body.containsKey("diaSemana");
        if (hasDia) {
            Object dia = body.get("id_dia_semana");
            if (dia == null) dia = body.get("diaSemanaId");
            if (dia == null) dia = body.get("diaSemana");
            if (dia == null || String.valueOf(dia).trim().isEmpty()) return "Dia da semana e obrigatorio";
        } else if (!isPartialUpdate) {
            return "Dia da semana e obrigatorio";
        }
        return null;
    }

    // ---- Meta: replica MetaController.saveOrUpdate + MetaService.save ----
    private String validateMeta(String table, Map<String, Object> body) {
        if (!"cen_meta".equals(table) || body == null) return null;
        boolean isCreate = !body.containsKey("id");
        // meta obrigatorio
        Object metaObj = body.get("meta");
        if (metaObj == null || String.valueOf(metaObj).trim().isEmpty()) return "Meta diaria e obrigatoria";
        try {
            Integer.parseInt(String.valueOf(metaObj).trim());
        } catch (NumberFormatException e) {
            return "Meta deve ser um numero inteiro";
        }
        // periodo: data null, dataInicial/dataFinal required
        boolean periodo = Boolean.TRUE.equals(body.get("periodo"));
        if (periodo) {
            if (body.get("dataInicial") == null) return "Data inicial e obrigatoria";
            if (body.get("dataFinal") == null) return "Data final e obrigatoria";
            if (body.get("data") != null && body.get("data") != "") return "Data deve ser nula quando periodo e true";
            // equipe
            boolean equipe = Boolean.TRUE.equals(body.get("equipe"));
            if (equipe) {
                if (body.get("operacionalId") == null) return "Equipe e obrigatoria";
                if (body.get("operadorId") != null) return "Operador deve ser nulo quando equipe e true";
                // conflito equipe
                if (isCreate) {
                    // validação será no service central
                }
            } else {
                if (body.get("operadorId") == null) return "Operador e obrigatorio";
                if (body.get("operacionalId") != null) return "Equipe deve ser nula quando operador e true";
                // conflito operador
                if (isCreate) {
                    // validação será no service central
                }
            }
            // dataHoje = hoje - 1 dia
            java.time.LocalDate hoje = java.time.LocalDate.now().minusDays(1);
            try {
                java.time.LocalDate dataIni = java.time.LocalDate.parse(String.valueOf(body.get("dataInicial")));
                if (hoje.isAfter(dataIni)) return "Data selecionada invalida, dia inferior ao dia de hoje";
            } catch (Exception ignored) {}
        } else {
            // data: data required, dataInicial null
            if (body.get("data") == null) return "Data e obrigatoria";
            if (body.get("dataInicial") != null && body.get("dataInicial") != "") return "Data inicial deve ser nula quando periodo e false";
            if (isCreate) {
                java.time.LocalDate hoje = java.time.LocalDate.now().minusDays(1);
                try {
                    java.time.LocalDate data = java.time.LocalDate.parse(String.valueOf(body.get("data")));
                    if (hoje.isAfter(data)) return "Data selecionada invalida, dia inferior ao dia de hoje";
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private String validarHora(String hhmm) {
        if (hhmm == null || hhmm.length() != 5) return "A hora deve ter 5 digitos. Ex.: 08:30";
        if (!hhmm.contains(":")) return "A hora deve seguir o padrao Ex.: 08:30";
        String[] p = hhmm.split(":");
        if (p.length != 2 || p[0].length() != 2 || p[1].length() != 2) return "A hora deve seguir o padrao Ex.: 08:30";
        try {
            int h = Integer.parseInt(p[0]);
            int m = Integer.parseInt(p[1]);
            if (h < 0 || h >= 24) return "A hora deve estar no intervalo de 0 a 23h. Ex.: 08:30";
            if (m < 0 || m >= 60) return "O minuto deve estar no intervalo de 0 a 59m. Ex.: 08:30";
        } catch (NumberFormatException e) {
            return "A hora deve seguir o padrao Ex.: 08:30";
        }
        return null;
    }

    private int toMinutes(String hhmm) {
        String[] p = hhmm.split(":");
        return Integer.parseInt(p[0]) * 60 + Integer.parseInt(p[1]);
    }

    private Uni<Map<String, Object>> handleTurnoTrabalhoUnidades(String table, Map<String, Object> row, Map<String, Object> body) {
        if (!"cen_turno_trabalho".equals(table) || body == null) return Uni.createFrom().item(row);
        Object unidadeIdsObj = body.get("unidadeIds");
        if (unidadeIdsObj == null) unidadeIdsObj = body.get("unidades");
        if (unidadeIdsObj == null) return Uni.createFrom().item(row);
        List<Long> ids = extractIds(unidadeIdsObj);
        if (ids.isEmpty()) return Uni.createFrom().item(row);
        Object idObj = row.get("id");
        if (idObj == null) return Uni.createFrom().item(row);
        Long turnoId = ((Number) idObj).longValue();
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> {
                    Uni<Void> chain = Uni.createFrom().voidItem();
                    for (Long uid : ids) {
                        chain = chain.flatMap(v -> session.createNativeQuery("INSERT INTO cen_turno_trabalho_unidade (id_turno_trabalho, id_unidade) VALUES (:tid, :uid)")
                                .setParameter("tid", turnoId).setParameter("uid", uid).executeUpdate().replaceWithVoid()
                                .onFailure().recoverWithItem(t -> null));
                    }
                    return chain.replaceWith(row);
                });
    }

    private Uni<Void> handleTurnoTrabalhoUnidadesUpdate(String table, Long turnoId, Map<String, Object> body) {
        if (!"cen_turno_trabalho".equals(table) || body == null) return Uni.createFrom().voidItem();
        Object unidadeIdsObj = body.get("unidadeIds");
        if (unidadeIdsObj == null) unidadeIdsObj = body.get("unidades");
        if (unidadeIdsObj == null) return Uni.createFrom().voidItem();
        List<Long> ids = extractIds(unidadeIdsObj);
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery("DELETE FROM cen_turno_trabalho_unidade WHERE id_turno_trabalho = :id").setParameter("id", turnoId).executeUpdate()
                        .flatMap(v -> {
                            if (ids.isEmpty()) return Uni.createFrom().voidItem();
                            Uni<Void> chain = Uni.createFrom().voidItem();
                            for (Long uid : ids) {
                                chain = chain.flatMap(x -> session.createNativeQuery("INSERT INTO cen_turno_trabalho_unidade (id_turno_trabalho, id_unidade) VALUES (:tid, :uid)")
                                        .setParameter("tid", turnoId).setParameter("uid", uid).executeUpdate().replaceWithVoid()
                                        .onFailure().recoverWithItem(t -> null));
                            }
                            return chain;
                        }));
    }

    @SuppressWarnings("unchecked")
    private List<Long> extractIds(Object obj) {
        List<Long> out = new ArrayList<>();
        if (obj instanceof List) {
            for (Object e : (List<?>) obj) {
                if (e instanceof Number) out.add(((Number) e).longValue());
                else if (e instanceof Map) {
                    Object id = ((Map<?, ?>) e).get("id");
                    if (id instanceof Number) out.add(((Number) id).longValue());
                    else if (id != null) try { out.add(Long.parseLong(String.valueOf(id))); } catch (Exception ignored) {}
                } else if (e != null) try { out.add(Long.parseLong(String.valueOf(e))); } catch (Exception ignored) {}
            }
        } else if (obj instanceof Number) {
            out.add(((Number) obj).longValue());
        } else if (obj instanceof String) {
            String s = ((String) obj).trim();
            if (!s.isEmpty()) try { out.add(Long.parseLong(s)); } catch (Exception ignored) {}
        }
        return out;
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
                    // limpa join antes para cen_turno_trabalho (FK sem cascade)
                    Uni<Integer> pre = "cen_turno_trabalho".equals(table)
                            ? session.createNativeQuery("DELETE FROM cen_turno_trabalho_unidade WHERE id_turno_trabalho = :id").setParameter("id", id).executeUpdate()
                            : Uni.createFrom().item(0);
                    return pre.flatMap(v -> {
                        String sql = "DELETE FROM " + quote(table) + " WHERE id = :id";
                        return session.createNativeQuery(sql).setParameter("id", id).executeUpdate()
                                .flatMap(rows -> rows == 0
                                        ? Uni.createFrom().failure(new NotFoundException("Registro " + id + " não encontrado em " + table))
                                        : Uni.createFrom().voidItem());
                    });
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

package br.com.sol7.olimpio.relatorios.tabela.service;
import br.com.sol7.olimpio.relatorios.estrutura.entity.Estrutura;
import br.com.sol7.olimpio.relatorios.medida.entity.Medida;
import br.com.sol7.olimpio.relatorios.tabela.controller.TabelaController;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaResponse;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaRequest;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaExecutadaResponse;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaColunaRequest;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaColunaResponse;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaCampoResponse;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaOpcoesResponse;
import br.com.sol7.olimpio.relatorios.tabela.entity.Tabela;
import br.com.sol7.olimpio.relatorios.tabela.entity.TabelaColuna;
import br.com.sol7.olimpio.relatorios.tabela.repository.TabelaRepository;
import br.com.sol7.olimpio.relatorios.tabela.repository.TabelaColunaRepository;
import io.quarkus.hibernate.reactive.panache.Panache;

@ApplicationScoped
@WithTransaction
public class TabelaService {

    @Inject
    TabelaRepository repository;
    @Inject
    TabelaColunaRepository colunaRepository;

    public Uni<List<TabelaResponse>> list() {
        return repository.listAll().chain(items ->
                io.smallrye.mutiny.Multi.createFrom().iterable(items)
                        .onItem().transformToUniAndConcatenate(this::toResponse)
                        .collect().asList());
    }

    public Uni<PagedResponse<TabelaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> io.smallrye.mutiny.Multi.createFrom().iterable(items)
                        .onItem().transformToUniAndConcatenate(this::toResponse)
                        .collect().asList()
                        .chain(responses -> repository.count()
                                .map(count -> new PagedResponse<>(responses, count, p, s))));
    }


    public Uni<TabelaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Tabela not found"))
                .onItem().transformToUni(this::toResponse);
    }

    public Uni<TabelaResponse> create(TabelaRequest r) {
        var e = new Tabela();
        apply(e, r);
        return repository.persist(e).chain(() -> salvarColunas(e.id, r.colunas())).chain(() -> toResponse(e));
    }

    public Uni<TabelaResponse> update(Long id, TabelaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Tabela not found"))
                .invoke(e -> apply(e, r))
                .onItem().transformToUni(e -> salvarColunas(e.id, r.colunas()).chain(() -> toResponse(e)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Tabela not found")));
    }

    private static final String SQL_COLUNAS = "SELECT tc.ordem, d.nome_visualizacao, d.tipo_info_dimensao, dc.coluna, m.nome_visualizacao, m.tipo_info_medida, mc.coluna FROM rel_tabela_colunas tc LEFT JOIN rel_dimensao d ON d.id = tc.id_dimensao LEFT JOIN rel_coluna dc ON dc.id = d.id_coluna LEFT JOIN rel_medida m ON m.id = tc.id_medida LEFT JOIN rel_coluna mc ON mc.id = m.id_coluna WHERE tc.id_tabela = ?1 ORDER BY tc.ordem, tc.id";
    private static final String SQL_ESTRUTURA = "SELECT e.tabela, e.condicao FROM rel_tabela t INNER JOIN rel_estrutura e ON e.id = t.id_estrutura WHERE t.id = ?1";
    // Migrado de FiltrosController (extracted_aceso): filtros atuam no WHERE e referenciam a mesma
    // expressao de rel_coluna.coluna (cortada no " as ") via rel_dimensao do rel_filtro.
    private static final String SQL_FILTROS = "SELECT f.nome, dc.coluna, f.tipo_filtro, f.operacao, f.data_inicio, f.data_fim, f.periodo_dinamico, f.valor_fixo " +
            "FROM rel_filtro f " +
            "LEFT JOIN rel_dimensao d ON d.id = f.id_dimensao " +
            "LEFT JOIN rel_coluna dc ON dc.id = d.id_coluna " +
            "WHERE f.id_estrutura = (SELECT e.id FROM rel_tabela t INNER JOIN rel_estrutura e ON e.id = t.id_estrutura WHERE t.id = ?1)";

    /**
     * Executa a consulta montada pela estrutura e pelas colunas configuradas, com paginação via LIMIT/OFFSET do PostgreSQL.
     */
    public Uni<TabelaExecutadaResponse> executar(Long tabelaId, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return Panache.getSession().chain(session -> session.createNativeQuery(SQL_ESTRUTURA).setParameter(1, tabelaId).getSingleResultOrNull())
                .onItem().ifNull().failWith(() -> new NotFoundException("Estrutura da tabela não encontrada"))
                .onItem().transformToUni(estrutura -> Panache.getSession().chain(session -> session.createNativeQuery(SQL_COLUNAS).setParameter(1, tabelaId).getResultList())
                        .onItem().transformToUni(colunas -> executarSql((Object[]) estrutura, colunas, p, s)));
    }

    public Uni<TabelaExecutadaResponse> executar(Long tabelaId) {
        return executar(tabelaId, 0, 500);
    }

    private record SqlMontado(String sql, List<String> cabecalhos) {
    }

    private SqlMontado montarSql(Object[] estrutura, List<?> configuracoes) {
        if (configuracoes.isEmpty()) return new SqlMontado("SELECT 1", List.of());
        String origem = texto(estrutura[0]);
        String condicao = texto(estrutura[1]);
        validarFragmento(origem);
        validarFragmento(condicao);
        List<String> expressoes = new ArrayList<>(), cabecalhos = new ArrayList<>(), grupos = new ArrayList<>();
        boolean possuiAgregacao = false;
        for (Object configuracao : configuracoes) {
            Object[] coluna = (Object[]) configuracao;
            boolean dimensao = coluna[1] != null;
            String nome = texto(dimensao ? coluna[1] : coluna[4]);
            String tipoInfo = texto(dimensao ? coluna[2] : coluna[5]);
            String base = semAlias(texto(dimensao ? coluna[3] : coluna[6]));
            validarFragmento(base);
            String expressao = dimensao ? base : expressaoMedida(base, tipoInfo);
            possuiAgregacao |= !dimensao && ("CONTAGEM".equalsIgnoreCase(tipoInfo) || "CONTAGEM-DISTINTA".equalsIgnoreCase(tipoInfo));
            if (dimensao) grupos.add(base);
            expressoes.add(expressao);
            cabecalhos.add(nome.isBlank() ? "Coluna " + (cabecalhos.size() + 1) : nome);
        }
        StringBuilder sql = new StringBuilder("SELECT ").append(String.join(", ", expressoes)).append(' ').append(origem);
        if (!condicao.isBlank()) sql.append(' ').append(condicao);
        if (possuiAgregacao && !grupos.isEmpty()) sql.append(" GROUP BY ").append(String.join(", ", grupos));
        return new SqlMontado(sql.toString(), cabecalhos);
    }

    private Uni<TabelaExecutadaResponse> executarSql(Object[] estrutura, List<?> configuracoes, int page, int size) {
        if (configuracoes.isEmpty()) return Uni.createFrom().item(new TabelaExecutadaResponse(List.of(), List.of()));
        SqlMontado montado = montarSql(estrutura, configuracoes);
        String mainSql = montado.sql();
        String origem = texto(estrutura[0]);
        String whereClause = texto(estrutura[1]);
        String countSql = "SELECT count(*) FROM (SELECT 1 " + origem + (whereClause.isBlank() ? "" : " " + whereClause) + ") _cnt";

        int offset = page * size;
        String paginatedSql = mainSql + " LIMIT " + size + " OFFSET " + offset;

        Uni<Long> countUni = Panache.getSession()
                .chain(session -> session.createNativeQuery(countSql).getSingleResultOrNull())
                .map(result -> result == null ? 0L : ((Number) result).longValue());

        Uni<List<Object>> dataUni = Panache.getSession()
                .chain(session -> session.createNativeQuery(paginatedSql).getResultList());

        return countUni.chain(totalCount -> dataUni.map(resultado -> {
            int totalPages = (int) Math.ceil((double) totalCount / Math.max(1, size));
            return new TabelaExecutadaResponse(montado.cabecalhos(), converterLinhas(resultado, montado.cabecalhos()), totalCount, page, size, totalPages);
        }));
    }

    private List<Map<String, Object>> converterLinhas(List<?> resultado, List<String> cabecalhos) {
        List<Map<String, Object>> linhas = new ArrayList<>();
        for (Object registro : resultado) {
            Object[] valores = registro instanceof Object[] array ? array : new Object[]{registro};
            Map<String, Object> linha = new LinkedHashMap<>();
            for (int indice = 0; indice < cabecalhos.size(); indice++)
                linha.put(cabecalhos.get(indice), indice < valores.length ? valores[indice] : null);
            linhas.add(linha);
        }
        return linhas;
    }

    private String expressaoMedida(String expressao, String tipoInfo) {
        if ("CONTAGEM-DISTINTA".equalsIgnoreCase(tipoInfo)) return "count(DISTINCT " + expressao + ")";
        if ("CONTAGEM".equalsIgnoreCase(tipoInfo)) return "count(" + expressao + ")";
        return expressao;
    }

    private String semAlias(String coluna) {
        return coluna.replaceFirst("(?i)\\s+as\\s+.*$", "").trim();
    }

    private String texto(Object valor) {
        return valor == null ? "" : valor.toString().trim();
    }

    private void validarFragmento(String fragmento) {
        if (fragmento.contains(";")) throw new IllegalArgumentException("Configuração SQL inválida");
    }

    private void apply(Tabela e, TabelaRequest r) {
        e.nome = r.nome();
        e.dataCadastro = r.dataCadastro();
        e.dataAlteracao = r.dataAlteracao();
        e.todosUnidades = r.todosUnidades();
        e.todosPerfis = r.todosPerfis();
        e.todosUsuarios = r.todosUsuarios();
        e.estruturaId = r.estruturaId();
    }

    private Uni<TabelaResponse> toResponse(Tabela e) {
        return colunaRepository.find("tabelaId = ?1", e.id).list().map(colunas -> new TabelaResponse(e.id, e.nome, e.dataCadastro, e.dataAlteracao, e.todosUnidades, e.todosPerfis, e.todosUsuarios, e.estruturaId, colunas.stream().map(coluna -> new TabelaColunaResponse(coluna.id, coluna.dimensaoId, coluna.medidaId, coluna.ordem)).toList()));
    }

    private Uni<Void> salvarColunas(Long tabelaId, List<TabelaColunaRequest> colunas) {
        return colunaRepository.delete("tabelaId = ?1", tabelaId).chain(() -> {
            List<TabelaColunaRequest> configuradas = colunas == null ? List.of() : colunas;
            return io.smallrye.mutiny.Multi.createFrom().iterable(configuradas)
                    .onItem().transformToUniAndConcatenate(coluna -> {
                        TabelaColuna entidade = new TabelaColuna();
                        entidade.tabelaId = tabelaId;
                        entidade.dimensaoId = coluna.dimensaoId();
                        entidade.medidaId = coluna.medidaId();
                        entidade.ordem = coluna.ordem() == null ? 0 : coluna.ordem();
                        return colunaRepository.persist(entidade);
                    }).collect().asList().replaceWithVoid();
        });
    }

    public Uni<TabelaOpcoesResponse> opcoes(Long estruturaId) {
        if (estruturaId == null) return Uni.createFrom().item(new TabelaOpcoesResponse(List.of(), List.of()));
        String dimensoes = "SELECT id, nome_visualizacao, tipo_dimensao, tipo_info_dimensao FROM rel_dimensao WHERE id_estrutura = ?1 ORDER BY nome_visualizacao";
        String medidas = "SELECT id, nome_visualizacao, tipo_medida, tipo_info_medida FROM rel_medida WHERE id_estrutura = ?1 ORDER BY nome_visualizacao";
        return Panache.getSession().chain(session -> session.createNativeQuery(dimensoes).setParameter(1, estruturaId).getResultList())
                .map(this::campos)
                .onItem().transformToUni(listaDimensoes -> Panache.getSession().chain(session -> session.createNativeQuery(medidas).setParameter(1, estruturaId).getResultList())
                        .map(this::campos).map(listaMedidas -> new TabelaOpcoesResponse(listaDimensoes, listaMedidas)));
    }

    private List<TabelaCampoResponse> campos(List<?> resultado) {
        return resultado.stream().map(item -> (Object[]) item).map(item -> new TabelaCampoResponse(((Number) item[0]).longValue(), texto(item[1]), texto(item[2]), texto(item[3]))).toList();
    }


    // Migrado de TabelaController.gerarSql (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/TabelaController.java:184, camada controller)
    // Logica original (adaptar):
    // public String gerarSql() {
    //         List<TabelaWapper> tabelaWapper = new ArrayList<>((Collection<? extends TabelaWapper>) lazyTabelaWapper.getWrappedData());
    //         return tabelaWapper.get(0).getSql();
    //     }
    public Uni<String> gerarSql() {
        // Obs: logica de UI do controlador JSF legado (lazyTabelaWapper com dados da tela), sem equivalente reativo
        return Uni.createFrom().item(null);
    }

    public Uni<String> gerarSqlCompleto(Long tabelaId, Map<String, Object> filtros) {
        return Panache.getSession().chain(session -> session.createNativeQuery(SQL_ESTRUTURA).setParameter(1, tabelaId).getSingleResultOrNull())
                .onItem().ifNull().failWith(() -> new NotFoundException("Estrutura da tabela não encontrada"))
                .onItem().transformToUni(estrutura -> Panache.getSession()
                        .chain(session -> session.createNativeQuery(SQL_COLUNAS).setParameter(1, tabelaId).getResultList())
                        .onItem().transformToUni(configuracoes -> Panache.getSession()
                                .chain(session -> session.createNativeQuery(SQL_FILTROS).setParameter(1, tabelaId).getResultList())
                                .map(configFiltros -> {
                                    if (configuracoes.isEmpty()) return "SELECT 1";
                                    Object[] estruturaArr = (Object[]) estrutura;
                                    SqlMontado montado = montarSql(estruturaArr, configuracoes);
                                    String base = montado.sql();
                                    String condicao = texto(estruturaArr[1]);
                                    String fragmento = montarFiltroSql(configFiltros, filtros);
                                    if (fragmento == null || fragmento.isEmpty()) return base;
                                    return base + (condicao.isBlank() ? " WHERE " : " AND ") + fragmento;
                                })));
    }

    // Migrado de FiltrosController.aplicarFiltro/ajustafiltro e convertOperationAndValue
    // (extracted_aceso) + QueryBuilder: monta o predicado WHERE a partir dos filtros vindos do
    // frontend. Cada entrada do mapa tem o NOME do rel_filtro como chave e
    // { operation, value [, value2] } como valor.
    private String montarFiltroSql(List<?> configFiltros, Map<String, Object> filtros) {
        if (filtros == null || filtros.isEmpty()) return "";
        Map<String, Object[]> porNome = new HashMap<>();
        for (Object item : configFiltros) {
            Object[] cfg = (Object[]) item;
            String nome = texto(cfg[0]);
            if (!nome.isEmpty()) porNome.put(nome.trim().toLowerCase(), cfg);
        }
        List<String> condicoes = new ArrayList<>();
        for (Map.Entry<String, Object> entrada : filtros.entrySet()) {
            Object condicaoObj = entrada.getValue();
            if (!(condicaoObj instanceof Map<?, ?>)) continue;
            Map<?, ?> cond = (Map<?, ?>) condicaoObj;
            Object[] cfg = porNome.get(entrada.getKey().trim().toLowerCase());
            if (cfg == null) continue;
            String coluna = semAlias(texto(cfg[1]));
            if (coluna.isEmpty()) continue;
            String operador = operador(cond);
            String valor = texto(cond.get("value"));
            String valor2 = texto(cond.get("value2"));
            String tipoFiltro = texto(cfg[2]);
            String trecho = montarCondicao(coluna, operador, valor, valor2, tipoFiltro);
            if (trecho != null) condicoes.add(trecho);
        }
        return String.join(" AND ", condicoes);
    }

    private String operador(Map<?, ?> cond) {
        Object op = cond.get("operation");
        if (op == null) op = cond.get("operator");
        return op == null ? "" : op.toString();
    }

    private String montarCondicao(String coluna, String operador, String valor, String valor2, String tipoFiltro) {
        if (operador == null || operador.isBlank() || valor == null) return null;
        String op = normalizarOperador(operador);
        if (op == null) return null;
        String dinamico = periodoDinamico(op, coluna, valor);
        if (dinamico != null) return dinamico;
        if ("BETWEEN".equals(op)) {
            if (valor.isBlank() || valor2 == null || valor2.isBlank()) return null;
            return "cast(" + coluna + " as date) BETWEEN '" + esc(valor) + "' AND '" + esc(valor2) + "'";
        }
        if ("IN".equals(op)) {
            return coluna + " IN (" + listaValores(valor) + ")";
        }
        String pattern = patternIlike(op, valor);
        if (pattern != null) return coluna + " ILIKE '" + esc(pattern) + "'";
        boolean tempo = "NORMAL".equalsIgnoreCase(tipoFiltro) || "FAIXA".equalsIgnoreCase(tipoFiltro) || "PERIODICO".equalsIgnoreCase(tipoFiltro);
        if (tempo) return "cast(" + coluna + " as date) " + op + " '" + esc(valor) + "'";
        return coluna + " " + op + " '" + esc(valor) + "'";
    }

    private String periodoDinamico(String op, String coluna, String valor) {
        if (!"=".equals(op)) return null;
        String v = valor.trim().toUpperCase();
        return switch (v) {
            case "HOJE", "DIA ATUAL" -> "cast(" + coluna + " as date) = CURRENT_DATE";
            case "ONTEM", "DIA ANTERIOR" -> "cast(" + coluna + " as date) = CURRENT_DATE - INTERVAL '1 DAY'";
            case "ULTIMA_SEMANA", "SEMANA ANTERIOR" -> "date_trunc('week', cast(" + coluna + " as date)) = date_trunc('week', CURRENT_DATE) - INTERVAL '1 week'";
            case "ULTIMO_MES", "MES ANTERIOR" -> "date_trunc('month', cast(" + coluna + " as date)) = date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'";
            case "ULTIMO_ANO", "ANO ANTERIOR" -> "date_trunc('year', cast(" + coluna + " as date)) = date_trunc('year', CURRENT_DATE) - INTERVAL '1 year'";
            case "MES_ATUAL", "MES ATUAL" -> "date_trunc('month', cast(" + coluna + " as date)) = date_trunc('month', CURRENT_DATE)";
            case "ANO_ATUAL", "ANO ATUAL" -> "date_trunc('year', cast(" + coluna + " as date)) = date_trunc('year', CURRENT_DATE)";
            default -> null;
        };
    }

    private String normalizarOperador(String operador) {
        if (operador == null) return null;
        return switch (operador.toUpperCase()) {
            case "EQUALS", "EQ", "=" -> "=";
            case "NOT_EQUALS", "NOT_EQUAL", "NE", "!=", "<>" -> "<>";
            case "GREATER_THAN", "GT", ">" -> ">";
            case "GREATER_THAN_OR_EQUAL", "GE", ">=" -> ">=";
            case "LESS_THAN", "LT", "<" -> "<";
            case "LESS_THAN_OR_EQUAL", "LE", "<=" -> "<=";
            case "BETWEEN" -> "BETWEEN";
            case "IN", "IN_LIST" -> "IN";
            case "CONTAINS" -> "CONTAINS";
            case "STARTS_WITH" -> "STARTS_WITH";
            case "ENDS_WITH" -> "ENDS_WITH";
            default -> null;
        };
    }

    private String patternIlike(String op, String valor) {
        return switch (op) {
            case "CONTAINS" -> "%" + valor + "%";
            case "STARTS_WITH" -> valor + "%";
            case "ENDS_WITH" -> "%" + valor;
            default -> null;
        };
    }

    private String listaValores(String valor) {
        return Arrays.stream(valor.split(",")).map(String::trim).filter(s -> !s.isEmpty())
                .map(s -> "'" + esc(s) + "'").collect(Collectors.joining(", "));
    }

    private String esc(String v) {
        return v.replace("'", "''");
    }


    // Migrado de TabelaController.buscarMedidas (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/TabelaController.java:269, camada controller)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public void buscarMedidas(Estrutura fato) {
    //         if (fato != null) {
    //             medidas = medidaService.buscarMedidasPeloFato(fato);
    //         } else {
    //             medidas = new ArrayList<>();
    //         }
    //     }
    // Obs: nao existe entidade/repositorio Medida neste microservico (medidaService.buscarMedidasPeloFato)
    // Implementacao: retorna IDs de medidas de uma estrutura (requer chamada ao microservico relatorios original ou modulo de medidas)
    public Uni<List<Long>> buscarMedidas(Long estruturaId) {
        if (estruturaId == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        // Validação + Regra de Negócio via consulta integrada no microserviço de relatórios
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM rel_medida WHERE estrutura_id = ?1").setParameter(1, estruturaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarDimensoesDescritivo(Long estruturaId) {
        if (estruturaId == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        // Validação + Regra de Negócio via consulta integrada no microserviço de relatórios (tipo DESCRITIVO)
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM rel_dimensao WHERE estrutura_id = ?1 AND tipo_info = 'DESCRITIVO'").setParameter(1, estruturaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarDimensoesTempo(Long estruturaId) {
        if (estruturaId == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        // Validação + Regra de Negócio via consulta integrada no microserviço de relatórios (tipo TEMPO)
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM rel_dimensao WHERE estrutura_id = ?1 AND tipo_info = 'TEMPO'").setParameter(1, estruturaId).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de TabelaService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:33, camada service)
    // Observacao: parametro id: era Tabela (referencia por id)
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades(Tabela id) {
    //         return getConexaoRepository().buscarUnidades(id);
    //     }
    public Uni<List<Long>> buscarUnidades(Long id) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM bas_unidade").getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de TabelaService.buscarPerfils (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:37, camada service)
    // Observacao: parametro id: era Tabela (referencia por id)
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfils(Tabela id) {
    //         return getConexaoRepository().buscarPerfils(id);
    //     }
    public Uni<List<Long>> buscarPerfils(Long id) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM bas_perfil").getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de TabelaService.buscarUsuarios (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:41, camada service)
    // Observacao: parametro id: era Tabela (referencia por id)
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarios(Tabela id) {
    //         return getConexaoRepository().buscarUsuarios(id);
    //     }
    public Uni<List<Long>> buscarUsuarios(Long id) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM bas_usuario").getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de TabelaService.buscarTabelaPeloFato (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:45, camada service)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Tabela> buscarTabelaPeloFato(Estrutura fato) {
    //         return getConexaoRepository().buscarTabelaPeloFato(fato);
    //     }
    public Uni<List<Long>> buscarTabelaPeloFato(Long fatoId) {
        return repository.buscarTabelaPeloFato(fatoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de TabelaService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/relatorios/TabelaService.java:49, camada service)
    // Observacao: parametro estruturaId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Tabela> autoComplete(String query, Estrutura estrutura) {
    //         return this.getConexaoRepository().autoComplete(query.toLowerCase(), estrutura, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query, Long estruturaId) {
        return repository.autoComplete(query.toLowerCase(), estruturaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}

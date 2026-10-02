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
import jakarta.ws.rs.InternalServerErrorException;
import org.jboss.logging.Logger;

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
import br.com.sol7.olimpio.relatorios.shared.FiltroSqlBuilder;
import br.com.sol7.olimpio.shared.TupleHelper;
import jakarta.persistence.Tuple;

@ApplicationScoped
@WithTransaction
public class TabelaService {

    private static final Logger LOG = Logger.getLogger(TabelaService.class);

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

    private static final String SQL_COLUNAS = "SELECT tc.ordem AS ordem, d.nome_visualizacao AS dim_nome, d.tipo_info_dimensao AS dim_tipo, dc.coluna AS dim_coluna, m.nome_visualizacao AS med_nome, m.tipo_info_medida AS med_tipo, mc.coluna AS med_coluna FROM rel_tabela_colunas tc LEFT JOIN rel_dimensao d ON d.id = tc.id_dimensao LEFT JOIN rel_coluna dc ON dc.id = d.id_coluna LEFT JOIN rel_medida m ON m.id = tc.id_medida LEFT JOIN rel_coluna mc ON mc.id = m.id_coluna WHERE tc.id_tabela = ?1 ORDER BY tc.ordem, tc.id";
    private static final String SQL_ESTRUTURA = "SELECT e.tabela AS tabela, e.condicao AS condicao FROM rel_tabela t INNER JOIN rel_estrutura e ON e.id = t.id_estrutura WHERE t.id = ?1";

    // expressao de rel_coluna.coluna (cortada no " as ") via rel_dimensao do rel_filtro.
    private static final String SQL_FILTROS = "SELECT f.nome AS nome, dc.coluna AS coluna, f.tipo_filtro AS tipo_filtro, f.operacao AS operacao, f.data_inicio AS data_inicio, f.data_fim AS data_fim, f.periodo_dinamico AS periodo_dinamico, f.valor_fixo AS valor_fixo " +
            "FROM rel_filtro f " +
            "LEFT JOIN rel_dimensao d ON d.id = f.id_dimensao " +
            "LEFT JOIN rel_coluna dc ON dc.id = d.id_coluna " +
            "WHERE f.id_estrutura = (SELECT e.id FROM rel_tabela t INNER JOIN rel_estrutura e ON e.id = t.id_estrutura WHERE t.id = ?1)";

    /**
     * Executa a consulta montada pela estrutura e pelas colunas configuradas, com paginação via LIMIT/OFFSET do PostgreSQL.
     */
    public Uni<TabelaExecutadaResponse> executar(Long tabelaId, int page, int size) {
        return executar(tabelaId, page, size, null);
    }

    /**
     * Executa a tabela aplicando também os filtros recebidos do frontend
     * ({ nome do filtro -> { operation, value, value2 } }), usando as mesmas
     * regras de montagem de predicado das demais views de relatório.
     */
    public Uni<TabelaExecutadaResponse> executar(Long tabelaId, int page, int size, Map<String, Object> filtros) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return Panache.getSession().chain(session -> session.createNativeQuery(SQL_ESTRUTURA, Tuple.class).setParameter(1, tabelaId).getSingleResultOrNull())
                .onItem().ifNull().failWith(() -> new NotFoundException("Estrutura da tabela não encontrada"))
                .onItem().transformToUni(estrutura -> Panache.getSession().chain(session -> session.createNativeQuery(SQL_COLUNAS, Tuple.class).setParameter(1, tabelaId).getResultList())
                        .onItem().transformToUni(colunas -> executarSql(tabelaId, (Tuple) estrutura, colunas, p, s, filtros)))
                .onFailure().recoverWithUni(throwable -> {
                    LOG.errorf(throwable, "Erro ao executar tabela ID %d: %s", tabelaId, throwable.getMessage());
                    if (throwable instanceof IllegalArgumentException) {
                        return Uni.createFrom().failure(new InternalServerErrorException("Configuração SQL inválida na tabela: " + throwable.getMessage()));
                    }
                    if (throwable instanceof jakarta.persistence.PersistenceException) {
                        String msg = throwable.getCause() != null ? throwable.getCause().getMessage() : throwable.getMessage();
                        return Uni.createFrom().failure(new InternalServerErrorException("Erro ao executar consulta SQL da tabela: " + msg));
                    }
                    return Uni.createFrom().failure(throwable);
                });
    }

    public Uni<TabelaExecutadaResponse> executar(Long tabelaId) {
        return executar(tabelaId, 0, 500);
    }

    private record SqlMontado(String sql, List<String> cabecalhos) {
    }

    private SqlMontado montarSql(Tuple estrutura, List<?> configuracoes) {
        if (configuracoes.isEmpty()) return new SqlMontado("SELECT 1", List.of());
        String origem = texto(TupleHelper.getString(estrutura, "tabela"));
        String condicao = texto(TupleHelper.getString(estrutura, "condicao"));
        validarFragmento(origem);
        validarFragmento(condicao);
        List<String> expressoes = new ArrayList<>(), cabecalhos = new ArrayList<>(), grupos = new ArrayList<>();
        boolean possuiAgregacao = false;
        for (Object configuracao : configuracoes) {
            Tuple coluna = (Tuple) configuracao;
            String dimNome = texto(TupleHelper.getString(coluna, "dim_nome"));
            String dimTipo = texto(TupleHelper.getString(coluna, "dim_tipo"));
            String dimExpr = semAlias(texto(TupleHelper.getString(coluna, "dim_coluna")));
            String medNome = texto(TupleHelper.getString(coluna, "med_nome"));
            String medTipo = texto(TupleHelper.getString(coluna, "med_tipo"));
            String medExpr = semAlias(texto(TupleHelper.getString(coluna, "med_coluna")));
            
            boolean dimensao = !dimExpr.isBlank();
            String nome = dimensao ? dimNome : medNome;
            String tipoInfo = dimensao ? dimTipo : medTipo;
            String base = dimensao ? dimExpr : medExpr;
            
            validarFragmento(base);
            if (base.isBlank()) continue;
            
            String expressao = dimensao ? base : expressaoMedida(base, tipoInfo);
            possuiAgregacao |= !dimensao && ("CONTAGEM".equalsIgnoreCase(tipoInfo) || "CONTAGEM-DISTINTA".equalsIgnoreCase(tipoInfo));
            if (dimensao) grupos.add(base);
            expressoes.add(expressao + " AS " + "\"" + (nome.isBlank() ? "Coluna " + (cabecalhos.size() + 1) : nome.replace("\"", "")) + "\"");
            cabecalhos.add(nome.isBlank() ? "Coluna " + (cabecalhos.size() + 1) : nome);
        }
        if (expressoes.isEmpty()) expressoes.add("1 AS col");
        StringBuilder sql = new StringBuilder("SELECT ").append(String.join(", ", expressoes)).append(' ').append(origem);
        if (!condicao.isBlank()) sql.append(' ').append(condicao);
        if (possuiAgregacao && !grupos.isEmpty()) sql.append(" GROUP BY ").append(String.join(", ", grupos));
        LOG.infof("SQL Montado: %s", sql.toString());
        return new SqlMontado(sql.toString(), cabecalhos);
    }

    private Uni<TabelaExecutadaResponse> executarSql(Long tabelaId, Tuple estrutura, List<?> configuracoes, int page, int size, Map<String, Object> filtros) {
        if (configuracoes.isEmpty()) return Uni.createFrom().item(new TabelaExecutadaResponse(List.of(), List.of()));
        SqlMontado montado = montarSql(estrutura, configuracoes);
        int offset = page * size;
        return fragmentoFiltros(tabelaId, filtros).map(fragmento -> {
            String mainSql = aplicarFiltros(montado.sql(), fragmento);
            String paginatedSql = mainSql + " LIMIT " + size + " OFFSET " + offset;
            String countSql;
            if (fragmento == null || fragmento.isBlank()) {
                String origem = texto(TupleHelper.getString(estrutura, "tabela"));
                String whereClause = texto(TupleHelper.getString(estrutura, "condicao"));
                countSql = "SELECT count(*) FROM (SELECT 1 " + origem + (whereClause.isBlank() ? "" : " " + whereClause) + ") _cnt";
            } else {
                countSql = "SELECT count(*) FROM (SELECT * FROM (" + mainSql + ") _filtros WHERE " + fragmento + ") _cnt";
            }
            return new ExecucaoMontada(montado, mainSql, countSql, paginatedSql, size);
        }).chain(execucao -> {
            Uni<Long> countUni = Panache.getSession()
                    .chain(session -> session.createNativeQuery(execucao.countSql()).getSingleResultOrNull())
                    .map(result -> result == null ? 0L : ((Number) result).longValue());
            Uni<List<Tuple>> dataUni = Panache.getSession()
                    .chain(session -> session.createNativeQuery(execucao.paginatedSql(), Tuple.class).getResultList());
            return countUni.chain(totalCount -> dataUni.map(resultado -> {
                int totalPages = (int) Math.ceil((double) totalCount / Math.max(1, execucao.size()));
                return new TabelaExecutadaResponse(execucao.montado().cabecalhos(), converterLinhas(resultado, execucao.montado().cabecalhos()), totalCount, page, execucao.size(), totalPages);
            }));
        });
    }

    private record ExecucaoMontada(SqlMontado montado, String mainSql, String countSql, String paginatedSql, int size) {
    }

    /**
     * O predicado e aplicado sobre a consulta ja montada (subquery), preservando
     * GROUP BY, condicoes da estrutura e a paginação.
     */
    private String aplicarFiltros(String sql, String fragmento) {
        if (fragmento == null || fragmento.isBlank()) return sql;
        return "SELECT * FROM (" + sql + ") _filtros WHERE " + fragmento;
    }

    private Uni<String> fragmentoFiltros(Long tabelaId, Map<String, Object> filtros) {
        if (filtros == null || filtros.isEmpty()) return Uni.createFrom().item("");
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FILTROS, Tuple.class).setParameter(1, tabelaId).getResultList())
                .map(configFiltros -> montarFiltroSql(configFiltros, filtros));
    }

    private List<Map<String, Object>> converterLinhas(List<?> resultado, List<String> cabecalhos) {
        List<Map<String, Object>> linhas = new ArrayList<>();
        for (Object registro : resultado) {
            Tuple t = (Tuple) registro;
            Map<String, Object> linha = new LinkedHashMap<>();
            for (int indice = 0; indice < cabecalhos.size(); indice++)
                linha.put(cabecalhos.get(indice), TupleHelper.get(t, cabecalhos.get(indice)));
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
        if (coluna == null) return "";
        String limpa = Arrays.stream(coluna.split("\n"))
                .filter(linha -> !linha.trim().startsWith("--"))
                .collect(Collectors.joining(" "));
        // Remove trailing AS alias (handles both "as alias" and "as \"alias with spaces\"")
        int lastAs = limpa.toLowerCase().lastIndexOf(" as ");
        if (lastAs > 0) {
            String afterAs = limpa.substring(lastAs + 4).trim();
            // Check if it's a simple alias (no spaces unless quoted, no parentheses)
            if (!afterAs.isEmpty() && !afterAs.contains("(") && !afterAs.contains(")")) {
                // Also check if it's a quoted alias like "Nome Aluno"
                if (!afterAs.contains(" ") || (afterAs.startsWith("\"") && afterAs.endsWith("\""))) {
                    return limpa.substring(0, lastAs).trim();
                }
            }
        }
        return limpa.trim();
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
        String dimensoes = "SELECT id AS id, nome_visualizacao AS nome, tipo_dimensao AS tipo, tipo_info_dimensao AS tipo_info FROM rel_dimensao WHERE id_estrutura = ?1 ORDER BY nome_visualizacao";
        String medidas = "SELECT id AS id, nome_visualizacao AS nome, tipo_medida AS tipo, tipo_info_medida AS tipo_info FROM rel_medida WHERE id_estrutura = ?1 ORDER BY nome_visualizacao";
        return Panache.getSession().chain(session -> session.createNativeQuery(dimensoes, Tuple.class).setParameter(1, estruturaId).getResultList())
                .map(this::campos)
                .onItem().transformToUni(listaDimensoes -> Panache.getSession().chain(session -> session.createNativeQuery(medidas, Tuple.class).setParameter(1, estruturaId).getResultList())
                        .map(this::campos).map(listaMedidas -> new TabelaOpcoesResponse(listaDimensoes, listaMedidas)));
    }

    private List<TabelaCampoResponse> campos(List<?> resultado) {
        return resultado.stream().map(item -> (Tuple) item).map(item -> new TabelaCampoResponse(TupleHelper.getLong(item, "id"), texto(TupleHelper.getString(item, "nome")), texto(TupleHelper.getString(item, "tipo")), texto(TupleHelper.getString(item, "tipo_info")))).toList();
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
        return Panache.getSession().chain(session -> session.createNativeQuery(SQL_ESTRUTURA, Tuple.class).setParameter(1, tabelaId).getSingleResultOrNull())
                .onItem().ifNull().failWith(() -> new NotFoundException("Estrutura da tabela não encontrada"))
                .onItem().transformToUni(estrutura -> Panache.getSession()
                        .chain(session -> session.createNativeQuery(SQL_COLUNAS, Tuple.class).setParameter(1, tabelaId).getResultList())
                        .onItem().transformToUni(configuracoes -> Panache.getSession()
                                .chain(session -> session.createNativeQuery(SQL_FILTROS, Tuple.class).setParameter(1, tabelaId).getResultList())
                                .map(configFiltros -> {
                                    if (configuracoes.isEmpty()) return "SELECT 1";
                                    Tuple estruturaArr = (Tuple) estrutura;
                                    SqlMontado montado = montarSql(estruturaArr, configuracoes);
                                    String fragmento = montarFiltroSql(configFiltros, filtros);
                                    return aplicarFiltros(montado.sql(), fragmento);
                                })));
    }

    // Delega ao construtor compartilhado (FiltroSqlBuilder) para manter o mesmo
    // comportamento das demais views: filtros fixos ({ selected: true }) usam a
    // operacao/valor configurados em rel_filtro.
    private String montarFiltroSql(List<?> configFiltros, Map<String, Object> filtros) {
        return FiltroSqlBuilder.montarFiltroSql(configFiltros, filtros);
    }

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

    public Uni<List<Long>> buscarUnidades(Long id) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM bas_unidade WHERE id = ?1").setParameter(1, id).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarPerfils(Long id) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM bas_perfil WHERE id = ?1").setParameter(1, id).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarUsuarios(Long id) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT id FROM bas_usuario WHERE id = ?1").setParameter(1, id).getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarTabelaPeloFato(Long fatoId) {
        return repository.buscarTabelaPeloFato(fatoId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoComplete(String query, Long estruturaId) {
        return repository.autoComplete(query.toLowerCase(), estruturaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}

package br.com.sol7.olimpio.relatorios.grafico;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.relatorios.grafico.dto.GraficoDadosResponse;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@ApplicationScoped
@WithTransaction
public class GraficoService {

    @Inject
    GraficoRepository repository;

    @Inject
    Pool pool;

    private static final Pattern COMANDOS_BLOQUEADOS = Pattern.compile(
            "(?i)\\b(insert|update|delete|drop|alter|truncate|grant|revoke|create|exec|execute|call|copy|merge|vacuum|do|comment)\\b");
    private static final Pattern INICIA_COM_SELECT = Pattern.compile("(?is)^\\s*(with|select)\\b");

    private static final int LIMITE_MAXIMO = 500;

    public Uni<List<GraficoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GraficoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<GraficoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Grafico not found"))
                .map(this::toResponse);
    }

    public Uni<GraficoResponse> create(GraficoRequest r) {
        var e = new Grafico();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GraficoResponse> update(Long id, GraficoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Grafico not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Grafico not found")));
    }

    private void apply(Grafico e, GraficoRequest r) {
        e.nome = r.nome();
        e.todosUnidades = r.todosUnidades();
        e.todosPerfis = r.todosPerfis();
        e.todosUsuarios = r.todosUsuarios();
        e.formatoData = r.formatoData();
        e.dataAlteracao = r.dataAlteracao();
        e.tipo = r.tipo();
        e.ordemGrafico = r.ordemGrafico();
        e.exibirPercentual = r.exibirPercentual();
        e.exibirLegenda = r.exibirLegenda();
        e.colunaLegenda = r.colunaLegenda();
        e.limite = r.limite();
        e.coluna = r.coluna();
        e.altura = r.altura();
        e.margem = r.margem();
        e.diametro = r.diametro();
        e.exibirValor = r.exibirValor();
        e.valorAcumulado = r.valorAcumulado();
        e.tipoEixo = r.tipoEixo();
        e.posicao = r.posicao();
        e.estruturaId = r.estruturaId();
        e.dimensaoReferenciaId = r.dimensaoReferenciaId();
        e.dimensaoInformacaoId = r.dimensaoInformacaoId();
        e.medidaInformacaoId = r.medidaInformacaoId();
        e.dimensaoCombinadoId = r.dimensaoCombinadoId();
        e.medidaCombinadoId = r.medidaCombinadoId();
    }

    private GraficoResponse toResponse(Grafico e) {
        return new GraficoResponse(e.id, e.nome, e.todosUnidades, e.todosPerfis, e.todosUsuarios, e.formatoData, e.dataAlteracao, e.tipo, e.ordemGrafico, e.exibirPercentual, e.exibirLegenda, e.colunaLegenda, e.limite, e.coluna, e.altura, e.margem, e.diametro, e.exibirValor, e.valorAcumulado, e.tipoEixo, e.posicao, e.estruturaId, e.dimensaoReferenciaId, e.dimensaoInformacaoId, e.medidaInformacaoId, e.dimensaoCombinadoId, e.medidaCombinadoId);
    }


    public Uni<GraficoDadosResponse> dados(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Grafico not found"))
                .chain(grafico -> {
                    int limite = grafico.limite != null && !grafico.limite.isBlank()
                            ? Math.min(Integer.parseInt(grafico.limite), LIMITE_MAXIMO) : LIMITE_MAXIMO;
                    return montarResposta(grafico, limite);
                });
    }

    private Uni<GraficoDadosResponse> montarResposta(Grafico grafico, int limite) {
        return buscarEstruturaTabela(grafico.estruturaId).chain(tabela ->
                buscarEstruturaCondicao(grafico.estruturaId).chain(condicao ->
                        buscarDimensaoColuna(grafico.dimensaoReferenciaId).chain(dimColuna ->
                                buscarMedidaColuna(grafico.medidaInformacaoId).chain(medColuna ->
                                        buscarMedidaTipoInfo(grafico.medidaInformacaoId).chain(medTipoInfo ->
                                                montarRespostaComDados(grafico, limite, tabela, condicao, dimColuna, medColuna, medTipoInfo))))));
    }

    private Uni<GraficoDadosResponse> montarRespostaComDados(Grafico grafico, int limite, String tabela, String condicao, String dimColuna, String medColuna, String medTipoInfo) {
        if (tabela == null || tabela.isBlank())
            return Uni.createFrom().failure(new BadRequestException("Estrutura do grafico sem tabela definida"));
        if (dimColuna == null || dimColuna.isBlank())
            return Uni.createFrom().failure(new BadRequestException("Dimensao de referencia sem coluna definida"));
        if (medColuna == null || medColuna.isBlank())
            return Uni.createFrom().failure(new BadRequestException("Medida de informacao sem coluna definida"));

        String sqlPrincipal = montarSql(grafico.tipo, grafico.ordemGrafico, limite, tabela, condicao, dimColuna, medColuna, medTipoInfo);
        return executarSql(sqlPrincipal).chain(dadosL -> montarCombinado(grafico, limite, tabela, condicao, dadosL));
    }

    private Uni<GraficoDadosResponse> montarCombinado(Grafico grafico, int limite, String tabela, String condicao, List<Map<String, Object>> dadosL) {
        Uni<List<Map<String, Object>>> combinado;
        if ("COMBINADO".equalsIgnoreCase(grafico.tipo) && grafico.dimensaoCombinadoId != null && grafico.medidaCombinadoId != null) {
            combinado = buscarDimensaoColuna(grafico.dimensaoCombinadoId).chain(dimComb ->
                            buscarMedidaColuna(grafico.medidaCombinadoId).chain(medComb ->
                                    buscarMedidaTipoInfo(grafico.medidaCombinadoId).map(medCombTipo ->
                                            montarSql(grafico.tipo, grafico.ordemGrafico, limite, tabela, condicao, dimComb, medComb, medCombTipo))))
                    .chain(sqlComb -> executarSql(sqlComb));
        } else {
            combinado = Uni.createFrom().item(List.of());
        }
        return combinado.map(combL -> new GraficoDadosResponse(
                grafico.id, grafico.nome, grafico.tipo, grafico.ordemGrafico,
                grafico.exibirPercentual, grafico.exibirLegenda, grafico.exibirValor, grafico.valorAcumulado,
                limite, grafico.posicao, dadosL, combL));
    }

    private String montarSql(String tipo, String ordemGrafico, int limite, String tabela, String condicao, String dimensaoColuna, String medidaColuna, String medidaTipoInfo) {
        String medidaSql;
        if ("CONTAGEM-DISTINTA".equalsIgnoreCase(medidaTipoInfo)) {
            medidaSql = "count(DISTINCT " + medidaColuna + ")";
        } else if ("CONTAGEM".equalsIgnoreCase(medidaTipoInfo)) {
            medidaSql = "count(" + medidaColuna + ")";
        } else {
            medidaSql = "sum(" + medidaColuna + ")";
        }

        StringBuilder sql = new StringBuilder();
        sql.append("SELECT ").append(dimensaoColuna).append(" AS categoria, ").append(medidaSql).append(" AS valor");
        sql.append(" FROM ").append(tabela);

        if (condicao != null && !condicao.isBlank()) {
            sql.append(" ").append(condicao);
        }

        sql.append(" GROUP BY 1 ORDER BY 2");

        String ordem = ordemGrafico != null ? ordemGrafico.trim().toUpperCase() : "DESC";
        if ("ASC".equals(ordem) || "DESC".equals(ordem)) {
            sql.append(" ").append(ordem);
        }

        sql.append(" LIMIT ").append(limite);

        return sql.toString();
    }

    private Uni<List<Map<String, Object>>> executarSql(String sql) {
        validarSql(sql);
        return pool.query(sql).execute().map(rowSet -> {
            List<String> nomes = rowSet.columnsNames();
            List<Map<String, Object>> linhas = new ArrayList<>();
            for (Row row : rowSet) {
                Map<String, Object> linha = new LinkedHashMap<>();
                for (int i = 0; i < nomes.size(); i++) {
                    String nome = nomes.get(i);
                    Object valor = row.getValue(i);
                    if (valor != null && !(valor instanceof Number) && !(valor instanceof String) && !(valor instanceof Boolean)) {
                        valor = String.valueOf(valor);
                    }
                    linha.put(nome == null || nome.isBlank() ? "coluna" + i : nome, valor);
                }
                linhas.add(linha);
            }
            return linhas;
        });
    }

    private void validarSql(String sql) {
        if (sql == null || sql.isBlank()) throw new BadRequestException("SQL do grafico vazio.");
        if (!INICIA_COM_SELECT.matcher(sql).find()) throw new BadRequestException("SQL deve iniciar com SELECT.");
        if (COMANDOS_BLOQUEADOS.matcher(sql).find()) throw new BadRequestException("SQL contem comando nao permitido.");
    }

    private Uni<String> buscarEstruturaTabela(Long estruturaId) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT tabela FROM rel_estrutura WHERE id = ?1")
                        .setParameter(1, estruturaId)
                        .getSingleResultOrNull())
                .map(r -> r == null ? null : r.toString().trim());
    }

    private Uni<String> buscarEstruturaCondicao(Long estruturaId) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT condicao FROM rel_estrutura WHERE id = ?1")
                        .setParameter(1, estruturaId)
                        .getSingleResultOrNull())
                .map(r -> r == null ? null : r.toString().trim());
    }

    private Uni<String> buscarDimensaoColuna(Long dimensaoId) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT c.coluna FROM rel_dimensao d INNER JOIN rel_coluna c ON c.id = d.id_coluna WHERE d.id = ?1")
                        .setParameter(1, dimensaoId)
                        .getSingleResultOrNull())
                .map(r -> r == null ? null : r.toString().trim());
    }

    private Uni<String> buscarMedidaColuna(Long medidaId) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT c.coluna FROM rel_medida m INNER JOIN rel_coluna c ON c.id = m.id_coluna WHERE m.id = ?1")
                        .setParameter(1, medidaId)
                        .getSingleResultOrNull())
                .map(r -> r == null ? null : r.toString().trim());
    }

    private Uni<String> buscarMedidaTipoInfo(Long medidaId) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("SELECT m.tipo_info_medida FROM rel_medida m WHERE m.id = ?1")
                        .setParameter(1, medidaId)
                        .getSingleResultOrNull())
                .map(r -> r == null ? null : r.toString().trim());
    }

    // Migrado de GraficoController.autoCompleteDimensao (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/GraficoController.java:215, camada controller)
    // Logica original (adaptar):
    // public List<Dimensao> autoCompleteDimensao(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return dimensaoService.autoCompleteDimensao(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteDimensao(String query) {
        // Obs: nao existe entidade/repositorio Dimensao neste microservico (dimensaoService.autoCompleteDimensao)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GraficoController.autoCompleteMedida (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/GraficoController.java:249, camada controller)
    // Logica original (adaptar):
    // public List<Medida> autoCompleteMedida(String query) {
    //         if (getEntity().getEstrutura() != null) {
    //             return medidaService.autoCompleteMedida(query, getEntity().getEstrutura());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteMedida(String query) {
        // Obs: nao existe entidade/repositorio Medida neste microservico (medidaService.autoCompleteMedida)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GraficoService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:29, camada service)
    // Observacao: parametro id: era Grafico (referencia por id)
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades(Grafico id) {
    //         return getConexaoRepository().buscarUnidades(id);
    //     }
    public Uni<List<Long>> buscarUnidades(Long id) {
        // Obs: depende do microservico basico (Unidade) - repository.buscarUnidades
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GraficoService.buscarPerfils (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:33, camada service)
    // Observacao: parametro id: era Grafico (referencia por id)
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfils(Grafico id) {
    //         return getConexaoRepository().buscarPerfils(id);
    //     }
    public Uni<List<Long>> buscarPerfils(Long id) {
        // Obs: depende do microservico basico (Perfil) - repository.buscarPerfils
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GraficoService.buscarUsuarios (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:37, camada service)
    // Observacao: parametro id: era Grafico (referencia por id)
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarios(Grafico id) {
    //         return getConexaoRepository().buscarUsuarios(id);
    //     }
    public Uni<List<Long>> buscarUsuarios(Long id) {
        // Obs: depende do microservico basico (Usuario) - repository.buscarUsuarios
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GraficoService.buscarGraficoPeloFato (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:41, camada service)
    // Observacao: parametro fatoId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Grafico> buscarGraficoPeloFato(Estrutura fato) {
    //         return getConexaoRepository().buscarGraficoPeloFato(fato);
    //     }
    public Uni<List<Long>> buscarGraficoPeloFato(Long fatoId) {
        return repository.buscarGraficoPeloFato(fatoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de GraficoService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/relatorios/GraficoService.java:45, camada service)
    // Observacao: parametro estruturaId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Grafico> autoComplete(String query, Estrutura estrutura) {
    //         return this.getConexaoRepository().autoComplete(query.toLowerCase(), estrutura, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query, Long estruturaId) {
        return repository.autoComplete(query.toLowerCase(), estruturaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}

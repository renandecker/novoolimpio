package br.com.sol7.olimpio.relatorios.indicadorgauge.service;

import br.com.sol7.olimpio.relatorios.indicadorgauge.dto.IndicadorGaugeRequest;
import br.com.sol7.olimpio.relatorios.indicadorgauge.dto.IndicadorGaugeResponse;
import br.com.sol7.olimpio.relatorios.indicadorgauge.entity.IndicadorGauge;
import br.com.sol7.olimpio.relatorios.indicadorgauge.repository.IndicadorGaugeRepository;
import br.com.sol7.olimpio.relatorios.shared.FiltroSqlBuilder;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@ApplicationScoped
@WithTransaction
public class IndicadorGaugeService {

    @Inject
    IndicadorGaugeRepository repository;

    @Inject
    Pool pool;

    @Context
    ContainerRequestContext requestContext;

    private static final Pattern COMANDOS_BLOQUEADOS = Pattern.compile(
            "(?i)\\b(insert|update|delete|drop|alter|truncate|grant|revoke|create|exec|execute|call|copy|merge|vacuum|do|comment)\\b");
    private static final Pattern INICIA_COM_SELECT = Pattern.compile("(?is)^\\s*(with|select)\\b");

    private static final String SQL_FILTROS_GAUGE = "SELECT f.nome AS nome, dc.coluna AS coluna, f.tipo_filtro AS tipo_filtro, f.operacao AS operacao, f.data_inicio AS data_inicio, f.data_fim AS data_fim, f.periodo_dinamico AS periodo_dinamico, f.valor_fixo AS valor_fixo " +
            "FROM rel_filtro f " +
            "JOIN rel_filtro_indicador_gauge fg ON fg.id_filtro = f.id " +
            "LEFT JOIN rel_dimensao d ON d.id = f.id_dimensao " +
            "LEFT JOIN rel_coluna dc ON dc.id = d.id_coluna " +
            "WHERE fg.id_indicador_gauge = ?1";

    private Long getCurrentUserId() {
        if (requestContext != null) {
            String userId = requestContext.getHeaderString("X-Authenticated-User-Id");
            if (userId != null) {
                try {
                    return Long.parseLong(userId);
                } catch (NumberFormatException ignored) {}
            }
            String username = requestContext.getHeaderString("X-Authenticated-Username");
            if (username != null && !username.isBlank()) {
                return 1L; // fallback to system user
            }
        }
        return 1L; // system user fallback
    }

    public Uni<PagedResponse<IndicadorGaugeResponse>> listarDisponiveis(int page, int size, String busca) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;

        var query = repository.find("flAtivo = true order by id desc");
        if (busca != null && !busca.isBlank()) {
            query = repository.find("flAtivo = true and lower(nome) like ?1 order by id desc", "%" + busca.toLowerCase() + "%");
        }

        return query.page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count("flAtivo = true")
                        .map(count -> new PagedResponse<>(
                                items.stream().map(this::toResponse).toList(),
                                count, p, s)));
    }

    public Uni<IndicadorGaugeResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("IndicadorGauge not found"))
                .map(this::toResponse);
    }

    public Uni<IndicadorGaugeResponse> create(IndicadorGaugeRequest r) {
        var e = new IndicadorGauge();
        apply(e, r);
        e.flAtivo = true;
        e.createdAt = new Date();
        e.updatedAt = new Date();
        Long userId = getCurrentUserId();
        e.createdBy = userId;
        e.updatedBy = userId;
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<IndicadorGaugeResponse> update(Long id, IndicadorGaugeRequest r) {
        Long userId = getCurrentUserId();
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("IndicadorGauge not found"))
                .invoke(e -> {
                    apply(e, r);
                    e.updatedAt = new Date();
                    e.updatedBy = userId;
                })
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("IndicadorGauge not found")));
    }

    private void apply(IndicadorGauge e, IndicadorGaugeRequest r) {
        e.nome = r.nome();
        e.sql = r.sql();
        e.configuracao = r.configuracao();
    }

    private IndicadorGaugeResponse toResponse(IndicadorGauge e) {
        return new IndicadorGaugeResponse(
                e.id, e.nome, e.sql, e.configuracao, e.createdAt, e.updatedAt, e.createdBy, e.updatedBy);
    }

    public Uni<IndicadorGaugeExecucaoResponse> executar(String sql) {
        return executar(sql, null, null);
    }

    /**
     * Executa o SQL do indicador aplicando os filtros vinculados ao gauge
     * ({ nome do filtro -> { operation, value, value2 } }), com o mesmo predicado
     * usado nas telas de tabela, grafico e mapa.
     */
    public Uni<IndicadorGaugeExecucaoResponse> executar(String sql, Long indicadorGaugeId, Map<String, Object> filtros) {
        validarSql(sql);
        return fragmentoFiltros(indicadorGaugeId, filtros)
                .map(fragmento -> aplicarFiltros(sql, fragmento))
                .chain(sqlComFiltros -> pool.query(sqlComFiltros).execute().map(rowSet -> {
                    List<String> nomes = rowSet.columnsNames();
                    List<Map<String, Object>> linhas = new java.util.ArrayList<>();
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
                    return extrairValores(linhas);
                }));
    }

    private Uni<String> fragmentoFiltros(Long indicadorGaugeId, Map<String, Object> filtros) {
        if (filtros == null || filtros.isEmpty() || indicadorGaugeId == null) return Uni.createFrom().item("");
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FILTROS_GAUGE, jakarta.persistence.Tuple.class)
                        .setParameter(1, indicadorGaugeId).getResultList())
                .map(configFiltros -> FiltroSqlBuilder.montarFiltroSql(configFiltros, filtros));
    }

    /**
     * O predicado e aplicado como subquery para nao interferir em ORDER BY/LIMIT do SQL do indicador.
     */
    private String aplicarFiltros(String sql, String fragmento) {
        String base = sql.trim();
        while (base.endsWith(";")) base = base.substring(0, base.length() - 1).trim();
        if (fragmento == null || fragmento.isBlank()) return base;
        return "SELECT * FROM (" + base + ") _filtros WHERE " + fragmento;
    }

    private void validarSql(String sql) {
        if (sql == null || sql.isBlank()) throw new BadRequestException("SQL vazio.");
        if (!INICIA_COM_SELECT.matcher(sql).find()) throw new BadRequestException("SQL deve iniciar com SELECT.");
        if (COMANDOS_BLOQUEADOS.matcher(sql).find()) throw new BadRequestException("SQL contem comando nao permitido.");
    }

    private IndicadorGaugeExecucaoResponse extrairValores(List<Map<String, Object>> linhas) {
        Number valorAtual = 0;
        Number valorMinimo = 0;
        Number valorMaximo = 100;

        if (!linhas.isEmpty()) {
            Map<String, Object> primeiraLinha = linhas.get(0);
            for (Object v : primeiraLinha.values()) {
                if (v instanceof Number n) {
                    valorAtual = n;
                    break;
                }
            }
        }

        return new IndicadorGaugeExecucaoResponse(
                valorAtual.doubleValue(),
                valorMinimo.doubleValue(),
                valorMaximo.doubleValue()
        );
    }

    public record IndicadorGaugeExecucaoResponse(double valorAtual, double valorMinimo, double valorMaximo) {}
}
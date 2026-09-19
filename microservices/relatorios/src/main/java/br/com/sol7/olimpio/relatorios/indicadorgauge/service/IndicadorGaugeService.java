package br.com.sol7.olimpio.relatorios.indicadorgauge.service;

import br.com.sol7.olimpio.relatorios.indicadorgauge.dto.IndicadorGaugeRequest;
import br.com.sol7.olimpio.relatorios.indicadorgauge.dto.IndicadorGaugeResponse;
import br.com.sol7.olimpio.relatorios.indicadorgauge.entity.IndicadorGauge;
import br.com.sol7.olimpio.relatorios.indicadorgauge.repository.IndicadorGaugeRepository;
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

    private static final Pattern COMANDOS_BLOQUEADOS = Pattern.compile(
            "(?i)\\b(insert|update|delete|drop|alter|truncate|grant|revoke|create|exec|execute|call|copy|merge|vacuum|do|comment)\\b");
    private static final Pattern INICIA_COM_SELECT = Pattern.compile("(?is)^\\s*(with|select)\\b");

    public Uni<PagedResponse<IndicadorGaugeResponse>> listarDisponiveis(int page, int size, String busca) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;

        var query = repository.findAll(io.quarkus.panache.common.Sort.by("id").descending());
        if (busca != null && !busca.isBlank()) {
            query = repository.find("lower(nome) like ?1", "%" + busca.toLowerCase() + "%");
        }

        return query.page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
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
        e.createdAt = new Date();
        e.updatedAt = new Date();
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<IndicadorGaugeResponse> update(Long id, IndicadorGaugeRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("IndicadorGauge not found"))
                .invoke(e -> {
                    apply(e, r);
                    e.updatedAt = new Date();
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
                e.id, e.nome, e.sql, e.configuracao, e.createdAt, e.updatedAt);
    }

    public Uni<IndicadorGaugeExecucaoResponse> executar(String sql) {
        validarSql(sql);
        return pool.query(sql).execute().map(rowSet -> {
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
        });
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
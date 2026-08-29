package br.com.sol7.olimpio.relatorios.organograma;

import io.quarkus.cache.CacheInvalidate;
import io.quarkus.cache.CacheKey;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@ApplicationScoped
@WithTransaction
public class OrganogramaService {

    @Inject
    OrganogramaRepository repository;

    /** Pool reativo (Vert.x) usado só para executar, sob demanda e sem persistir nada, o SQL livre do organograma. */
    @Inject
    Pool pool;

    /**
     * Auto-injeção do proxy CDI do próprio bean. É necessária porque @CacheResult/@CacheInvalidate
     * são interceptors CDI: chamar dadosCacheado()/invalidarCacheMesAtual() diretamente (this.metodo(...))
     * de dentro da própria classe ("self-invocation") NÃO passa pelo proxy e o cache seria ignorado.
     * Chamando via "self" (o proxy injetado), o interceptor de cache passa a funcionar normalmente.
     */
    @Inject
    OrganogramaService self;

    public static final List<String> DIRECOES_VALIDAS = List.of("HORIZONTAL", "VERTICAL", "TOGGLE_REVERSE");
    private static final String DIRECAO_PADRAO = "VERTICAL";

    public Uni<List<OrganogramaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<OrganogramaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<OrganogramaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Organograma not found"))
                .map(this::toResponse);
    }

    public Uni<OrganogramaResponse> create(OrganogramaRequest r) {
        validarDirecao(r.direcao());
        var e = new Organograma();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<OrganogramaResponse> update(Long id, OrganogramaRequest r) {
        validarDirecao(r.direcao());
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Organograma not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse)
                .invoke(resp -> self.invalidarCacheMesAtual(id, mesReferenciaAtual()));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Organograma not found")))
                .invoke(() -> self.invalidarCacheMesAtual(id, mesReferenciaAtual()));
    }

    private void apply(Organograma e, OrganogramaRequest r) {
        e.nome = r.nome();
        e.direcao = (r.direcao() == null || r.direcao().isBlank()) ? DIRECAO_PADRAO : r.direcao().trim().toUpperCase(Locale.ROOT);
        e.sql = r.sql();
        e.dataCadastro = r.dataCadastro();
        e.dataAlteracao = r.dataAlteracao();
    }

    private OrganogramaResponse toResponse(Organograma e) {
        return new OrganogramaResponse(e.id, e.nome, e.direcao, e.sql, e.dataCadastro, e.dataAlteracao);
    }

    private void validarDirecao(String direcao) {
        if (direcao == null || direcao.isBlank()) return;
        if (!DIRECOES_VALIDAS.contains(direcao.trim().toUpperCase(Locale.ROOT))) {
            throw new BadRequestException("Direção inválida. Use HORIZONTAL, VERTICAL ou TOGGLE_REVERSE.");
        }
    }

    // =====================================================================================
    // Execução em tempo real do SQL cadastrado, montando os nós do AG Charts Org Chart.
    // Nada aqui é gravado no banco: o resultado (incluindo a cor por departamento) é
    // recalculado a cada chamada.
    // =====================================================================================

    /** Nomes de colunas potencialmente perigosos/reservados não são bloqueados aqui: o filtro é por comando SQL. */
    private static final Pattern COMANDOS_BLOQUEADOS = Pattern.compile(
            "(?i)\\b(insert|update|delete|drop|alter|truncate|grant|revoke|create|exec|execute|call|copy|merge|vacuum|do|comment)\\b");
    private static final Pattern INICIA_COM_SELECT = Pattern.compile("(?is)^\\s*(with|select)\\b");

    // Sinônimos aceitos (case-insensitive) para cada campo canônico do organograma.
    private static final Map<String, List<String>> SINONIMOS = Map.of(
            "id", List.of("id"),
            "parentId", List.of("parentid", "parent_id", "idpai", "id_pai"),
            "name", List.of("name", "nome"),
            "job", List.of("job", "cargo", "funcao", "função"),
            "department", List.of("department", "departamento", "setor"),
            "location", List.of("location", "local", "localizacao", "localização"),
            "status", List.of("status", "situacao", "situação"),
            "avatar", List.of("avatar", "foto", "imagem")
    );
    private static final List<String> ORDEM_CANONICA =
            List.of("id", "parentId", "name", "job", "department", "location", "status", "avatar");

    /** Nome do cache Quarkus/Caffeine configurado em application.properties. */
    private static final String CACHE_ORGANOGRAMA_DADOS = "organograma-dados";

    /**
     * Endpoint público: delega ao método cacheado incluindo o mês/ano corrente na chave do
     * cache, então o resultado é recalculado automaticamente uma vez por mês (na virada do
     * mês a chave muda e o SQL volta a ser executado). Um "expire-after-write" configurado em
     * application.properties (quarkus.cache.caffeine."organograma-dados".expire-after-write)
     * serve apenas de rede de segurança para não acumular memória indefinidamente.
     */
    public Uni<OrganogramaDadosResponse> dados(Long id) {
        return self.dadosCacheado(id, mesReferenciaAtual());
    }

    @CacheResult(cacheName = CACHE_ORGANOGRAMA_DADOS)
    Uni<OrganogramaDadosResponse> dadosCacheado(@CacheKey Long id, @CacheKey String mesReferencia) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Organograma not found"))
                .onItem().transformToUni(e -> {
                    validarSql(e.sql);
                    return pool.query(e.sql).execute().map(rowSet -> montarResposta(e, rowSet));
                });
    }

    /**
     * Invalida, no cache, o valor do mês corrente para o organograma informado (chamado ao
     * salvar/excluir o cadastro, para não deixar um SQL/direção antigos servidos até o fim do
     * mês). Meses anteriores não precisam ser invalidados: eles nunca mais são consultados,
     * pois a chave sempre usa o mês atual.
     */
    @CacheInvalidate(cacheName = CACHE_ORGANOGRAMA_DADOS)
    void invalidarCacheMesAtual(@CacheKey Long id, @CacheKey String mesReferencia) {
    }

    private String mesReferenciaAtual() {
        return YearMonth.now().toString(); // ex.: "2026-08"
    }

    private void validarSql(String sql) {
        if (sql == null || sql.isBlank()) throw new BadRequestException("SQL do organograma não cadastrado.");
        String semComentarios = sql.replaceAll("(?s)/\\*.*?\\*/", " ").replaceAll("--.*", " ").trim();
        if (semComentarios.contains(";")) throw new BadRequestException("SQL não pode conter múltiplos comandos (';').");
        if (!INICIA_COM_SELECT.matcher(semComentarios).find()) throw new BadRequestException("SQL deve iniciar com SELECT (ou WITH).");
        if (COMANDOS_BLOQUEADOS.matcher(semComentarios).find()) throw new BadRequestException("SQL contém comando não permitido para consultas de organograma.");
    }

    private OrganogramaDadosResponse montarResposta(Organograma e, RowSet<Row> rowSet) {
        List<String> colunas = rowSet.columnsNames();
        Map<String, String> colunaCanonicaPorOriginal = mapearColunas(colunas);

        List<Map<String, Object>> nos = new ArrayList<>();
        for (Row row : rowSet) {
            Map<String, Object> no = new LinkedHashMap<>();
            // Garante a presença de todas as chaves canônicas esperadas pelo AG Charts Org Chart.
            for (String canonica : ORDEM_CANONICA) no.put(canonica, null);
            for (String original : colunas) {
                Object valor = valorDaColuna(row, original);
                String canonica = colunaCanonicaPorOriginal.get(original);
                if (canonica != null) no.put(canonica, valor);
                else no.put(original, valor); // preserva colunas extras que o usuário tenha incluído no SQL
            }
            String departamento = texto(no.get("department"));
            no.put("cor", OrganogramaCores.corPara(departamento));
            nos.add(no);
        }
        return new OrganogramaDadosResponse(e.id, e.nome, e.direcao, colunas, nos);
    }

    private Map<String, String> mapearColunas(List<String> colunas) {
        Map<String, String> mapa = new LinkedHashMap<>();
        for (String original : colunas) {
            String chaveOriginal = original.toLowerCase(Locale.ROOT);
            for (var entrada : SINONIMOS.entrySet()) {
                if (entrada.getValue().contains(chaveOriginal)) {
                    mapa.put(original, entrada.getKey());
                    break;
                }
            }
        }
        return mapa;
    }

    private Object valorDaColuna(Row row, String nome) {
        Object valor = row.getValue(nome);
        // Tipos numéricos/monetários/datas do Vert.x SQL client já vêm como Number/String/LocalDate,
        // que o Jackson serializa naturalmente; convertidos para String apenas quando necessário
        // (ex.: java.util.UUID) para evitar problemas de serialização no JSON de retorno.
        if (valor != null && !(valor instanceof Number) && !(valor instanceof String) && !(valor instanceof Boolean)) {
            return String.valueOf(valor);
        }
        return valor;
    }

    private String texto(Object valor) {
        return valor == null ? "" : String.valueOf(valor).trim();
    }


    // Migrado de OrganogramaService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/relatorios/OrganogramaService.java:31, camada service)
    // Logica original (adaptar):
    // public List<Organograma> autoComplete(String query) {
    //         return this.getOrganogramaRepository().autoComplete(query.toLowerCase(), new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.find("(lower(nome) like '%' || ?1 || '%' OR  str(id) = ?1) order by nome", query.toLowerCase()).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OrganogramaService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/relatorios/OrganogramaService.java:35, camada service)
    // Observacao: parametro id: era Organograma (referencia por id)
    // JPQL original: select a.unidades from Organograma a where a = ?1
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades(Organograma id) {
    //         return getOrganogramaRepository().buscarUnidades(id);
    //     }
    public Uni<List<Long>> buscarUnidades(Long id) {
        // Obs: depende do microservico basico (Unidade) - repository.buscarUnidades
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de OrganogramaService.buscarPerfils (src/main/java/br/com/sol7/olimpio/service/services/relatorios/OrganogramaService.java:39, camada service)
    // Observacao: parametro id: era Organograma (referencia por id)
    // JPQL original: select a.perfils from Organograma a where a = ?1
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfils(Organograma id) {
    //         return getOrganogramaRepository().buscarPerfils(id);
    //     }
    public Uni<List<Long>> buscarPerfils(Long id) {
        // Obs: depende do microservico basico (Perfil) - repository.buscarPerfils
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de OrganogramaService.buscarUsuarios (src/main/java/br/com/sol7/olimpio/service/services/relatorios/OrganogramaService.java:43, camada service)
    // Observacao: parametro id: era Organograma (referencia por id)
    // JPQL original: select a.usuarios from Organograma a where a = ?1
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarios(Organograma id) {
    //         return getOrganogramaRepository().buscarUsuarios(id);
    //     }
    public Uni<List<Long>> buscarUsuarios(Long id) {
        // Obs: depende do microservico basico (Usuario) - repository.buscarUsuarios
        return Uni.createFrom().item(java.util.List.of());
    }

}

package br.com.sol7.olimpio.relatorios.tabela;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaResponse;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaRequest;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaExecutadaResponse;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaColunaRequest;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaColunaResponse;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaCampoResponse;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaOpcoesResponse;
import br.com.sol7.olimpio.relatorios.tabela.entity.TabelaColuna;
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

    private Uni<TabelaExecutadaResponse> executarSql(Object[] estrutura, List<?> configuracoes, int page, int size) {
        if (configuracoes.isEmpty()) return Uni.createFrom().item(new TabelaExecutadaResponse(List.of(), List.of()));
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

        String mainSql = sql.toString();
        String whereClause = condicao.isBlank() ? "" : condicao;
        String countSql = "SELECT count(*) FROM (SELECT 1 " + origem + whereClause + ") _cnt";

        int offset = page * size;
        String paginatedSql = mainSql + " LIMIT " + size + " OFFSET " + offset;

        Uni<Long> countUni = Panache.getSession()
                .chain(session -> session.createNativeQuery(countSql).getSingleResultOrNull())
                .map(result -> result == null ? 0L : ((Number) result).longValue());

        Uni<List<Object>> dataUni = Panache.getSession()
                .chain(session -> session.createNativeQuery(paginatedSql).getResultList());

        return countUni.chain(totalCount -> dataUni.map(resultado -> {
            int totalPages = (int) Math.ceil((double) totalCount / Math.max(1, size));
            return new TabelaExecutadaResponse(cabecalhos, converterLinhas(resultado, cabecalhos), totalCount, page, size, totalPages);
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

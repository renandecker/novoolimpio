package br.com.sol7.olimpio.comercial.gerarpacote;

import br.com.sol7.olimpio.comercial.acao.AcaoRepository;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
@WithTransaction
public class GerarPacoteService {
    @Inject
    GerarPacoteRepository repository;

    @Inject
    AcaoRepository acaoRepository;

    public Uni<List<GerarPacoteResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GerarPacoteResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<GerarPacoteResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GerarPacote not found")).map(this::toResponse);
    }

    public Uni<GerarPacoteResponse> create(GerarPacoteRequest r) {
        var e = new GerarPacote();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GerarPacoteResponse> update(Long id, GerarPacoteRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GerarPacote not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("GerarPacote not found")));
    }

    private void apply(GerarPacote e, GerarPacoteRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private GerarPacoteResponse toResponse(GerarPacote e) {
        return new GerarPacoteResponse(e.id, e.nome, e.dadosJson);
    }

    private List<Map<String, Object>> toMapList(List<?> rows, List<String> cols) {
        List<Map<String, Object>> out = new ArrayList<>();
        if (rows == null) return out;
        for (Object row : rows) {
            Map<String, Object> m = new HashMap<>();
            if (row instanceof Object[] arr) {
                for (int i = 0; i < cols.size() && i < arr.length; i++) {
                    m.put(cols.get(i), arr[i]);
                }
            } else if (row != null && !cols.isEmpty()) {
                m.put(cols.get(0), row);
            }
            out.add(m);
        }
        return out;
    }

    // Migrado de GerarPacoteController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:197, camada controller)
    // Observacao: retorno: era Set<Acao> no legado
    // Logica original (adaptar):
    // public Set<Acao> autoComplete(String query) {
    //         return acaoService.autoComplete(query);
    //     }
    // Obs: autocomplete de UI; retorno original era Set<Acao>, incompativel com a assinatura
    // Implementacao: retorna IDs de acoes que correspondem a query (requer modulo Acao)
    public Uni<List<Long>> autoComplete(String query) {
        return acaoRepository.autoComplete(query)
                .map(list -> list.stream().map(a -> a.id).toList());
    }


    // Migrado de GerarPacoteController.autoCompleteUnidade (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:201, camada controller)
    // Logica original (adaptar):
    // public List<Acao> autoCompleteUnidade() {
    //         listaAcao = acaoService.acaoUnidade(usuarioLogadoController.getUnidadesDisponiveis());
    //         return listaAcao;
    //     }
    public Uni<List<Long>> autoCompleteUnidade() {
        // Obs: depende do contexto de usuario logado (unidades disponiveis)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GerarPacoteController.carregarCampos (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:260, camada controller)
    // Logica original (adaptar):
    // public void carregarCampos() {
    //         List<Prospecto> prospectosTemp = new ArrayList<>();
    //         for (Prospecto prospecto : prospectos) {
    //             prospecto = prospectoService.carregarProspectoComCampos(prospecto.getId());
    //             prospectosTemp.add(prospecto);
    //         }
    //         prospectos = prospectosTemp;
    //     }
    // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
    // Implementacao: carrega campos dos prospectos selecionados (requer modulo Prospecto)
    public Uni<List<Map<String, Object>>> carregarCampos(List<Long> prospectoIds) {
        if (prospectoIds == null || prospectoIds.isEmpty()) {
            return Uni.createFrom().item(java.util.List.of());
        }
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
                .chain(session -> {
                    var allResults = new ArrayList<Map<String, Object>>();
                    var futures = prospectoIds.stream()
                            .map(id -> session.createNativeQuery(sql)
                                    .setParameter("id", id)
                                    .getResultList()
                                    .map(rows -> toMapList(rows, List.of("campo_id", "rotulo", "tipo", "categoria", "valor"))))
                            .toList();
                    return io.smallrye.mutiny.Uni.combine().all().unis(futures)
                            .combinedWith(results -> {
                                for (Object result : results) {
                                    if (result instanceof List<?> list) {
                                        @SuppressWarnings("unchecked")
                                        List<Map<String, Object>> mapList = (List<Map<String, Object>>) list;
                                        allResults.addAll(mapList);
                                    }
                                }
                                return allResults;
                            });
                });
    }


// Migrado de GerarPacoteController.carregarOperacoes (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:341, camada controller)
    // Logica original (adaptar):
    // public void carregarOperacoes() {
    //         listOperation = new ArrayList<>();
    //         listOperation.add(QueryOperation.EQ);
    //         listOperation.add(QueryOperation.NOT_EQUAL);
    //
    //         if (!ObjectUtil.nullOrEmpty(filtroPacoteAtual.getCampo())) {
    //             switch (filtroPacoteAtual.getCampo().getTipo()) {
    //                 case DATA:
    //                     listOperation.add(QueryOperation.GREATER_THAN);
    //                     listOperation.add(QueryOperation.GREATER_THAN_OR_EQUAL);
    //                     listOperation.add(QueryOperation.LESS_THAN);
    //                     listOperation.add(QueryOperation.LESS_THAN_OR_EQUAL);
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (JSF), sem logica de dados portaavel
    // Implementacao: retorna operacoes disponiveis para um tipo de campo
    public Uni<List<String>> carregarOperacoes(String tipoCampo) {
        // Retorna operacoes basicas baseadas no tipo de campo
        if ("DATA".equalsIgnoreCase(tipoCampo)) {
            return Uni.createFrom().item(List.of("EQ", "NOT_EQUAL", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL", "BETWEEN"));
        }
        return Uni.createFrom().item(List.of("EQ", "NOT_EQUAL"));
    }


    // Migrado de GerarPacoteController.autoCompleteComponente (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:377, camada controller)
    // Logica original (adaptar):
    // public List<ComponenteCurricular> autoCompleteComponente(String query) {
    //         if (filtroAcademico.getCurriculo() != null) {
    //             return matrizCurricularService.buscarComponenteComCurriculo(query, filtroAcademico.getCurriculo());
    //         }
    //         return componenteCurricularService.autocomplete(query);
    //     }
    public Uni<List<Long>> autoCompleteComponente(String query) {
        // Obs: depende do microservico educacao (MatrizCurricular/ComponenteCurricular)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GerarPacoteController.autoCompleteCurriculo (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:384, camada controller)
    // Logica original (adaptar):
    // public List<Curriculo> autoCompleteCurriculo(String query) {
    //         if (query.equals("")) {
    //             return curriculoService.cursoComUnidades(usuarioLogadoController.getUnidadesDisponiveis());
    //         }
    //         return curriculoService.autoCompleteComUnidades(query, usuarioLogadoController.getUnidadesDisponiveis());
    //     }
    public Uni<List<Long>> autoCompleteCurriculo(String query) {
        // Obs: depende do microservico educacao (Curriculo) e do contexto de usuario logado
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GerarPacoteController.carregarOperacoe (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:391, camada controller)
    // Logica original (adaptar):
    // public void carregarOperacoe(){
    //         listOperationAcademico = new ArrayList<>();
    //         listOperationAcademico.add(QueryOperation.EQ);
    //         listOperationAcademico.add(QueryOperation.NOT_EQUAL);
    //         listOperationAcademico.add(QueryOperation.GREATER_THAN);
    //         listOperationAcademico.add(QueryOperation.GREATER_THAN_OR_EQUAL);
    //         listOperationAcademico.add(QueryOperation.LESS_THAN);
    //         listOperationAcademico.add(QueryOperation.LESS_THAN_OR_EQUAL);
    //         listOperationAcademico.add(QueryOperation.BETWEEN);
    //     }
    // Obs: metodo de UI (JSF), sem logica de dados portaavel
    // Implementacao: retorna operacoes academicas disponiveis
    public Uni<List<String>> carregarOperacoe() {
        return Uni.createFrom().item(List.of("EQ", "NOT_EQUAL", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL", "BETWEEN"));
    }


    // Migrado de GerarPacoteController.carregarOperacoesLigacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:402, camada controller)
    // Logica original (adaptar):
    // public void carregarOperacoesLigacao() {
    //         carregarOperacoe();
    //     }
    // Obs: metodo de UI (JSF), sem logica de dados portaavel
    // Implementacao: delega para carregarOperacoe
    public Uni<List<String>> carregarOperacoesLigacao() {
        return carregarOperacoe();
    }


    // Migrado de GerarPacoteController.carregarOperacoesAcademico (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:406, camada controller)
    // Logica original (adaptar):
    // public void carregarOperacoesAcademico() {
    //         if (filtroAcademico.getTipoFiltro() == 4 || filtroAcademico.getTipoFiltro() == 5 || filtroAcademico.getTipoFiltro() == 6) {
    //             carregarOperacoe();
    //         }
    //         if (filtroAcademico.getTipoFiltro() == 1 || filtroAcademico.getTipoFiltro() == 2 || filtroAcademico.getTipoFiltro() == 3 ||
    //                 filtroAcademico.getTipoFiltro() == 7 || filtroAcademico.getTipoFiltro() == 8) {
    //             listOperationAcademico = new ArrayList<>();
    //             listOperationAcademico.add(QueryOperation.EQ);
    //             listOperationAcademico.add(QueryOperation.NOT_EQUAL);
    //         }
    //     }
    // Obs: metodo de UI (JSF), sem logica de dados portaavel
    // Implementacao: retorna operacoes academicas baseadas no tipo de filtro
    public Uni<List<String>> carregarOperacoesAcademico(Integer tipoFiltro) {
        if (tipoFiltro != null && (tipoFiltro == 4 || tipoFiltro == 5 || tipoFiltro == 6)) {
            return carregarOperacoe();
        }
        return Uni.createFrom().item(List.of("EQ", "NOT_EQUAL"));
    }


    // Migrado de GerarPacoteController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:430, camada controller)
    // Observacao: parametro entityId: era Prospecto (referencia por id)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao(Prospecto entity) {
    //         dynaFormModelAtual = new DynaFormModel();
    //         ProspectoUtil.carregarProspectoParaVisualizacao(prospectoService.buscaProspectoComCampos(entity.getId()), getDynaFormModelAtual());
    //     }
    // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
    // Implementacao: carrega prospecto para visualizacao (requer modulo Prospecto)
    public Uni<List<Map<String, Object>>> carregarProspectoParaVisualizacao(Long entityId) {
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
                        .setParameter("id", entityId)
                        .getResultList())
                .map(rows -> toMapList(rows, List.of("campo_id", "rotulo", "tipo", "categoria", "valor")));
    }

}
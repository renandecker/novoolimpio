package br.com.sol7.olimpio.comercial.gerarpacote;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class GerarPacoteService { @Inject GerarPacoteRepository repository; public Uni<List<GerarPacoteResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<GerarPacoteResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<GerarPacoteResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerarPacote not found")).map(this::toResponse);} public Uni<GerarPacoteResponse> create(GerarPacoteRequest r){var e=new GerarPacote();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<GerarPacoteResponse> update(Long id,GerarPacoteRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerarPacote not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("GerarPacote not found")));} private void apply(GerarPacote e,GerarPacoteRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private GerarPacoteResponse toResponse(GerarPacote e){return new GerarPacoteResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de GerarPacoteController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:197, camada controller)
    // Observacao: retorno: era Set<Acao> no legado
    // Logica original (adaptar):
    // public Set<Acao> autoComplete(String query) {
    //         return acaoService.autoComplete(query);
    //     }
    public Uni<String> autoComplete(String query) {
        // Obs: autocomplete de UI; retorno original era Set<Acao>, incompativel com a assinatura Uni<String>
        return Uni.createFrom().item(null);
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
    public Uni<Void> carregarCampos() {
        // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
        return Uni.createFrom().voidItem();
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
    public Uni<Void> carregarOperacoes() {
        // Obs: metodo de UI (JSF), sem logica de dados portaavel
        return Uni.createFrom().voidItem();
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
    public Uni<Void> carregarOperacoe() {
        // Obs: metodo de UI (JSF), sem logica de dados portaavel
        return Uni.createFrom().voidItem();
    }


    // Migrado de GerarPacoteController.carregarOperacoesLigacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:402, camada controller)
    // Logica original (adaptar):
    // public void carregarOperacoesLigacao() {
    //         carregarOperacoe();
    //     }
    public Uni<Void> carregarOperacoesLigacao() {
        // Obs: metodo de UI (JSF), sem logica de dados portaavel
        return Uni.createFrom().voidItem();
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
    public Uni<Void> carregarOperacoesAcademico() {
        // Obs: metodo de UI (JSF), sem logica de dados portaavel
        return Uni.createFrom().voidItem();
    }


    // Migrado de GerarPacoteController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/GerarPacoteController.java:430, camada controller)
    // Observacao: parametro entityId: era Prospecto (referencia por id)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao(Prospecto entity) {
    //         dynaFormModelAtual = new DynaFormModel();
    //         ProspectoUtil.carregarProspectoParaVisualizacao(prospectoService.buscaProspectoComCampos(entity.getId()), getDynaFormModelAtual());
    //     }
    public Uni<Void> carregarProspectoParaVisualizacao(Long entityId) {
        // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
        return Uni.createFrom().voidItem();
    }

}
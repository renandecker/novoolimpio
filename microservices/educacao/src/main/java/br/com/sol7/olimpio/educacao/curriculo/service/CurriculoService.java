package br.com.sol7.olimpio.educacao.curriculo;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class CurriculoService {

    @Inject
    CurriculoRepository repository;

    public Uni<List<CurriculoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CurriculoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CurriculoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Curriculo not found"))
                .map(this::toResponse);
    }

    public Uni<CurriculoResponse> create(CurriculoRequest r) {
        var e = new Curriculo();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CurriculoResponse> update(Long id, CurriculoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Curriculo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Curriculo not found")));
    }

    private void apply(Curriculo e, CurriculoRequest r) {
        e.cursoId = r.cursoId();
        e.descricao = r.descricao();
        e.tipoCursoId = r.tipoCursoId();
        e.sucinto = r.sucinto();
        e.descricaoDiploma = r.descricaoDiploma();
        e.sigla = r.sigla();
        e.cargaHoraria = r.cargaHoraria();
        e.qtdeIniciando = r.qtdeIniciando();
        e.qtdeFinalizando = r.qtdeFinalizando();
        e.numeroParecer = r.numeroParecer();
        e.licenca = r.licenca();
        e.reconhecimento = r.reconhecimento();
        e.qtdMaximaAlunos = r.qtdMaximaAlunos();
        e.tipoModeloContrato = r.tipoModeloContrato();
        e.tipoModeloBoletim = r.tipoModeloBoletim();
        e.tipoModeloCertificado = r.tipoModeloCertificado();
        e.tipoModeloPromissoria = r.tipoModeloPromissoria();
        e.escolaridadeId = r.escolaridadeId();
        e.idadeMinima = r.idadeMinima();
        e.idadeMaxima = r.idadeMaxima();
        e.dataCancelamento = r.dataCancelamento();
        e.templateContrato = r.templateContrato();
        e.templateCertificado = r.templateCertificado();
        e.templateBoletim = r.templateBoletim();
        e.templatePromissoria = r.templatePromissoria();
        e.grauId = r.grauId();
        e.possuiRematricula = r.possuiRematricula();
    }

    private CurriculoResponse toResponse(Curriculo e) {
        return new CurriculoResponse(e.id, e.cursoId, e.descricao, e.tipoCursoId, e.sucinto, e.descricaoDiploma, e.sigla, e.cargaHoraria, e.qtdeIniciando, e.qtdeFinalizando, e.numeroParecer, e.licenca, e.reconhecimento, e.qtdMaximaAlunos, e.tipoModeloContrato, e.tipoModeloBoletim, e.tipoModeloCertificado, e.tipoModeloPromissoria, e.escolaridadeId, e.idadeMinima, e.idadeMaxima, e.dataCancelamento, e.templateContrato, e.templateCertificado, e.templateBoletim, e.templatePromissoria, e.grauId, e.possuiRematricula);
    }


    // Migrado de CurriculoController.autoCompleteUnidadeComGrupo (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/CurriculoController.java:316, camada controller)
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteUnidadeComGrupo(String query) {
    //         if (unidadeGrupoComponenteReplicarWrapper.getGrupo() == null) {
    //             if (query.equals("") && (usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN) || usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ESTRATEGICO))) {
    //                 return unidadeService.autoCompleteAll();
    //             }
    //             if (!query.equals("") && (usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN) || usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ESTRATEGICO))) {
    //                 return unidadeService.autoComplete(quer ...
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteUnidadeComGrupo(String query) {
        // Obs: depende do microservico basico (Unidade, hierarquia do usuario logado) e do estado da tela (unidadeGrupoComponenteReplicarWrapper)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CurriculoController.autoCompleteGrupo (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/CurriculoController.java:348, camada controller)
    // Logica original (adaptar):
    // public List<Grupo> autoCompleteGrupo(String query) {
    //         if (query.equals("")) {
    //             return grupoService.grupoCurriculo(getEntity());
    //         }
    //         return grupoService.autoCompleteComCurriculo(query.toLowerCase(), getEntity());
    //     }
    public Uni<List<Long>> autoCompleteGrupo(String query) {
        // Obs: depende do estado da tela (getEntity/curriculo selecionado) e do grupoService
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CurriculoController.autocompleteGrupoUnidade (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/CurriculoController.java:355, camada controller)
    // Logica original (adaptar):
    // public List<ComponenteCurricular> autocompleteGrupoUnidade(String query) {
    //         if (getEntity() != null && unidadeGrupoComponenteReplicarWrapper.getGrupo() == null && !query.equals("")) {
    //             return oferecimentoComponenteCurricularService.autocompleteComCurriculoComQuery(query, unidadeGrupoComponenteReplicarWrapper.getGrupo(), getEntity());
    //         }
    //         if (getEntity() != null && unidadeGrupoComponenteReplicarWrapper.getGrupo() == null && query.equals("")) {
    //             return oferecimentoComponenteCurricularService.autocompleteComCurriculoSemQuery(unidadeGrupoComponenteReplicarWrapper.getGrupo(), getEntity());
    //         }
    //         if (getEntity() != null && unidadeGrupoComponen ...
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autocompleteGrupoUnidade(String query) {
        // Obs: depende do estado da tela (getEntity/unidadeGrupoComponenteReplicarWrapper) e do oferecimentoComponenteCurricularService
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<List<Long>> autoComplete(String query) {
        if (query.equals("")) {
            // Obs: condicao removida (depende de outro microservico): curriculo.unidades in (unidadesDisponiveis do usuario logado)
            return repository.find("(dataCancelamento > current_date or dataCancelamento is null)").page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<CurriculoResponse>> autoCompleteFull(String query) {
        if (query == null || query.isEmpty()) {
            return repository.find("(dataCancelamento > current_date or dataCancelamento is null)").page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(this::toResponse).toList());
        }
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(this::toResponse).toList());
    }



    public Uni<List<Long>> autoCompleteProduto(String query) {
        String q = query == null ? "" : query.toLowerCase();
        return repository.autoComplete(q).map(list -> list.stream().map(x -> x.id).toList());
    }


    public Uni<List<Long>> autoCompleteSubCategoria(String query) {
        String q = query == null ? "" : query.toLowerCase();
        return repository.autoComplete(q).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarCursoComUnidades(Long entityId) {
        return repository.buscarCursoComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> buscarCursoComMatrizCurriculares(Long entityId) {
        return repository.buscarCursoComMatrizCurriculares(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> autoCompleteComUnidades(String query, List<Long> unidades) {
        return repository.autoCompleteComUnidades(query.toLowerCase().trim(), unidades).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComUnidadesrematricula(String query, List<Long> unidades, Long pessoaId) {
        return repository.autoCompleteComUnidadesrematricula(query.toLowerCase().trim(), unidades, pessoaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComUnidade(String query, Long unidadeId) {
        return repository.autoCompleteComUnidade(query.toLowerCase().trim(), unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComUnidades2(List<Long> unidades) {
        return repository.unidadesCurso(unidades).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarCursosDaUnidade(Long unidadeId) {
        return repository.buscarCursosDaUnidade(unidadeId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarCurriculoPorUnidades(List<Long> unidade) {
        return repository.buscarCurriculoPorUnidades(unidade).map(list -> list.stream().map(x -> x.id).toList());
    }

}


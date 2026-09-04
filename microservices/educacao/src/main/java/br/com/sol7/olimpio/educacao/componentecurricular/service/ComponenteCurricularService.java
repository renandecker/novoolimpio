package br.com.sol7.olimpio.educacao.componentecurricular;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ComponenteCurricularService {

    @Inject
    ComponenteCurricularRepository repository;

    public Uni<List<ComponenteCurricularResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ComponenteCurricularResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ComponenteCurricularResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ComponenteCurricular not found"))
                .map(this::toResponse);
    }

    public Uni<ComponenteCurricularResponse> create(ComponenteCurricularRequest r) {
        var e = new ComponenteCurricular();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ComponenteCurricularResponse> update(Long id, ComponenteCurricularRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ComponenteCurricular not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ComponenteCurricular not found")));
    }

    private void apply(ComponenteCurricular e, ComponenteCurricularRequest r) {
        e.descricao = r.descricao();
        e.sucinto = r.sucinto();
        e.ementa = r.ementa();
        e.cargaHoraria = r.cargaHoraria();
        e.qtdeCoringa = r.qtdeCoringa();
        e.creditos = r.creditos();
        e.tipoSalaId = r.tipoSalaId();
        e.habilidadeCompetencia = r.habilidadeCompetencia();
        e.baseTecnologica = r.baseTecnologica();
    }

    private ComponenteCurricularResponse toResponse(ComponenteCurricular e) {
        return new ComponenteCurricularResponse(e.id, e.descricao, e.sucinto, e.ementa, e.cargaHoraria, e.qtdeCoringa, e.creditos, e.tipoSalaId, e.habilidadeCompetencia, e.baseTecnologica);
    }


    // Migrado de ComponenteCurricularController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ComponenteCurricularController.java:351, camada controller)
    // Logica original (adaptar):
    // public List<ComponenteCurricular> autoComplete(String query) {
    //         return componenteCurricularService.autocomplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return autocomplete(query);
    }


    // Migrado de ComponenteCurricularService.autocomplete (src/main/java/br/com/sol7/olimpio/service/services/educacao/ComponenteCurricularService.java:28, camada service)
    // JPQL original: select c from ComponenteCurricular c where lower(c.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1 or lower(c.sucinto) like '%' || ?1 || '%' order by c.descricao
    // Logica original (adaptar):
    // public List<ComponenteCurricular> autocomplete(String query) {
    //         return getComponenteCurricularRepository().autocomplete(query, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autocomplete(String query) {
        return repository.autocomplete(query).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComponenteCurricularService.autocompleteComponenteAtivoProfessor (src/main/java/br/com/sol7/olimpio/service/services/educacao/ComponenteCurricularService.java:32, camada service)
    // JPQL original: select distinct ofc from OcorrenciaComponenteCurricular occ inner join  occ.oferecimentoComponenteCurricular ofc inner join ofc.componenteCurricular c where (lower(c.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1 or lower(c.sucinto) like '%' || ?1 || '%')  and occ.ativo = true AND occ.professor.pessoa = ?2 AND ofc.status = 'EM_ANDAMENTO' order by ofc.id
    // Logica original (adaptar):
    // public List<OferecimentoComponenteCurricular> autocompleteComponenteAtivoProfessor(String query) {
    //         return getComponenteCurricularRepository().autocompleteComponenteAtivoProfessor(query.toLowerCase(), usuarioLogadoController.getUsuario().getPessoa(), new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autocompleteComponenteAtivoProfessor(String query) {
        // Obs: condicao removida (depende do usuario logado): occ.professor.pessoa = ?2 (pessoa do professor logado)
        return repository.autocompleteComponenteAtivo(query).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComponenteCurricularService.autocompleteComponenteAtivo (src/main/java/br/com/sol7/olimpio/service/services/educacao/ComponenteCurricularService.java:36, camada service)
    // JPQL original: select distinct ofc from OcorrenciaComponenteCurricular occ inner join  occ.oferecimentoComponenteCurricular ofc inner join ofc.componenteCurricular c where (lower(c.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1 or lower(c.sucinto) like '%' || ?1 || '%') AND ofc.status = 'EM_ANDAMENTO' and occ.ativo = true order by ofc.id
    // Logica original (adaptar):
    // public List<OferecimentoComponenteCurricular> autocompleteComponenteAtivo(String query) {
    //         return getComponenteCurricularRepository().autocompleteComponenteAtivo(query, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autocompleteComponenteAtivo(String query) {
        return repository.autocompleteComponenteAtivo(query).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComponenteCurricularService.buscarComponenteCurricularComBaseTecnologica (src/main/java/br/com/sol7/olimpio/service/services/educacao/ComponenteCurricularService.java:44, camada service)
    // Observacao: retorno: era ComponenteCurricular (referencia por id); parametro entityId: era ComponenteCurricular (referencia por id)
    // JPQL original: Select cc from ComponenteCurricular cc left join fetch cc.baseTecnologicas where cc = ?1
    // Logica original (adaptar):
    // public ComponenteCurricular buscarComponenteCurricularComBaseTecnologica(ComponenteCurricular entity) {
    //         return getComponenteCurricularRepository().buscarComponenteCurricularComBaseTecnologica(entity);
    //     }
    public Uni<Long> buscarComponenteCurricularComBaseTecnologica(Long entityId) {
        return repository.buscarComponenteCurricularComBaseTecnologica(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ComponenteCurricularService.buscarComponenteCurricularComReferenciaBibliografica (src/main/java/br/com/sol7/olimpio/service/services/educacao/ComponenteCurricularService.java:48, camada service)
    // Observacao: retorno: era ComponenteCurricular (referencia por id); parametro entityId: era ComponenteCurricular (referencia por id)
    // JPQL original: Select cc from ComponenteCurricular cc left join fetch cc.referenciaBibliograficas where cc = ?1
    // Logica original (adaptar):
    // public ComponenteCurricular buscarComponenteCurricularComReferenciaBibliografica(ComponenteCurricular entity) {
    //         return getComponenteCurricularRepository().buscarComponenteCurricularComReferenciaBibliografica(entity);
    //     }
    public Uni<Long> buscarComponenteCurricularComReferenciaBibliografica(Long entityId) {
        return repository.buscarComponenteCurricularComReferenciaBibliografica(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ComponenteCurricularService.buscarComponenteCurricularComCronograma (src/main/java/br/com/sol7/olimpio/service/services/educacao/ComponenteCurricularService.java:52, camada service)
    // Observacao: retorno: era ComponenteCurricular (referencia por id); parametro entityId: era ComponenteCurricular (referencia por id)
    // JPQL original: Select cc from ComponenteCurricular cc join fetch cc.cronogramaComponenteCurriculares where cc = ?1
    // Logica original (adaptar):
    // public ComponenteCurricular buscarComponenteCurricularComCronograma(ComponenteCurricular entity) {
    //         return getComponenteCurricularRepository().buscarComponenteCurricularComCronograma(entity);
    //     }
    public Uni<Long> buscarComponenteCurricularComCronograma(Long entityId) {
        return repository.buscarComponenteCurricularComCronograma(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ComponenteCurricularService.buscarExistenciaEmOferecimento (src/main/java/br/com/sol7/olimpio/service/services/educacao/ComponenteCurricularService.java:56, camada service)
    // Observacao: parametro entityId: era ComponenteCurricular (referencia por id)
    // JPQL original: Select cc from OferecimentoComponenteCurricular o inner join o.componenteCurricular cc where cc = ?1
    // Logica original (adaptar):
    // public List<ComponenteCurricular> buscarExistenciaEmOferecimento(ComponenteCurricular entity) {
    //         return getComponenteCurricularRepository().buscarExistenciaEmOferecimento(entity);
    //     }
    public Uni<List<Long>> buscarExistenciaEmOferecimento(Long entityId) {
        return repository.buscarExistenciaEmOferecimento(entityId).map(list -> list.stream().map(x -> x.id).toList());
    }

}


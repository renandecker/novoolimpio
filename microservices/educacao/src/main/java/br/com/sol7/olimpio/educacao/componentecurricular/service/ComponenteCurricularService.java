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

    public Uni<List<Long>> autoComplete(String query) {
        return autocomplete(query);
    }

    public Uni<List<Long>> autocomplete(String query) {
        return repository.autocomplete(query).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autocompleteComponenteAtivoProfessor(String query) {
        // Obs: condicao removida (depende do usuario logado): occ.professor.pessoa = ?2 (pessoa do professor logado)
        return repository.autocompleteComponenteAtivo(query).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autocompleteComponenteAtivo(String query) {
        return repository.autocompleteComponenteAtivo(query).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarComponenteCurricularComBaseTecnologica(Long entityId) {
        return repository.buscarComponenteCurricularComBaseTecnologica(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> buscarComponenteCurricularComReferenciaBibliografica(Long entityId) {
        return repository.buscarComponenteCurricularComReferenciaBibliografica(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> buscarComponenteCurricularComCronograma(Long entityId) {
        return repository.buscarComponenteCurricularComCronograma(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarExistenciaEmOferecimento(Long entityId) {
        return repository.buscarExistenciaEmOferecimento(entityId).map(list -> list.stream().map(x -> x.id).toList());
    }

}


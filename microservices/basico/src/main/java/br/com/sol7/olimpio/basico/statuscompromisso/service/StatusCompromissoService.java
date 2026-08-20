package br.com.sol7.olimpio.basico.statuscompromisso.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.statuscompromisso.dto.StatusCompromissoRequest;
import br.com.sol7.olimpio.basico.statuscompromisso.dto.StatusCompromissoResponse;
import br.com.sol7.olimpio.basico.statuscompromisso.entity.StatusCompromisso;
import br.com.sol7.olimpio.basico.statuscompromisso.repository.StatusCompromissoRepository;

@ApplicationScoped
@WithTransaction
public class StatusCompromissoService {

    @Inject
    StatusCompromissoRepository repository;

    public Uni<List<StatusCompromissoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<StatusCompromissoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<StatusCompromissoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("StatusCompromisso not found"))
                .map(this::toResponse);
    }

    public Uni<StatusCompromissoResponse> create(StatusCompromissoRequest r) {
        var e = new StatusCompromisso();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<StatusCompromissoResponse> update(Long id, StatusCompromissoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("StatusCompromisso not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("StatusCompromisso not found")));
    }

    private void apply(StatusCompromisso e, StatusCompromissoRequest r) {
        e.descricao = r.descricao();
        e.cor = r.cor();
        e.ativo = r.ativo();
        e.alguem = r.alguem();
        e.trocaautomatomatica = r.trocaautomatomatica();
        e.dias = r.dias();
        e.perfilId = r.perfilId();
        e.descricaoPessoa = r.descricaoPessoa();
        e.qtdeUsuario = r.qtdeUsuario();
        e.proxStatusCompromissoId = r.proxStatusCompromissoId();
        e.statusCompromissoTrocaAutoId = r.statusCompromissoTrocaAutoId();
    }

    private StatusCompromissoResponse toResponse(StatusCompromisso e) {
        return new StatusCompromissoResponse(e.id, e.descricao, e.cor, e.ativo, e.alguem, e.trocaautomatomatica, e.dias, e.perfilId, e.descricaoPessoa, e.qtdeUsuario, e.proxStatusCompromissoId, e.statusCompromissoTrocaAutoId);
    }


    // Migrado de StatusCompromissoController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/StatusCompromissoController.java:119, camada controller)
    // Logica original (adaptar):
    // public List<StatusCompromisso> autoComplete(String query) {
    //         if (ObjectUtil.nullOrEmpty(query)) {
    //             return listAll();
    //         }
    //         return statusCompromissoService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        if (query == null || query.isBlank()) {
            return repository.listAll().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de StatusCompromissoService.buscarStatusComModulo (src/main/java/br/com/sol7/olimpio/service/services/basico/StatusCompromissoService.java:21, camada service)
    // Observacao: retorno: era StatusCompromisso (referencia por id)
    // JPQL original: Select a from StatusCompromisso a left join fetch a.statusModulos where a.id = ?1
    // Logica original (adaptar):
    // public StatusCompromisso buscarStatusComModulo(Integer id) {
    //         return getStatusCompromissoRepository().buscarStatusComModulo(id);
    //     }
    public Uni<Long> buscarStatusComModulo(Integer id) {
        return repository.buscarStatusComModulo(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

}

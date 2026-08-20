package br.com.sol7.olimpio.basico.estadocivil.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.estadocivil.dto.EstadoCivilRequest;
import br.com.sol7.olimpio.basico.estadocivil.dto.EstadoCivilResponse;
import br.com.sol7.olimpio.basico.estadocivil.entity.EstadoCivil;
import br.com.sol7.olimpio.basico.estadocivil.repository.EstadoCivilRepository;

@ApplicationScoped
@WithTransaction
public class EstadoCivilService {

    @Inject
    EstadoCivilRepository repository;

    public Uni<List<EstadoCivilResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EstadoCivilResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<EstadoCivilResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("EstadoCivil not found"))
                .map(this::toResponse);
    }

    public Uni<EstadoCivilResponse> create(EstadoCivilRequest r) {
        var e = new EstadoCivil();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EstadoCivilResponse> update(Long id, EstadoCivilRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("EstadoCivil not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("EstadoCivil not found")));
    }

    private void apply(EstadoCivil e, EstadoCivilRequest r) {
        e.descricao = r.descricao();
    }

    private EstadoCivilResponse toResponse(EstadoCivil e) {
        return new EstadoCivilResponse(e.id, e.descricao);
    }


    // Migrado de EstadoCivilController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/EstadoCivilController.java:72, camada controller)
    // Logica original (adaptar):
    // public List<EstadoCivil> autoComplete(String query) {
    //         if (!query.equals("")) {
    //             return estadoCivilService.autoComplete(query);
    //         } else {
    //             return estadoCivilService.autoComplete();
    //         }
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        if (!query.equals("")) {
            return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
        } else {
            return repository.autoCompleteAll().map(list -> list.stream().map(x -> x.id).toList());
        }
    }


    // Migrado de EstadoCivilService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/basico/EstadoCivilService.java:30, camada service)
    // JPQL original: select c from Curso c where lower(c.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1 order by c.nome
    // Logica original (adaptar):
    // public List<EstadoCivil> autoComplete() {
    //         return this.getCursoRepository().autoComplete(new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete2() {
        return repository.autoCompleteAll().map(list -> list.stream().map(x -> x.id).toList());
    }

}

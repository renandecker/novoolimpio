package br.com.sol7.olimpio.basico.pais.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.pais.dto.PaisRequest;
import br.com.sol7.olimpio.basico.pais.dto.PaisResponse;
import br.com.sol7.olimpio.basico.pais.entity.Pais;
import br.com.sol7.olimpio.basico.pais.repository.PaisRepository;

@ApplicationScoped
@WithTransaction
public class PaisService {

    @Inject PaisRepository repository;

    public Uni<List<PaisResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PaisResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<PaisResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Pais not found"))
                .map(this::toResponse);
    }

    public Uni<PaisResponse> create(PaisRequest r) {
        var e = new Pais();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PaisResponse> update(Long id, PaisRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Pais not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Pais not found")));
    }

    private void apply(Pais e, PaisRequest r) { e.nome = r.nome(); e.nacionalidade = r.nacionalidade(); }

    private PaisResponse toResponse(Pais e) {
        return new PaisResponse(e.id, e.nome, e.nacionalidade);
    }


    // Migrado de PaisService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/basico/PaisService.java:21, camada service)
    // JPQL original: select p from Pais p where lower(p.nome) like '%' || ?1 || '%' OR str(p.id) = ?1  order by p.nome
    // Logica original (adaptar):
    // public List<Pais> autoComplete(String query) {
    //         return this.getPaisRepository().autoComplete(query.toLowerCase());
    //     }
    public Uni<List<Long>> autoComplete(String query) {
                return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

}

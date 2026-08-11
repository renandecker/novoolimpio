package br.com.sol7.olimpio.comercial.campanha;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class CampanhaService {

    @Inject CampanhaRepository repository;

    public Uni<List<CampanhaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CampanhaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CampanhaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Campanha not found"))
                .map(this::toResponse);
    }

    public Uni<CampanhaResponse> create(CampanhaRequest r) {
        var e = new Campanha();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CampanhaResponse> update(Long id, CampanhaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Campanha not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Campanha not found")));
    }

    private void apply(Campanha e, CampanhaRequest r) { e.descricao = r.descricao(); e.meta = r.meta(); e.ativo = r.ativo(); e.dataInicial = r.dataInicial(); }

    private CampanhaResponse toResponse(Campanha e) {
        return new CampanhaResponse(e.id, e.descricao, e.meta, e.ativo, e.dataInicial);
    }


    // Migrado de CampanhaService.buscarCampanhaComAcoes (src/main/java/br/com/sol7/olimpio/service/services/comercial/CampanhaService.java:25, camada service)
    // Observacao: retorno: era Campanha (referencia por id)
    // JPQL original: select a from Campanha a left join fetch a.acoesDeCampanha where a.id = ?1
    // Logica original (adaptar):
    // public Campanha buscarCampanhaComAcoes(Integer id) {
    //         return getCampanhaRepository().buscarCampanhaComAcoes(id);
    //     }
    public Uni<Long> buscarCampanhaComAcoes(Integer id) {
                return repository.buscarCampanhaComAcoes(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de CampanhaService.buscarCampanhaDaUnidade (src/main/java/br/com/sol7/olimpio/service/services/comercial/CampanhaService.java:29, camada service)
    // JPQL original: Select distinct ca from Campanha ca inner join ca.unidades un inner join un.usuarios us where us in(?1)
    // Logica original (adaptar):
    // public List<Campanha> buscarCampanhaDaUnidade() {
    //         return getCampanhaRepository().buscarCampanhaDaUnidade(usuarioLogadoController.getUsuario());
    //     }
    public Uni<List<Long>> buscarCampanhaDaUnidade() {
        // Obs: depende do contexto de usuario logado (usuario/unidades)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CampanhaService.buscarCampanhaComUnidades (src/main/java/br/com/sol7/olimpio/service/services/comercial/CampanhaService.java:33, camada service)
    // Observacao: retorno: era Campanha (referencia por id); parametro entityId: era Campanha (referencia por id)
    // JPQL original: Select ca from Campanha ca left join fetch ca.unidades where ca = ?1
    // Logica original (adaptar):
    // public Campanha buscarCampanhaComUnidades(Campanha entity) {
    //         return getCampanhaRepository().buscarCampanhaComUnidades(entity);
    //     }
    public Uni<Long> buscarCampanhaComUnidades(Long entityId) {
                return repository.buscarCampanhaComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

}

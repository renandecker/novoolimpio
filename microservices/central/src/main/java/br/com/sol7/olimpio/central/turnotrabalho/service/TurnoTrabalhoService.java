package br.com.sol7.olimpio.central.turnotrabalho;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class TurnoTrabalhoService {

    @Inject
    TurnoTrabalhoRepository repository;

    public Uni<List<TurnoTrabalhoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TurnoTrabalhoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TurnoTrabalhoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoTrabalho not found"))
                .map(this::toResponse);
    }

    public Uni<TurnoTrabalhoResponse> create(TurnoTrabalhoRequest r) {
        var e = new TurnoTrabalho();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<TurnoTrabalhoResponse> update(Long id, TurnoTrabalhoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoTrabalho not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TurnoTrabalho not found")));
    }

    private void apply(TurnoTrabalho e, TurnoTrabalhoRequest r) {
        e.descricao = r.descricao();
        e.inicio = r.inicio();
        e.fim = r.fim();
        e.diaSemanaId = r.diaSemanaId();
    }

    private TurnoTrabalhoResponse toResponse(TurnoTrabalho e) {
        return new TurnoTrabalhoResponse(e.id, e.descricao, e.inicio, e.fim, e.diaSemanaId);
    }


    // Migrado de TurnoTrabalhoController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/central/TurnoTrabalhoController.java:148, camada controller)
    // Logica original (adaptar):
    // public List<TurnoTrabalho> autoComplete(String query) {
    //         if (ObjectUtil.nullOrEmpty(query)) {
    //             return turnoTrabalhoService.buscarTurnosDaUnidade();
    //         }
    //         return turnoTrabalhoService.autoCompleteTurnoTrabalho(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        if (query == null || query.isEmpty()) {
            // Obs: condicao removida (depende do usuario logado do microservico basico): us in (usuarioLogado)
            return repository.find("order by inicio").list().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.find("(lower(descricao) like '%' || ?1 || '%' OR str(id) = ?1) order by descricao", query.toLowerCase()).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de TurnoTrabalhoService.autoCompleteTurnoTrabalho (src/main/java/br/com/sol7/olimpio/service/services/central/TurnoTrabalhoService.java:26, camada service)
    // JPQL original: select distinct t from TurnoTrabalho t inner join t.unidades un inner join un.usuarios us where us in (?2) AND lower(t.descricao) like '%' || ?1 || '%'  OR str(t.id) = ?1
    // Logica original (adaptar):
    // public List<TurnoTrabalho> autoCompleteTurnoTrabalho(String query) {
    //         return getTurnoTrabalhoRepository().autoCompleteTurnoTrabalho(query, usuarioLogadoController.getUsuario());
    //     }
    public Uni<List<Long>> autoCompleteTurnoTrabalho(String query) {
        // Obs: condicao removida (depende do usuario logado do microservico basico): us in (usuarioLogado)
        return repository.find("(lower(descricao) like '%' || ?1 || '%' OR str(id) = ?1) order by descricao", query.toLowerCase()).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de TurnoTrabalhoService.buscarTurnoTrabalhoComUnidades (src/main/java/br/com/sol7/olimpio/service/services/central/TurnoTrabalhoService.java:30, camada service)
    // Observacao: retorno: era TurnoTrabalho (referencia por id); parametro entityId: era TurnoTrabalho (referencia por id)
    // JPQL original: Select tu from TurnoTrabalho tu left join fetch tu.unidades where tu = ?1
    // Logica original (adaptar):
    // public TurnoTrabalho buscarTurnoTrabalhoComUnidades(TurnoTrabalho entity) {
    //         return getTurnoTrabalhoRepository().buscarTurnoTrabalhoComUnidades(entity);
    //     }
    public Uni<Long> buscarTurnoTrabalhoComUnidades(Long entityId) {
        return repository.buscarTurnoTrabalhoComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de TurnoTrabalhoService.buscarTurnosDaUnidade (src/main/java/br/com/sol7/olimpio/service/services/central/TurnoTrabalhoService.java:34, camada service)
    // JPQL original: select distinct t from TurnoTrabalho t inner join t.unidades un inner join un.usuarios us where us in (?1)
    // Logica original (adaptar):
    // public List<TurnoTrabalho> buscarTurnosDaUnidade() {
    //         return getTurnoTrabalhoRepository().buscarTurnosDaUnidade(usuarioLogadoController.getUsuario());
    //     }
    public Uni<List<Long>> buscarTurnosDaUnidade() {
        // Obs: condicao removida (depende do usuario logado do microservico basico): us in (usuarioLogado)
        return repository.find("order by inicio").list().map(list -> list.stream().map(x -> x.id).toList());
    }

}

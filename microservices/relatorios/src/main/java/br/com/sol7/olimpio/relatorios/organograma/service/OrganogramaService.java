package br.com.sol7.olimpio.relatorios.organograma;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class OrganogramaService {

    @Inject
    OrganogramaRepository repository;

    public Uni<List<OrganogramaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<OrganogramaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<OrganogramaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Organograma not found"))
                .map(this::toResponse);
    }

    public Uni<OrganogramaResponse> create(OrganogramaRequest r) {
        var e = new Organograma();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<OrganogramaResponse> update(Long id, OrganogramaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Organograma not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Organograma not found")));
    }

    private void apply(Organograma e, OrganogramaRequest r) {
        e.nome = r.nome();
        e.dataCadastro = r.dataCadastro();
        e.dataAlteracao = r.dataAlteracao();
    }

    private OrganogramaResponse toResponse(Organograma e) {
        return new OrganogramaResponse(e.id, e.nome, e.dataCadastro, e.dataAlteracao);
    }


    // Migrado de OrganogramaService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/relatorios/OrganogramaService.java:31, camada service)
    // Logica original (adaptar):
    // public List<Organograma> autoComplete(String query) {
    //         return this.getOrganogramaRepository().autoComplete(query.toLowerCase(), new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.find("(lower(nome) like '%' || ?1 || '%' OR  str(id) = ?1) order by nome", query.toLowerCase()).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OrganogramaService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/relatorios/OrganogramaService.java:35, camada service)
    // Observacao: parametro id: era Organograma (referencia por id)
    // JPQL original: select a.unidades from Organograma a where a = ?1
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades(Organograma id) {
    //         return getOrganogramaRepository().buscarUnidades(id);
    //     }
    public Uni<List<Long>> buscarUnidades(Long id) {
        // Obs: depende do microservico basico (Unidade) - repository.buscarUnidades
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de OrganogramaService.buscarPerfils (src/main/java/br/com/sol7/olimpio/service/services/relatorios/OrganogramaService.java:39, camada service)
    // Observacao: parametro id: era Organograma (referencia por id)
    // JPQL original: select a.perfils from Organograma a where a = ?1
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfils(Organograma id) {
    //         return getOrganogramaRepository().buscarPerfils(id);
    //     }
    public Uni<List<Long>> buscarPerfils(Long id) {
        // Obs: depende do microservico basico (Perfil) - repository.buscarPerfils
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de OrganogramaService.buscarUsuarios (src/main/java/br/com/sol7/olimpio/service/services/relatorios/OrganogramaService.java:43, camada service)
    // Observacao: parametro id: era Organograma (referencia por id)
    // JPQL original: select a.usuarios from Organograma a where a = ?1
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarios(Organograma id) {
    //         return getOrganogramaRepository().buscarUsuarios(id);
    //     }
    public Uni<List<Long>> buscarUsuarios(Long id) {
        // Obs: depende do microservico basico (Usuario) - repository.buscarUsuarios
        return Uni.createFrom().item(java.util.List.of());
    }

}

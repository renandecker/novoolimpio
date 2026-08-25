package br.com.sol7.olimpio.basico.estado.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.estado.dto.EstadoRequest;
import br.com.sol7.olimpio.basico.estado.dto.EstadoResponse;
import br.com.sol7.olimpio.basico.estado.entity.Estado;
import br.com.sol7.olimpio.basico.estado.repository.EstadoRepository;

@ApplicationScoped
@WithTransaction
public class EstadoService {

    @Inject
    EstadoRepository repository;

    public Uni<List<EstadoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EstadoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<EstadoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Estado not found"))
                .map(this::toResponse);
    }

    public Uni<EstadoResponse> create(EstadoRequest r) {
        var e = new Estado();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EstadoResponse> update(Long id, EstadoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Estado not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Estado not found")));
    }

    private void apply(Estado e, EstadoRequest r) {
        e.nome = r.nome();
        e.uf = r.uf();
        e.paisId = r.paisId();
    }

    private EstadoResponse toResponse(Estado e) {
        return new EstadoResponse(e.id, e.nome, e.uf, e.paisId);
    }


    // Migrado de EstadoController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/EstadoController.java:75, camada controller)
    // Logica original (adaptar):
    // public List<Estado> autoComplete(String query) {
    //         return estadoService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Opcoes ricas (id + nome + uf) para os autocompletes da tela de logradouro.
    public Uni<List<EstadoResponse>> autoCompleteOpcoes(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(this::toResponse).toList());
    }

}

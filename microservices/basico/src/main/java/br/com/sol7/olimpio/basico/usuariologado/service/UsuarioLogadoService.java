package br.com.sol7.olimpio.basico.usuariologado.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.usuariologado.dto.UsuarioLogadoRequest;
import br.com.sol7.olimpio.basico.usuariologado.dto.UsuarioLogadoResponse;
import br.com.sol7.olimpio.basico.usuariologado.entity.UsuarioLogado;
import br.com.sol7.olimpio.basico.usuariologado.repository.UsuarioLogadoRepository;

@ApplicationScoped
@WithTransaction
public class UsuarioLogadoService {

    @Inject UsuarioLogadoRepository repository;

    public Uni<List<UsuarioLogadoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<UsuarioLogadoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<UsuarioLogadoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("UsuarioLogado not found"))
                .map(this::toResponse);
    }

    public Uni<UsuarioLogadoResponse> create(UsuarioLogadoRequest r) {
        var e = new UsuarioLogado();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<UsuarioLogadoResponse> update(Long id, UsuarioLogadoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("UsuarioLogado not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("UsuarioLogado not found")));
    }

    private void apply(UsuarioLogado e, UsuarioLogadoRequest r) { e.usuarioId = r.usuarioId(); }

    private UsuarioLogadoResponse toResponse(UsuarioLogado e) {
        return new UsuarioLogadoResponse(e.id, e.usuarioId);
    }
}

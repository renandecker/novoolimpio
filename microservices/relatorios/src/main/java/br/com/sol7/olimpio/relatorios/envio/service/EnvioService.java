package br.com.sol7.olimpio.relatorios.envio;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class EnvioService {
    @Inject
    EnvioRepository repository;

    public Uni<List<EnvioResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EnvioResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<EnvioResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Envio not found")).map(this::toResponse);
    }

    public Uni<EnvioResponse> create(EnvioRequest r) {
        var e = new Envio();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EnvioResponse> update(Long id, EnvioRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Envio not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Envio not found")));
    }

    private void apply(Envio e, EnvioRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private EnvioResponse toResponse(Envio e) {
        return new EnvioResponse(e.id, e.nome, e.dadosJson);
    }
}
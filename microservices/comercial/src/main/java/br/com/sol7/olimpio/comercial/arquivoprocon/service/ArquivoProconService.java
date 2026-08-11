package br.com.sol7.olimpio.comercial.arquivoprocon;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ArquivoProconService {

    @Inject ArquivoProconRepository repository;

    public Uni<List<ArquivoProconResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ArquivoProconResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ArquivoProconResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ArquivoProcon not found"))
                .map(this::toResponse);
    }

    public Uni<ArquivoProconResponse> create(ArquivoProconRequest r) {
        var e = new ArquivoProcon();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ArquivoProconResponse> update(Long id, ArquivoProconRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ArquivoProcon not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ArquivoProcon not found")));
    }

    private void apply(ArquivoProcon e, ArquivoProconRequest r) { e.data = r.data(); e.numeroLinhas = r.numeroLinhas(); e.usuarioId = r.usuarioId(); e.hash = r.hash(); e.prospectosDeletadosPacote = r.prospectosDeletadosPacote(); }

    private ArquivoProconResponse toResponse(ArquivoProcon e) {
        return new ArquivoProconResponse(e.id, e.data, e.numeroLinhas, e.usuarioId, e.hash, e.prospectosDeletadosPacote);
    }


    // Migrado de ArquivoProconService.verificarHash (src/main/java/br/com/sol7/olimpio/service/services/comercial/ArquivoProconService.java:23, camada service)
    // Logica original (adaptar):
    // public List<ArquivoProcon> verificarHash(String hash) {
    //         return getArquivoProconRepository().verificarHash(hash);
    //     }
    public Uni<List<Long>> verificarHash(String hash) {
                return repository.find("hash = ?1", hash).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}

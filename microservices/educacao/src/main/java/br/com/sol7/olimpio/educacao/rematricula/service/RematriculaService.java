package br.com.sol7.olimpio.educacao.rematricula;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import io.smallrye.mutiny.Uni;

@ApplicationScoped
@WithTransaction
public class RematriculaService {
    @Inject
    RematriculaRepository repository;

    public Uni<List<RematriculaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<RematriculaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<RematriculaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Rematricula not found")).map(this::toResponse);
    }

    public Uni<RematriculaResponse> create(RematriculaRequest r) {
        var e = new Rematricula();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<RematriculaResponse> update(Long id, RematriculaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Rematricula not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Rematricula not found")));
    }

    private void apply(Rematricula e, RematriculaRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private RematriculaResponse toResponse(Rematricula e) {
        return new RematriculaResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de RematriculaController.buscarRequisitos (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/RematriculaController.java:198, camada controller)
    // Observacao: parametro curriculoId: era Curriculo (referencia por id)
    // Logica original (adaptar):
    // private void buscarRequisitos(Curriculo curriculo) {
    //         requisitosRequisitoMatriz = MatriculaController.adicionarRequisitosMatriz(curriculo, curriculoService, requisitoMatrizService);
    //     }
    public Uni<Void> buscarRequisitos(Long curriculoId) {
        // Obs: depende do microservico curriculo (RequisitoMatriz)
        return Uni.createFrom().voidItem();
    }

}

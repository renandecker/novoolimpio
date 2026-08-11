package br.com.sol7.olimpio.curriculo.curriculocampo;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.RefOption;
import br.com.sol7.olimpio.shared.RefService;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.unchecked.Unchecked;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Map;

@ApplicationScoped
@WithTransaction
public class CurriculoCampoService {

    @Inject
    CurriculoCampoRepository repository;

    @Inject
    RefService refService;

    public Uni<List<CurriculoCampoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CurriculoCampoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = switch (size) {
            case 10, 20, 50, 100 -> size;
            default -> 10;
        };
        return repository.findAll().page(p, s).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<CurriculoCampoResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("CurriculoCampo não encontrado: " + id))
                .map(this::toResponse);
    }

    public Uni<CurriculoCampoResponse> create(CurriculoCampoRequest request) {
        CurriculoCampo entity = new CurriculoCampo();
        apply(entity, request);
        return repository.persist(entity).map(Unchecked.function(v -> toResponse(entity)));
    }

    public Uni<CurriculoCampoResponse> update(Long id, CurriculoCampoRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("CurriculoCampo não encontrado: " + id))
                .chain(entity -> {
                    apply(entity, request);
                    return repository.persistAndFlush(entity).map(v -> toResponse(entity));
                });
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("CurriculoCampo não encontrado: " + id))
                .chain(repository::delete);
    }

    public Uni<Map<String, List<RefOption>>> refs() {
        return refService.resolve(Map.of(
                "id_campo",
                "SELECT id, COALESCE(rotulo, nome) FROM com_campo ORDER BY 2 LIMIT 200"));
    }

    private void apply(CurriculoCampo entity, CurriculoCampoRequest request) {
        entity.campoId = request.id_campo();
        entity.obrigatorio = request.obrigatorio() == null ? Boolean.FALSE : request.obrigatorio();
        entity.ordem = request.ordem();
    }

    private CurriculoCampoResponse toResponse(CurriculoCampo entity) {
        return new CurriculoCampoResponse(
                entity.id,
                entity.campoId,
                entity.obrigatorio,
                entity.ordem);
    }
}

package br.com.sol7.olimpio.curriculo.empresaunidade;

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
public class EmpresaUnidadeService {

    @Inject
    EmpresaUnidadeRepository repository;

    @Inject
    RefService refService;

    public Uni<List<EmpresaUnidadeResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EmpresaUnidadeResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = switch (size) {
            case 10, 20, 50, 100 -> size;
            default -> 10;
        };
        return repository.findAll().page(p, s).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<EmpresaUnidadeResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("EmpresaUnidade não encontrada: " + id))
                .map(this::toResponse);
    }

    public Uni<EmpresaUnidadeResponse> create(EmpresaUnidadeRequest request) {
        EmpresaUnidade entity = new EmpresaUnidade();
        apply(entity, request);
        return repository.persist(entity).map(Unchecked.function(v -> toResponse(entity)));
    }

    public Uni<EmpresaUnidadeResponse> update(Long id, EmpresaUnidadeRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("EmpresaUnidade não encontrada: " + id))
                .chain(entity -> {
                    apply(entity, request);
                    return repository.persistAndFlush(entity).map(v -> toResponse(entity));
                });
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("EmpresaUnidade não encontrada: " + id))
                .chain(repository::delete);
    }

    public Uni<Map<String, List<RefOption>>> refs() {
        return refService.resolve(Map.of(
                "id_empresa",
                "SELECT p.id, COALESCE(pf.nome, pj.nome_fantasia, pj.razao_social, p.email) " +
                        "FROM cur_empresa e " +
                        "JOIN bas_pessoa p ON p.id = e.id_pessoa " +
                        "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
                        "LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = p.id " +
                        "ORDER BY 2 LIMIT 200",
                "id_unidade",
                "SELECT id, COALESCE(sucinto, nome_fantasia, razao_social) FROM bas_unidade ORDER BY 2 LIMIT 200",
                "id_tipo_contrato",
                "SELECT id, descricao FROM edc_tipo_contrato ORDER BY 2 LIMIT 200"));
    }

    private void apply(EmpresaUnidade entity, EmpresaUnidadeRequest request) {
        entity.empresaId = request.id_empresa();
        entity.unidadeId = request.id_unidade();
        entity.inicio = request.inicio();
        entity.fim = request.fim();
        entity.preAutorizado = request.pre_autorizado();
        entity.tipoContratoId = request.id_tipo_contrato();
    }

    private EmpresaUnidadeResponse toResponse(EmpresaUnidade entity) {
        return new EmpresaUnidadeResponse(
                entity.id,
                entity.empresaId,
                entity.unidadeId,
                entity.inicio,
                entity.fim,
                entity.preAutorizado,
                entity.tipoContratoId);
    }
}

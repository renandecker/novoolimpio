package br.com.sol7.olimpio.curriculo.empresa;

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
public class EmpresaService {

    @Inject
    EmpresaRepository repository;

    @Inject
    RefService refService;

    public Uni<List<EmpresaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EmpresaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = switch (size) {
            case 10, 20, 50, 100 -> size;
            default -> 10;
        };
        return repository.findAll().page(p, s).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<EmpresaResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empresa não encontrada: " + id))
                .map(this::toResponse);
    }

    public Uni<EmpresaResponse> create(EmpresaRequest request) {
        Empresa empresa = new Empresa();
        apply(empresa, request);
        return repository.persist(empresa).map(Unchecked.function(v -> toResponse(empresa)));
    }

    public Uni<EmpresaResponse> update(Long id, EmpresaRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empresa não encontrada: " + id))
                .chain(empresa -> {
                    apply(empresa, request);
                    return repository.persistAndFlush(empresa).map(v -> toResponse(empresa));
                });
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empresa não encontrada: " + id))
                .chain(empresa -> repository.delete(empresa));
    }

    public Uni<Map<String, List<RefOption>>> refs() {
        return refService.resolve(Map.of(
                "id_pessoa",
                "SELECT p.id, COALESCE(pf.nome, pj.nome_fantasia, pj.razao_social, p.email) " +
                        "FROM bas_pessoa p " +
                        "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
                        "LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = p.id " +
                        "ORDER BY 2 LIMIT 200"));
    }

    private void apply(Empresa empresa, EmpresaRequest request) {
        empresa.pessoaId = request.id_pessoa();
        empresa.dtInicio = request.dt_inicio();
        empresa.dtFim = request.dt_fim();
        empresa.flAtivo = request.fl_ativo() == null ? Boolean.TRUE : request.fl_ativo();
    }

    private EmpresaResponse toResponse(Empresa empresa) {
        return new EmpresaResponse(
                empresa.id,
                empresa.pessoaId,
                empresa.dtInicio,
                empresa.dtFim,
                empresa.flAtivo);
    }
}

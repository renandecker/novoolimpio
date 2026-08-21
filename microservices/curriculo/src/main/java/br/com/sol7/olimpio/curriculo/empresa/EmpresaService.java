package br.com.sol7.olimpio.curriculo.empresa;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.RefOption;
import br.com.sol7.olimpio.shared.RefService;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.unchecked.Unchecked;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.ArrayList;
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
        return repository.listAll()
                .chain(this::enrichWithPessoa)
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EmpresaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = switch (size) {
            case 10, 20, 50, 100 -> size;
            default -> 10;
        };
        return repository.findAll().page(p, s).list()
                .chain(this::enrichWithPessoa)
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    private Uni<List<Empresa>> enrichWithPessoa(List<Empresa> empresas) {
        if (empresas.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        List<Long> pessoaIds = empresas.stream().map(e -> e.pessoaId).distinct().toList();
        String sql = """
                SELECT p.id,
                       pf.nome,
                       pj.nome_fantasia,
                       pj.razao_social,
                       pj.cnpj,
                       p.telefone,
                       p.email
                FROM bas_pessoa p
                LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id
                LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = p.id
                WHERE p.id IN (%s)
                """.formatted(pessoaIds.stream().map(String::valueOf).reduce((a, b) -> a + "," + b).orElse("0"));
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql).getResultList())
                .map(rows -> {
                    Map<Long, Object[]> pessoaMap = new java.util.HashMap<>();
                    for (Object rowObj : rows) {
                        Object[] row = (Object[]) rowObj;
                        Long id = ((Number) row[0]).longValue();
                        pessoaMap.put(id, row);
                    }
                    for (Empresa e : empresas) {
                        Object[] data = pessoaMap.get(e.pessoaId);
                        if (data != null) {
                            e.pessoaNome = data[1] != null ? data[1].toString() : null;
                            e.pessoaNomeFantasia = data[2] != null ? data[2].toString() : null;
                            e.pessoaRazaoSocial = data[3] != null ? data[3].toString() : null;
                            e.pessoaCnpj = data[4] != null ? data[4].toString() : null;
                            e.pessoaTelefone = data[5] != null ? data[5].toString() : null;
                            e.pessoaEmail = data[6] != null ? data[6].toString() : null;
                        }
                    }
                    return empresas;
                });
    }

    public Uni<EmpresaResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empresa não encontrada: " + id))
                .chain(e -> enrichWithPessoa(List.of(e)))
                .map(list -> toResponse(list.get(0)));
    }

    public Uni<EmpresaResponse> create(EmpresaRequest request) {
        Empresa empresa = new Empresa();
        apply(empresa, request);
        return repository.persist(empresa)
                .chain(v -> enrichWithPessoa(List.of(empresa)))
                .map(list -> toResponse(list.get(0)));
    }

    public Uni<EmpresaResponse> update(Long id, EmpresaRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empresa não encontrada: " + id))
                .chain(empresa -> {
                    apply(empresa, request);
                    return repository.persistAndFlush(empresa)
                            .chain(v -> enrichWithPessoa(List.of(empresa)))
                            .map(list -> toResponse(list.get(0)));
                });
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Empresa não encontrada: " + id))
                .chain(repository::delete);
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
        
        // Validation: dt_fim >= dt_inicio (from legacy formEmpresa.xhtml)
        if (request.dt_inicio() != null && request.dt_fim() != null && request.dt_fim().before(request.dt_inicio())) {
            throw new IllegalArgumentException("Data fim não pode ser anterior à data início");
        }
    }

    private EmpresaResponse toResponse(Empresa empresa) {
        return new EmpresaResponse(
                empresa.id,
                empresa.pessoaId,
                empresa.pessoaNome,
                empresa.pessoaNomeFantasia,
                empresa.pessoaRazaoSocial,
                empresa.pessoaCnpj,
                empresa.pessoaTelefone,
                empresa.pessoaEmail,
                empresa.dtInicio,
                empresa.dtFim,
                empresa.flAtivo);
    }
}

package br.com.sol7.olimpio.curriculo.curriculotrabalho;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.RefOption;
import br.com.sol7.olimpio.shared.RefService;
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
public class CurriculoTrabalhoService {

    @Inject
    CurriculoTrabalhoRepository repository;

    @Inject
    CurriculoCampoInformacaoRepository campoInformacaoRepository;

    @Inject
    RefService refService;

    public Uni<List<CurriculoTrabalhoResponse>> list() {
        return repository.listAll().onItem().transformToUni(items -> toResponses(items));
    }

    public Uni<PagedResponse<CurriculoTrabalhoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = switch (size) {
            case 10,20, 50, 100 ->size;
            default ->10;
        } ;
        return repository.findAll().page(p, s).list()
                .onItem().transformToUni(items -> toResponses(items)
                        .chain(responses -> repository.count()
                                .map(count -> new PagedResponse<>(responses, count, p, s))));
    }

    private Uni<List<CurriculoTrabalhoResponse>> toResponses(List<CurriculoTrabalho> items) {
        if (items.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        return Uni.createFrom().item(new ArrayList<CurriculoTrabalhoResponse>())
                .chain(acc -> {
                    Uni<List<CurriculoTrabalhoResponse>> chain = Uni.createFrom().item(acc);
                    for (CurriculoTrabalho item : items) {
                        chain = chain.chain(list -> toResponse(item).map(list::add).replaceWith(list));
                    }
                    return chain;
                });
    }

    public Uni<CurriculoTrabalhoResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("CurriculoTrabalho não encontrado: " + id))
                .onItem().transformToUni(this::toResponse);
    }

    public Uni<CurriculoTrabalhoResponse> create(CurriculoTrabalhoRequest request) {
        CurriculoTrabalho entity = new CurriculoTrabalho();
        apply(entity, request);
        return repository.persist(entity)
                .chain(v -> syncInformacoes(entity.id, request.campo_informacoes()))
                .onItem().transformToUni(v -> toResponse(entity));
    }

    public Uni<CurriculoTrabalhoResponse> update(Long id, CurriculoTrabalhoRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("CurriculoTrabalho não encontrado: " + id))
                .chain(entity -> {
                    apply(entity, request);
                    return repository.persistAndFlush(entity)
                            .chain(v -> syncInformacoes(entity.id, request.campo_informacoes()))
                            .onItem().transformToUni(v -> toResponse(entity));
                });
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("CurriculoTrabalho não encontrado: " + id))
                .chain(entity -> CurriculoCampoInformacao.delete("curriculoTrabalhoId", entity.id)
                        .chain(v -> repository.delete(entity)));
    }

    public Uni<CurriculoTrabalhoResponse> atualizarCurriculoBase64(Long id, String curriculoBase64) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("CurriculoTrabalho não encontrado: " + id))
                .invoke(e -> e.curriculoBase64 = curriculoBase64)
                .onItem().transformToUni(this::toResponse);
    }

    public Uni<Map<String, List<RefOption>>> refs() {
        return refService.resolve(Map.of(
                "id_pessoa",
                "SELECT p.id, COALESCE(pf.nome, pj.nome_fantasia, pj.razao_social, p.email) " +
                        "FROM bas_pessoa p " +
                        "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
                        "LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = p.id " +
                        "ORDER BY 2 LIMIT 200",
                "id_campo",
                "SELECT id, COALESCE(rotulo, nome) FROM com_campo ORDER BY 2 LIMIT 200"));
    }

    private Uni<Void> syncInformacoes(Long curriculoTrabalhoId, List<CurriculoTrabalhoRequest.CampoInformacaoRequest> informacoes) {
        return CurriculoCampoInformacao.delete("curriculoTrabalhoId", curriculoTrabalhoId)
                .chain(v -> {
                    if (informacoes == null || informacoes.isEmpty()) {
                        return Uni.createFrom().voidItem();
                    }
                    List<CurriculoCampoInformacao> entities = new ArrayList<>();
                    informacoes.forEach(info -> {
                        CurriculoCampoInformacao e = new CurriculoCampoInformacao();
                        e.curriculoTrabalhoId = curriculoTrabalhoId;
                        e.campoId = info.id_campo();
                        e.valor = info.valor();
                        entities.add(e);
                    });
                    return campoInformacaoRepository.persist(entities);
                });
    }

    private void apply(CurriculoTrabalho entity, CurriculoTrabalhoRequest request) {
        entity.pessoaId = request.id_pessoa();
        entity.dtInicio = request.dt_inicio();
        entity.dtFim = request.dt_fim();
        entity.flAtivo = request.fl_ativo() == null ? Boolean.TRUE : request.fl_ativo();
    }

    private Uni<CurriculoTrabalhoResponse> toResponse(CurriculoTrabalho entity) {
        io.quarkus.hibernate.reactive.panache.PanacheQuery<CurriculoCampoInformacao> query =
                CurriculoCampoInformacao.find("curriculoTrabalhoId", entity.id);
        return query.list()
                .map(informacoes -> new CurriculoTrabalhoResponse(
                        entity.id,
                        entity.pessoaId,
                        entity.dtInicio,
                        entity.dtFim,
                        entity.flAtivo,
                        informacoes.stream()
                                .map(i -> new CurriculoTrabalhoResponse.CampoInformacaoResponse(i.id, i.campoId, i.valor))
                                .toList()));
    }
}

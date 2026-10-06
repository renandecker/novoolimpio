package br.com.sol7.olimpio.educacao.nap;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import org.jboss.logging.Logger;

@ApplicationScoped
@WithTransaction
public class NAPService {

    private static final Logger LOG = Logger.getLogger(NAPService.class);

    @Inject
    NAPRepository repository;

    public Uni<List<NAPResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<NAPResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<NAPResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("NAP not found")).map(this::toResponse);
    }

    public Uni<NAPResponse> create(NAPRequest r) {
        var e = new NAP();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<NAPResponse> update(Long id, NAPRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("NAP not found"))
                .invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("NAP not found")));
    }

    private void apply(NAP e, NAPRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private NAPResponse toResponse(NAP e) {
        return new NAPResponse(e.id, e.nome, e.dadosJson);
    }

    public Uni<String> obterHorarioAula(Long ocorrenciaComponenteCurricularId) {
        return repository.obterHorarioAula(ocorrenciaComponenteCurricularId);
    }

    public Uni<List<Long>> listaLigacaoNapComEtapa(Long contratoId, Long etapasNAPId) {
        return repository.listaLigacaoNapComEtapa(contratoId, etapasNAPId).map(list -> list.stream().map(nap -> nap.id).toList());
    }

    public Uni<List<Long>> listaNapComEtapa(Long etapasNAPId) {
        return repository.listaNapComEtapa(etapasNAPId).map(list -> list.stream().map(nap -> nap.id).toList());
    }

    public Uni<List<Long>> listaNapSemEtapa() {
        return repository.listaNapSemEtapa().map(list -> list.stream().map(nap -> nap.id).toList());
    }

    public Uni<Long> buscaObjeto(Integer id) {
        return repository.buscaObjeto(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Void> atualizaNapsContrato(Long contratoId) {
        return repository.atualizaNapsContrato(contratoId).replaceWithVoid();
    }

    public Uni<Void> atualizaNapsContratoPresenca(Integer idoferecimentoComponenteCurricular) {
        return repository.atualizaNapsContratoPresenca(idoferecimentoComponenteCurricular).replaceWithVoid();
    }

    public Uni<Void> atualizaNapsContratoNota(Long oferecimentoComponenteCurricularId) {
        return repository.atualizaNapsContratoNota(oferecimentoComponenteCurricularId).replaceWithVoid();
    }



}

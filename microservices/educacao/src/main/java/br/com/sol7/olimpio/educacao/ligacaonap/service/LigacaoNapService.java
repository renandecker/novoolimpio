package br.com.sol7.olimpio.educacao.ligacaonap;

import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@io.quarkus.hibernate.reactive.panache.common.WithTransaction
public class LigacaoNapService {

    @Inject
    LigacaoNapRepository repository;

    public Uni<List<LigacaoNapResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<LigacaoNapResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<LigacaoNapResponse>> pagedPorEtapa(Long etapasNapId, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.find("etapasNapId", etapasNapId)
                .page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count("etapasNapId", etapasNapId)
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<LigacaoNapResponse>> pagedSemEtapa(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.find("etapasNapId is null")
                .page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count("etapasNapId is null")
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<LigacaoNapResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("LigacaoNap not found"))
                .map(this::toResponse);
    }

    public Uni<LigacaoNapResponse> create(LigacaoNapRequest r) {
        var e = new LigacaoNap();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<LigacaoNapResponse> update(Long id, LigacaoNapRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("LigacaoNap not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("LigacaoNap not found")));
    }

    private void apply(LigacaoNap e, LigacaoNapRequest r) {
        e.usuarioId = r.usuarioId();
        e.dataInicial = r.dataInicial();
        e.dataFinal = r.dataFinal();
        e.resultadoLigacaoNapId = r.resultadoLigacaoNapId();
        e.telefone = r.telefone();
        e.observacao = r.observacao();
        e.compromissoId = r.compromissoId();
        e.etapasNapId = r.etapasNapId();
        e.retornoAula = r.retornoAula();
        e.ativo = r.ativo();
        e.qtdeAulaFeita = r.qtdeAulaFeita();
        e.qtdeAulaPresente = r.qtdeAulaPresente();
        e.qtdeAulaMeiaPresente = r.qtdeAulaMeiaPresente();
        e.qtdeFalta = r.qtdeFalta();
        e.mediaNota = r.mediaNota();
        e.notaTotal = r.notaTotal();
        e.notaExecutadas = r.notaExecutadas();
        e.notaObtida = r.notaObtida();
        e.qtdeAula = r.qtdeAula();
        e.contratoId = r.contratoId();
        e.cadernoRetornoId = r.cadernoRetornoId();
        e.qtdeAulaAtrasado = r.qtdeAulaAtrasado();
    }

    private LigacaoNapResponse toResponse(LigacaoNap e) {
        return new LigacaoNapResponse(e.id, e.usuarioId, e.dataInicial, e.dataFinal, e.resultadoLigacaoNapId, e.telefone, e.observacao, e.compromissoId, e.etapasNapId, e.retornoAula, e.ativo, e.qtdeAulaFeita, e.qtdeAulaPresente, e.qtdeAulaMeiaPresente, e.qtdeFalta, e.mediaNota, e.notaTotal, e.notaExecutadas, e.notaObtida, e.qtdeAula, e.contratoId, e.cadernoRetornoId, e.qtdeAulaAtrasado);
    }
}


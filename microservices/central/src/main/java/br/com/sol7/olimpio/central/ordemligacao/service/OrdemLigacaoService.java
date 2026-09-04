package br.com.sol7.olimpio.central.ordemligacao;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.GenericSearchService;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Date;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class OrdemLigacaoService {

    @Inject
    OrdemLigacaoRepository repository;

    @Inject
    GenericSearchService genericSearch;

    public Uni<List<OrdemLigacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<OrdemLigacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<OrdemLigacaoResponse>> search(SearchFilterRequest request, int page, int size) {
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return genericSearch.search(OrdemLigacao.class, request, page, s)
                .map(paged -> new PagedResponse<>(
                        paged.content().stream().map(this::toResponse).toList(),
                        paged.totalElements(), paged.page(), paged.size()));
    }

    public Uni<OrdemLigacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OrdemLigacao not found"))
                .map(this::toResponse);
    }

    public Uni<OrdemLigacaoResponse> create(OrdemLigacaoRequest r) {
        var e = new OrdemLigacao();
        apply(e, r);
        e.dataCriacao = new Date();
        e.status = "AGUARDANDO";
        e.tentativas = 0;
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<OrdemLigacaoResponse> update(Long id, OrdemLigacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OrdemLigacao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("OrdemLigacao not found")));
    }

    public Uni<OrdemLigacaoResponse> buscarProximaOrdemLigacao(Long operacionalId) {
        return repository.buscarProximaOrdemLigacao(operacionalId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Nenhuma ordem de ligação disponível"))
                .map(this::toResponse);
    }

    public Uni<List<OrdemLigacaoResponse>> buscarPorOperacional(Long operacionalId) {
        return repository.buscarPorOperacional(operacionalId).map(list -> list.stream().map(this::toResponse).toList());
    }

    public Uni<Long> contarPorOperacionalEStatus(Long operacionalId, String status) {
        return repository.contarPorOperacionalEStatus(operacionalId, status);
    }

    public Uni<Long> contarPrioritariasPorOperacional(Long operacionalId) {
        return repository.contarPrioritariasPorOperacional(operacionalId);
    }

    public Uni<OrdemLigacaoResponse> atualizarStatus(Long id, String status) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OrdemLigacao not found"))
                .invoke(e -> {
                    e.status = status;
                    if ("EM_ANDAMENTO".equals(status)) {
                        e.ultimaTentativa = new Date();
                        e.tentativas++;
                    }
                })
                .map(this::toResponse);
    }

    public Uni<OrdemLigacaoResponse> incrementarTentativa(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OrdemLigacao not found"))
                .invoke(e -> {
                    e.tentativas++;
                    e.ultimaTentativa = new Date();
                })
                .map(this::toResponse);
    }

    private void apply(OrdemLigacao e, OrdemLigacaoRequest r) {
        e.prospectoId = r.prospectoId();
        e.operacionalId = r.operacionalId();
        e.dataCriacao = r.dataCriacao();
        e.status = r.status();
        e.prioritaria = r.prioritaria();
        e.tentativas = r.tentativas();
        e.ultimaTentativa = r.ultimaTentativa();
    }

    private OrdemLigacaoResponse toResponse(OrdemLigacao e) {
        return new OrdemLigacaoResponse(e.id, e.prospectoId, e.operacionalId, e.dataCriacao, e.status, e.prioritaria, e.tentativas, e.ultimaTentativa);
    }
}
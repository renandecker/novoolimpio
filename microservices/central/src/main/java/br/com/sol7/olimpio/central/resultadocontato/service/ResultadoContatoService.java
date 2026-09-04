package br.com.sol7.olimpio.central.resultadocontato;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.GenericSearchService;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ResultadoContatoService {

    @Inject
    ResultadoContatoRepository repository;

    @Inject
    GenericSearchService genericSearch;

    public Uni<List<ResultadoContatoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ResultadoContatoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<ResultadoContatoResponse>> search(SearchFilterRequest request, int page, int size) {
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return genericSearch.search(ResultadoContato.class, request, page, s)
                .map(paged -> new PagedResponse<>(
                        paged.content().stream().map(this::toResponse).toList(),
                        paged.totalElements(), paged.page(), paged.size()));
    }


    public Uni<ResultadoContatoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ResultadoContato not found"))
                .map(this::toResponse);
    }

    public Uni<ResultadoContatoResponse> create(ResultadoContatoRequest r) {
        var e = new ResultadoContato();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ResultadoContatoResponse> update(Long id, ResultadoContatoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ResultadoContato not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ResultadoContato not found")));
    }

    private void apply(ResultadoContato e, ResultadoContatoRequest r) {
        e.nota = r.nota();
        e.descricao = r.descricao();
        e.voltar = r.voltar();
        e.relato = r.relato();
        e.visivel = r.visivel();
        e.qtdeRetorno = r.qtdeRetorno();
        e.outro = r.outro();
        e.tela = r.tela();
    }

    private ResultadoContatoResponse toResponse(ResultadoContato e) {
        return new ResultadoContatoResponse(e.id, e.nota, e.descricao, e.voltar, e.relato, e.visivel, e.qtdeRetorno, e.outro, e.tela);
    }


    // Migrado de ResultadoContatoService.buscarResultadosOrdenado (src/main/java/br/com/sol7/olimpio/service/services/central/ResultadoContatoService.java:21, camada service)
    // Logica original (adaptar):
    // public List<ResultadoContato> buscarResultadosOrdenado() {
    //         return getResultadoContatoRepository().buscarResultadosOrdenado();
    //     }
    public Uni<List<Long>> buscarResultadosOrdenado() {
        return repository.find("order by descricao").list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ResultadoContatoService.buscarResultadosOrdenadoLigacao (src/main/java/br/com/sol7/olimpio/service/services/central/ResultadoContatoService.java:25, camada service)
    // Logica original (adaptar):
    // public List<ResultadoContato> buscarResultadosOrdenadoLigacao() {
    //         return getResultadoContatoRepository().buscarResultadosOrdenadoLigacao();
    //     }
    public Uni<List<Long>> buscarResultadosOrdenadoLigacao() {
        return repository.find("visivel = true order by descricao").list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<ResultadoContatoResponse>> listarPorTela(int tipoTela) {
        return repository.find("tela = ?1", tipoTela).list().map(items -> items.stream().map(this::toResponse).toList());
    }

}

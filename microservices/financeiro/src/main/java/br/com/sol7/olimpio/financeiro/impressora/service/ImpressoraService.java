package br.com.sol7.olimpio.financeiro.impressora;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ImpressoraService {

    @Inject ImpressoraRepository repository;

    public Uni<List<ImpressoraResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ImpressoraResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ImpressoraResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Impressora not found"))
                .map(this::toResponse);
    }

    public Uni<ImpressoraResponse> create(ImpressoraRequest r) {
        var e = new Impressora();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ImpressoraResponse> update(Long id, ImpressoraRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Impressora not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Impressora not found")));
    }

    private void apply(Impressora e, ImpressoraRequest r) { e.unidadeId = r.unidadeId(); e.porta = r.porta(); e.modelo = r.modelo(); e.manual = r.manual(); e.tamanho = r.tamanho(); e.dataAlteracao = r.dataAlteracao(); }

    private ImpressoraResponse toResponse(Impressora e) {
        return new ImpressoraResponse(e.id, e.unidadeId, e.porta, e.modelo, e.manual, e.tamanho, e.dataAlteracao);
    }


    // Migrado de ImpressoraService.buscarImpressorasUnidade (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ImpressoraService.java:30, camada service)
    // Observacao: retorno: era Impressora (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public Impressora buscarImpressorasUnidade(Unidade unidade) {
    //         if (!ObjectUtil.nullOrEmpty(getImpressoraRepository().buscarImpressorasUnidade(unidade))) {
    //             return getImpressoraRepository().buscarImpressorasUnidade(unidade).get(0);
    //         }
    //         return null;
    //     }
    public Uni<Long> buscarImpressorasUnidade(Long unidadeId) {
        return repository.buscarImpressorasUnidade(unidadeId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ImpressoraService.verificarImpressorasComUnidade (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ImpressoraService.java:37, camada service)
    // Observacao: retorno: era Impressora (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public Impressora verificarImpressorasComUnidade(Unidade unidade, int id) {
    //         if (!ObjectUtil.nullOrEmpty(getImpressoraRepository().verificarImpressorasComUnidade(unidade, id))) {
    //             return getImpressoraRepository().verificarImpressorasComUnidade(unidade, id).get(0);
    //         }
    //         return null;
    //     }
    public Uni<Long> verificarImpressorasComUnidade(Long unidadeId, Integer id) {
        return repository.verificarImpressorasComUnidade(unidadeId, id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

}

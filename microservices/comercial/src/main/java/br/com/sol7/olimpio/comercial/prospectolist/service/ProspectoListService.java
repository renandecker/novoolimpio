package br.com.sol7.olimpio.comercial.prospectolist;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Map;
import java.util.Collections;

import io.smallrye.mutiny.Uni;

@ApplicationScoped
@WithTransaction
public class ProspectoListService {
    @Inject
    ProspectoListRepository repository;

    public Uni<List<ProspectoListResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ProspectoListResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ProspectoListResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("ProspectoList not found")).map(this::toResponse);
    }

    public Uni<ProspectoListResponse> create(ProspectoListRequest r) {
        var e = new ProspectoList();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ProspectoListResponse> update(Long id, ProspectoListRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("ProspectoList not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("ProspectoList not found")));
    }

    private void apply(ProspectoList e, ProspectoListRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private ProspectoListResponse toResponse(ProspectoList e) {
        return new ProspectoListResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de ProspectoListController.carregarQuantidadeLigacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoListController.java:140, camada controller)
    // Observacao: parametro prospectoId: era Prospecto (referencia por id)
    // Logica original (adaptar):
    // public void carregarQuantidadeLigacao(Prospecto prospecto) {
    //         ligacaoProspectoList = ligacaoProspectoService.buscarProspectoLigacaoPeloProspecto(prospecto);
    //     }
    public Uni<List<Map<String, Object>>> carregarQuantidadeLigacao(Long prospectoId) {
        return Uni.createFrom().item(Collections.emptyList());
    }

    public Uni<List<Map<String, Object>>> carregarHistoricoLigacao(Long prospectoId) {
        return Uni.createFrom().item(Collections.emptyList());
    }

    public Uni<List<Map<String, Object>>> carregarProspectosLink() {
        return Uni.createFrom().item(Collections.emptyList());
    }

    public Uni<Map<String, Object>> salvarProspectoLink(Map<String, Object> r) {
        return Uni.createFrom().item(r);
    }

    public Uni<Boolean> inativar(Long id) {
        return repository.findById(id).onItem().ifNotNull().transformToUni(item -> {
            return repository.persist(item).replaceWith(true);
        }).onItem().ifNull().continueWith(false);
    }


}
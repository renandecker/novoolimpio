package br.com.sol7.olimpio.basico.mapamenu.service;

import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.mapamenu.dto.MapaMenuRequest;
import br.com.sol7.olimpio.basico.mapamenu.dto.MapaMenuResponse;
import br.com.sol7.olimpio.basico.mapamenu.entity.MapaMenu;
import br.com.sol7.olimpio.basico.mapamenu.repository.MapaMenuRepository;

@ApplicationScoped
@WithTransaction
public class MapaMenuService {
    @Inject
    MapaMenuRepository repository;

    @CacheResult(cacheName = "mapa-menu-cache")
    public Uni<List<MapaMenuResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MapaMenuResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    @CacheResult(cacheName = "mapa-menu-cache")
    public Uni<MapaMenuResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("MapaMenu not found")).map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "mapa-menu-cache")
    public Uni<MapaMenuResponse> create(MapaMenuRequest r) {
        var e = new MapaMenu();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "mapa-menu-cache")
    public Uni<MapaMenuResponse> update(Long id, MapaMenuRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("MapaMenu not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "mapa-menu-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("MapaMenu not found")));
    }

    private void apply(MapaMenu e, MapaMenuRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private MapaMenuResponse toResponse(MapaMenu e) {
        return new MapaMenuResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de MapaMenuController.buscarFilho (src/main/java/br/com/sol7/olimpio/control/controllers/basico/MapaMenuController.java:168, camada controller)
    // Observacao: retorno: lista de ModuloFacade original; parametro pai: era ModuloFacade no legado
    // Logica original (adaptar):
    // private List<ModuloFacade> buscarFilho(ModuloFacade pai) {
    //         List<ModuloFacade> filhos = new ArrayList<ModuloFacade>();
    //         for (ModuloFacade m : todosModulos) {
    //             if (!ObjectUtil.nullOrEmpty(m.getAntecessor()) && m.getAntecessor().equals(pai)) {
    //                 filhos.add(m);
    //             }
    //         }
    //         return filhos;
    //     }
    public Uni<List<String>> buscarFilho(String pai) {
        // Obs: helper de UI do controller JSF (monta arvore a partir da lista em memoria todosModulos)
        return Uni.createFrom().item(java.util.List.of());
    }

}
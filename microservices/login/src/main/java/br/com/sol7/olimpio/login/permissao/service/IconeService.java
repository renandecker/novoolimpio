package br.com.sol7.olimpio.login.permissao.service;

import br.com.sol7.olimpio.login.permissao.entity.Icone;
import io.quarkus.cache.CacheInvalidate;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Set;

@ApplicationScoped
public class IconeService {

    @CacheResult(cacheName = "icones-cache")
    public Uni<List<Icone>> listAll() {
        return Icone.<Icone>findAll().list();
    }

    @CacheResult(cacheName = "icones-cache")
    public Uni<List<Icone>> listByVersao(String versao) {
        return Icone.<Icone>find("versao", versao).list();
    }

    @CacheResult(cacheName = "icones-cache")
    public Uni<List<Icone>> search(String termo) {
        if (termo == null || termo.isBlank()) {
            return listAll();
        }
        String likeTerm = "%" + termo.toLowerCase() + "%";
        return Icone.<Icone>find("lower(classe) LIKE ?1 OR lower(icone) LIKE ?1 OR lower(search) LIKE ?1", likeTerm).list();
    }

    @CacheInvalidate(cacheName = "icones-cache")
    @WithTransaction
    public Uni<Icone> create(Icone icone) {
        return icone.persist();
    }

    @CacheInvalidate(cacheName = "icones-cache")
    @WithTransaction
    public Uni<Void> createAll(List<Icone> icones) {
        if (icones == null || icones.isEmpty()) {
            return Uni.createFrom().voidItem();
        }
        return Uni.createFrom().item(icones)
                .flatMap(list -> Uni.join().all(list.stream().map(icone -> (Uni<?>) icone.persist()).toList()).andFailFast().replaceWithVoid());
    }

    @CacheResult(cacheName = "icones-cache")
    public Uni<Long> count() {
        return Icone.count();
    }

    @CacheResult(cacheName = "icones-cache")
    public Uni<Boolean> existsByClasseAndVersao(String classe, String versao) {
        return Icone.<Icone>find("classe = ?1 and versao = ?2", classe, versao).firstResult()
                .map(icone -> icone != null);
    }
}
package br.com.sol7.olimpio.basico.favoritoperfil.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.favoritoperfil.dto.FavoritoPerfilRequest;
import br.com.sol7.olimpio.basico.favoritoperfil.dto.FavoritoPerfilResponse;
import br.com.sol7.olimpio.basico.favoritoperfil.entity.FavoritoPerfil;
import br.com.sol7.olimpio.basico.favoritoperfil.repository.FavoritoPerfilRepository;

@ApplicationScoped
@WithTransaction
public class FavoritoPerfilService {

    @Inject
    FavoritoPerfilRepository repository;

    public Uni<List<FavoritoPerfilResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FavoritoPerfilResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<FavoritoPerfilResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FavoritoPerfil not found"))
                .map(this::toResponse);
    }

    public Uni<FavoritoPerfilResponse> create(FavoritoPerfilRequest r) {
        var e = new FavoritoPerfil();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FavoritoPerfilResponse> update(Long id, FavoritoPerfilRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FavoritoPerfil not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("FavoritoPerfil not found")));
    }

    private void apply(FavoritoPerfil e, FavoritoPerfilRequest r) {
        e.nome = r.nome();
        e.icon = r.icon();
        e.perfilId = r.perfilId();
        e.moduloId = r.moduloId();
    }

    private FavoritoPerfilResponse toResponse(FavoritoPerfil e) {
        return new FavoritoPerfilResponse(e.id, e.nome, e.icon, e.perfilId, e.moduloId);
    }


    // Migrado de FavoritoPerfilService.buscarPerfilComFavoritos (src/main/java/br/com/sol7/olimpio/service/services/basico/FavoritoPerfilService.java:26, camada service)
    // Observacao: parametro perfilId: era Perfil (referencia por id)
    // Logica original (adaptar):
    // public List<FavoritoPerfil> buscarPerfilComFavoritos(Perfil perfil) {
    //         return getFavoritoPerfilRepository().buscarPerfilComFavoritos(perfil);
    //     }
    public Uni<List<Long>> buscarPerfilComFavoritos(Long perfilId) {
        return repository.find("perfilId = ?1", perfilId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FavoritoPerfilService.buscarPerfilsComFavoritos (src/main/java/br/com/sol7/olimpio/service/services/basico/FavoritoPerfilService.java:30, camada service)
    // Logica original (adaptar):
    // public List<FavoritoPerfil> buscarPerfilsComFavoritos(List<Perfil> perfil) {
    //         return getFavoritoPerfilRepository().buscarPerfilsComFavoritos(perfil);
    //     }
    public Uni<List<Long>> buscarPerfilsComFavoritos(List<Long> perfil) {
        return repository.find("perfilId in (?1)", perfil).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}

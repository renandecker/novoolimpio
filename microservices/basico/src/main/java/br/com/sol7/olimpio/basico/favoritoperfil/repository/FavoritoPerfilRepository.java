package br.com.sol7.olimpio.basico.favoritoperfil.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.favoritoperfil.entity.FavoritoPerfil;

@ApplicationScoped
public class FavoritoPerfilRepository implements PanacheRepository<FavoritoPerfil> {

    // select p from FavoritoPerfil p where  p.perfil = ?1
    public static final String SQL_BUSCAR_PERFIL_COM_FAVORITOS =
            "SELECT p.* FROM bas_favorito_perfil p WHERE p.id_perfil = ?1";

    public Uni<java.util.List<FavoritoPerfil>> buscarPerfilComFavoritos(Long perfilId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PERFIL_COM_FAVORITOS, FavoritoPerfil.class)
                        .setParameter(1, perfilId)
                        .getResultList());
    }


    // select p from FavoritoPerfil p where  p.perfil in (?1)
    public static final String SQL_BUSCAR_PERFILS_COM_FAVORITOS =
            "SELECT p.* FROM bas_favorito_perfil p WHERE p.id_perfil in (?1)";

    public Uni<java.util.List<FavoritoPerfil>> buscarPerfilsComFavoritos(List<Long> perfilIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PERFILS_COM_FAVORITOS, FavoritoPerfil.class)
                        .setParameter(1, perfilIds)
                        .getResultList());
    }

}
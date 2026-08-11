package br.com.sol7.olimpio.basico.favoritousuario.repository;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.favoritousuario.entity.FavoritoUsuario;
import br.com.sol7.olimpio.basico.modulo.entity.Modulo;
@ApplicationScoped public class FavoritoUsuarioRepository implements PanacheRepository<FavoritoUsuario> {

    // Migrado de FavoritoUsuarioRepository.buscarUsuarioPorPerfil (legado) - HQL original:
    // select fu from FavoritoUsuario fu inner join  fu.usuario  u where u = ?1
    public static final String SQL_BUSCAR_USUARIO_POR_PERFIL =
            "SELECT fu.* FROM bas_favorito_usuario fu INNER JOIN bas_usuario u ON u.id = fu.id_usuario WHERE u.id = ?1";

    public Uni<java.util.List<FavoritoUsuario>> buscarUsuarioPorPerfil(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_POR_PERFIL, FavoritoUsuario.class)
                    .setParameter(1, usuarioId)
                    .getResultList());
    }


    // Migrado de FavoritoUsuarioRepository.buscarUsuarioModuloPorPerfil (legado) - HQL original:
    // select fu from FavoritoUsuario fu inner join  fu.usuario  u where u = ?1
    public static final String SQL_BUSCAR_USUARIO_MODULO_POR_PERFIL =
            "SELECT fu.* FROM bas_favorito_usuario fu INNER JOIN bas_usuario u ON u.id = fu.id_usuario WHERE u.id = ?1";

    public Uni<java.util.List<FavoritoUsuario>> buscarUsuarioModuloPorPerfil(Long usuarioId, Long moduloId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_MODULO_POR_PERFIL, FavoritoUsuario.class)
                    .setParameter(1, usuarioId)
                    .setParameter(2, moduloId)
                    .getResultList());
    }


    // Migrado de FavoritoUsuarioRepository.autoCompleteFavoritoUsuario (legado) - HQL original:
    // select m from Usuario u inner join u.perfis pp inner join pp.perfisModulos pm inner join pm.modulo m where u = ?1 and (lower(m.rotulo) like '%' || ?2 || '%' OR lower(m.descricao) like '%' || ?2 || '%'  OR str(m.id) = ?2) AND NOT (m.outcome is null OR m.outcome = '') order by m.rotulo
    public static final String SQL_AUTO_COMPLETE_FAVORITO_USUARIO =
            "SELECT m.* FROM bas_usuario u INNER JOIN bas_usuario_perfil u_pp_jt ON u_pp_jt.id_usuario = u.id INNER JOIN bas_perfil pp ON pp.id = u_pp_jt.id_perfil INNER JOIN bas_perfil_modulo pm ON pm.id_perfil = pp.id INNER JOIN bas_modulo m ON m.id = pm.id_modulo WHERE u.id = ?1 and (lower(m.rotulo) like '%' || ?2 || '%' OR lower(m.descricao) like '%' || ?2 || '%' OR CAST(m.id AS text) = ?2) AND NOT (m.outcome is null OR m.outcome = '') ORDER BY m.rotulo";

    public Uni<java.util.List<Modulo>> autoCompleteFavoritoUsuario(Long usuarioId, String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_FAVORITO_USUARIO, Modulo.class)
                    .setParameter(1, usuarioId)
                    .setParameter(2, query)
                    .getResultList());
    }

}
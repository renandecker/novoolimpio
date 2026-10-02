package br.com.sol7.olimpio.basico.perfil.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.perfil.entity.Perfil;

@ApplicationScoped
public class PerfilRepository implements PanacheRepository<Perfil> {

    // select p from Perfil p where lower(p.descricao) like '%' || ?1 || '%'  OR str(p.id) = ?1  order by p.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT p.* FROM bas_perfil p WHERE lower(p.descricao) like '%' || ?1 || '%' OR CAST(p.id AS text) = ?1 ORDER BY p.descricao";

    public Uni<java.util.List<Perfil>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Perfil.class)
                        .setParameter(1, query)
                        .getResultList());
    }

    public static final String SQL_LISTAR_PERFIS_POR_MODULO =
            "SELECT p.id FROM bas_perfil p INNER JOIN bas_perfil_modulo pm ON pm.id_perfil = p.id WHERE pm.id_modulo = ?1 ORDER BY p.descricao";

    public Uni<java.util.List<Long>> listarPerfisPorModulo(Long moduloId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_PERFIS_POR_MODULO)
                        .setParameter(1, moduloId)
                        .getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'perfisModulos' sem coluna mapeada)
    public static final String SQL_BUSCAR_PERFIL_MODULOS_COM_PERFIL_HQL_ORIGINAL =
            "select distinct p.perfisModulos from Perfil p join p.perfisModulos where p.id = ?1";


    // select distinct p.perfisModulos from Perfil p join p.perfisModulos where p.id = ?1
    public static final String SQL_BUSCAR_PERFIL_MODULOS_COM_PERFIL =
            "SELECT DISTINCT pm.id FROM bas_perfil_modulo pm WHERE pm.id_perfil = ?1";

    public Uni<java.util.List<Object>> buscarPerfilModulosComPerfil(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PERFIL_MODULOS_COM_PERFIL)
                        .setParameter(1, id)
                        .getResultList());
    }


    // select p from Perfil p left join fetch p.perfisModulos where p.id = ?1
    public static final String SQL_BUSCAR_PERFIL_COM_MODULOS =
            "SELECT p.* FROM bas_perfil p WHERE p.id = ?1";

    public Uni<java.util.List<Perfil>> buscarPerfilComModulos(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PERFIL_COM_MODULOS, Perfil.class)
                        .setParameter(1, id)
                        .getResultList());
    }


    // select distinct  u from Usuario usu inner join usu.perfis u where usu = ?1 order by u.descricao
    public static final String SQL_PERFILS_DO_USUARIO =
            "SELECT DISTINCT u.* FROM bas_usuario usu INNER JOIN bas_usuario_perfil usu_u_jt ON usu_u_jt.id_usuario = usu.id INNER JOIN bas_perfil u ON u.id = usu_u_jt.id_perfil WHERE usu.id = ?1 ORDER BY u.descricao";

    public Uni<java.util.List<Perfil>> perfilsDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_PERFILS_DO_USUARIO, Perfil.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // select u from Perfil u order by u.descricao
    public static final String SQL_AUTO_COMPLETE_ALL =
            "SELECT u.* FROM bas_perfil u ORDER BY u.descricao LIMIT 10";

    public Uni<java.util.List<Perfil>> autoCompleteAll() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALL, Perfil.class)

                        .getResultList());
    }


    // select distinct  u from Usuario usu inner join usu.perfis u where usu = ?2 and (lower(u.descricao) like '%' || ?1 || '%' OR str(u.id) = ?1) order by u.descricao
    public static final String SQL_AUTO_COMPLETE_COM_USUARIO =
            "SELECT DISTINCT u.* FROM bas_usuario usu INNER JOIN bas_usuario_perfil usu_u_jt ON usu_u_jt.id_usuario = usu.id INNER JOIN bas_perfil u ON u.id = usu_u_jt.id_perfil WHERE usu.id = ?2 and (lower(u.descricao) like '%' || ?1 || '%' OR CAST(u.id AS text) = ?1) ORDER BY u.descricao LIMIT 10";

    public Uni<java.util.List<Perfil>> autoCompleteComUsuario(String query, Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_USUARIO, Perfil.class)
                        .setParameter(1, query)
                        .setParameter(2, usuarioId)
                        .getResultList());
    }


    // select distinct  u from Usuario usu inner join usu.perfis u where usu = ?1 order by u.descricao
    public static final String SQL_AUTO_COMPLETE_DO_USUARIO =
            "SELECT DISTINCT u.* FROM bas_usuario usu INNER JOIN bas_usuario_perfil usu_u_jt ON usu_u_jt.id_usuario = usu.id INNER JOIN bas_perfil u ON u.id = usu_u_jt.id_perfil WHERE usu.id = ?1 ORDER BY u.descricao LIMIT 10";

    public Uni<java.util.List<Perfil>> autoCompleteDoUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_DO_USUARIO, Perfil.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }

}
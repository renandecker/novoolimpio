package br.com.sol7.olimpio.basico.rede.repository;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.rede.entity.Rede;
@ApplicationScoped public class RedeRepository implements PanacheRepository<Rede> {

    // Migrado de RedeRepository.autoComplete (legado) - HQL original:
    // select r from Rede r where lower(r.nomeFantasia) like '%' || ?1 || '%' OR lower(r.cnpj) like '%' || ?1 || '%' OR lower(r.razaoSocial) like '%' || ?1 || '%' OR str(r.id) = ?1 order by r.nomeFantasia
    public static final String SQL_AUTO_COMPLETE =
            "SELECT r.* FROM bas_rede r WHERE lower(r.nome_fantasia) like '%' || ?1 || '%' OR lower(r.cnpj) like '%' || ?1 || '%' OR lower(r.razao_social) like '%' || ?1 || '%' OR CAST(r.id AS text) = ?1 ORDER BY r.nome_fantasia LIMIT 10";

    public Uni<java.util.List<Rede>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Rede.class)
                    .setParameter(1, query)
                    .getResultList());
    }


    // Migrado de RedeRepository.existeFranquia (legado) - HQL original:
    // select r from Rede r inner join r.unidades u where u = ?1
    public static final String SQL_EXISTE_FRANQUIA =
            "SELECT r.* FROM bas_rede r INNER JOIN bas_rede_unidade r_u_jt ON r_u_jt.id_rede = r.id INNER JOIN bas_unidade u ON u.id = r_u_jt.id_unidade WHERE u.id = ?1 LIMIT 10";

    public Uni<java.util.List<Rede>> existeFranquia(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTE_FRANQUIA, Rede.class)
                    .setParameter(1, unidadeId)
                    .getResultList());
    }


    // Migrado de RedeRepository.existeUsuarioFranquia (legado) - HQL original:
    // select r from Rede r where r.usuario = ?1
    public static final String SQL_EXISTE_USUARIO_FRANQUIA =
            "SELECT r.* FROM bas_rede r WHERE r.id_usuario = ?1 LIMIT 10";

    public Uni<java.util.List<Rede>> existeUsuarioFranquia(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_EXISTE_USUARIO_FRANQUIA, Rede.class)
                    .setParameter(1, usuarioId)
                    .getResultList());
    }

}
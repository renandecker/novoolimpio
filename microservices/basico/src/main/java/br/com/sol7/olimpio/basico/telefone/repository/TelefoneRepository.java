package br.com.sol7.olimpio.basico.telefone.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.telefone.entity.Telefone;

@ApplicationScoped
public class TelefoneRepository implements PanacheRepository<Telefone> {

    // select t from Telefone t where lower(t.numero) like '%' || ?1 || '%' OR lower(str(t.operadora)) like '%' || ?1 || '%'  OR str(t.id) = ?1  order by t.operadora
    public static final String SQL_AUTO_COMPLETE =
            "SELECT t.* FROM bas_telefone t WHERE lower(t.numero) like '%' || ?1 || '%' OR lower(CAST(t.operadora AS text)) like '%' || ?1 || '%' OR CAST(t.id AS text) = ?1 ORDER BY t.operadora";

    public Uni<java.util.List<Telefone>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Telefone.class)
                        .setParameter(1, lowerCase)
                        .getResultList());
    }


    // select tl from Usuario u left join u.unidades un left join un.telefones tl where u = ?1 and tl is not null
    public static final String SQL_BUSCAR_TELEFONE_UNIDADE_POR_USUARIO =
            "SELECT tl.* FROM bas_usuario u LEFT JOIN bas_usuario_unidade u_un_jt ON u_un_jt.id_usuario = u.id LEFT JOIN bas_unidade un ON un.id = u_un_jt.id_unidade LEFT JOIN bas_unidade_telefone un_tl_jt ON un_tl_jt.id_unidade = un.id LEFT JOIN bas_telefone tl ON tl.id = un_tl_jt.id_telefone WHERE u.id = ?1 and tl is not null";

    public Uni<java.util.List<Telefone>> buscarTelefoneUnidadePorUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TELEFONE_UNIDADE_POR_USUARIO, Telefone.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }

}
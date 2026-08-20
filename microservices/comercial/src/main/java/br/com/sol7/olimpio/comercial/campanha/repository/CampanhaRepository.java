package br.com.sol7.olimpio.comercial.campanha;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class CampanhaRepository implements PanacheRepository<Campanha> {

    // Migrado de CampanhaRepository.buscarCampanhaComAcoes (legado) - HQL original:
    // select a from Campanha a left join fetch a.acoesDeCampanha where a.id = ?1
    public static final String SQL_BUSCAR_CAMPANHA_COM_ACOES =
            "SELECT a.* FROM com_campanha a WHERE a.id = ?1";

    public Uni<java.util.List<Campanha>> buscarCampanhaComAcoes(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CAMPANHA_COM_ACOES, Campanha.class)
                        .setParameter(1, id)
                        .getResultList());
    }


    // Migrado de CampanhaRepository.buscarCampanhaDaUnidade (legado) - HQL original:
    // Select distinct ca from Campanha ca inner join ca.unidades un inner join un.usuarios us where us in(?1)
    public static final String SQL_BUSCAR_CAMPANHA_DA_UNIDADE =
            "SELECT DISTINCT ca.* FROM com_campanha ca INNER JOIN com_campanha_unidade ca_un_jt ON ca_un_jt.id_campanha = ca.id INNER JOIN bas_unidade un ON un.id = ca_un_jt.id_unidade INNER JOIN bas_usuario_unidade un_us_jt ON un_us_jt.id_unidade = un.id INNER JOIN bas_usuario us ON us.id = un_us_jt.id_usuario WHERE us in(?1)";

    public Uni<java.util.List<Campanha>> buscarCampanhaDaUnidade(Long usuarioLogadoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CAMPANHA_DA_UNIDADE, Campanha.class)
                        .setParameter(1, usuarioLogadoId)
                        .getResultList());
    }


    // Migrado de CampanhaRepository.buscarCampanhaComUnidades (legado) - HQL original:
    // Select ca from Campanha ca left join fetch ca.unidades where ca = ?1
    public static final String SQL_BUSCAR_CAMPANHA_COM_UNIDADES =
            "SELECT ca.* FROM com_campanha ca WHERE ca.id = ?1";

    public Uni<java.util.List<Campanha>> buscarCampanhaComUnidades(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CAMPANHA_COM_UNIDADES, Campanha.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }

}
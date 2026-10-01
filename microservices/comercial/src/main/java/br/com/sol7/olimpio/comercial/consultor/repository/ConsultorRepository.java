package br.com.sol7.olimpio.comercial.consultor;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class ConsultorRepository implements PanacheRepository<Consultor> {

    // Select c from Consultor c left join fetch c.turnoTrabalhos where c = ?1
    public static final String SQL_BUSCAR_CONSULTOR_COM_TURNOS =
            "SELECT c.* FROM com_consultor c WHERE c.id = ?1";

    public Uni<java.util.List<Consultor>> buscarConsultorComTurnos(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONSULTOR_COM_TURNOS, Consultor.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Select c from Consultor c where c.usuario = ?1
    public static final String SQL_BUSCAR_USUARIO_NO_CONSULTOR =
            "SELECT c.* FROM com_consultor c WHERE c.id_usuario = ?1";

    public Uni<java.util.List<Consultor>> buscarUsuarioNoConsultor(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_USUARIO_NO_CONSULTOR, Consultor.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // select distinct c.usuario from Consultor c left join fetch c.usuario.unidades un where ( lower(c.usuario.login) like '%' || ?1 || '%' or str(c.usuario.id) = ?1 and c.usuario.ativo = true ) AND un in (?2) order by c.usuario.login
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE =
            "SELECT DISTINCT c.id_usuario FROM com_consultor c LEFT JOIN bas_usuario j_c_usuario ON j_c_usuario.id = c.id_usuario WHERE ( lower(j_c_usuario.login) like '%' || ?1 || '%' or CAST(j_c_usuario.id AS text) = ?1 and j_c_usuario.fl_ativo = true ) AND un in (?2) ORDER BY j_c_usuario.login";

    public Uni<java.util.List<Object>> autoCompleteComUnidade(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE)
                        .setParameter(1, query)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }

}
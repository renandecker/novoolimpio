package br.com.sol7.olimpio.central.turnotrabalho;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class TurnoTrabalhoRepository implements PanacheRepository<TurnoTrabalho> {

    // Migrado de TurnoTrabalhoRepository.autoCompleteTurnoTrabalho (legado) - HQL original:
    // select distinct t from TurnoTrabalho t inner join t.unidades un inner join un.usuarios us where us in (?2) AND lower(t.descricao) like '%' || ?1 || '%'  OR str(t.id) = ?1
    public static final String SQL_AUTO_COMPLETE_TURNO_TRABALHO =
            "SELECT DISTINCT t.* FROM cen_turno_trabalho t INNER JOIN cen_turno_trabalho_unidade t_un_jt ON t_un_jt.id_turno_trabalho = t.id INNER JOIN bas_unidade un ON un.id = t_un_jt.id_unidade INNER JOIN bas_usuario_unidade un_us_jt ON un_us_jt.id_unidade = un.id INNER JOIN bas_usuario us ON us.id = un_us_jt.id_usuario WHERE us in (?2) AND lower(t.descricao) like '%' || ?1 || '%' OR CAST(t.id AS text) = ?1";

    public Uni<java.util.List<TurnoTrabalho>> autoCompleteTurnoTrabalho(String query, Long usuarioLogadoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_TURNO_TRABALHO, TurnoTrabalho.class)
                        .setParameter(1, query)
                        .setParameter(2, usuarioLogadoId)
                        .getResultList());
    }


    // Migrado de TurnoTrabalhoRepository.buscarTurnosDaUnidade (legado) - HQL original:
    // select distinct t from TurnoTrabalho t inner join t.unidades un inner join un.usuarios us where us in (?1)
    public static final String SQL_BUSCAR_TURNOS_DA_UNIDADE =
            "SELECT DISTINCT t.* FROM cen_turno_trabalho t INNER JOIN cen_turno_trabalho_unidade t_un_jt ON t_un_jt.id_turno_trabalho = t.id INNER JOIN bas_unidade un ON un.id = t_un_jt.id_unidade INNER JOIN bas_usuario_unidade un_us_jt ON un_us_jt.id_unidade = un.id INNER JOIN bas_usuario us ON us.id = un_us_jt.id_usuario WHERE us in (?1)";

    public Uni<java.util.List<TurnoTrabalho>> buscarTurnosDaUnidade(Long usuarioLogadoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TURNOS_DA_UNIDADE, TurnoTrabalho.class)
                        .setParameter(1, usuarioLogadoId)
                        .getResultList());
    }


    // Migrado de TurnoTrabalhoRepository.buscarTurnoTrabalhoComUnidades (legado) - HQL original:
    // Select tu from TurnoTrabalho tu left join fetch tu.unidades where tu = ?1
    public static final String SQL_BUSCAR_TURNO_TRABALHO_COM_UNIDADES =
            "SELECT tu.* FROM cen_turno_trabalho tu WHERE tu.id = ?1";

    public Uni<java.util.List<TurnoTrabalho>> buscarTurnoTrabalhoComUnidades(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TURNO_TRABALHO_COM_UNIDADES, TurnoTrabalho.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Migrado de TurnoTrabalhoRepository.minTurno (legado) - HQL original:
    // select min(t.inicio) from TurnoTrabalho t
    public static final String SQL_MIN_TURNO =
            "SELECT min(t.inicio) FROM cen_turno_trabalho t";

    public Uni<java.util.List<Object>> minTurno() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MIN_TURNO)

                        .getResultList());
    }


    // Migrado de TurnoTrabalhoRepository.maxTurno (legado) - HQL original:
    // select max(t.fim) from TurnoTrabalho t
    public static final String SQL_MAX_TURNO =
            "SELECT max(t.fim) FROM cen_turno_trabalho t";

    public Uni<java.util.List<Object>> maxTurno() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MAX_TURNO)

                        .getResultList());
    }

}
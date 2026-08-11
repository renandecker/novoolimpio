package br.com.sol7.olimpio.basico.statuscompromisso.repository;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.statuscompromisso.entity.StatusCompromisso;
@ApplicationScoped public class StatusCompromissoRepository implements PanacheRepository<StatusCompromisso> {

    // Migrado de StatusCompromissoRepository.autoComplete (legado) - HQL original:
    // select s from StatusCompromisso s where lower(s.descricao) like '%' || ?1 || '%' OR str(s.id) = ?1  order by s.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT s.* FROM bas_status_compromisso s WHERE lower(s.descricao) like '%' || ?1 || '%' OR CAST(s.id AS text) = ?1 ORDER BY s.descricao";

    public Uni<java.util.List<StatusCompromisso>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, StatusCompromisso.class)
                    .setParameter(1, query)
                    .getResultList());
    }


    // Migrado de StatusCompromissoRepository.buscarStatusComModulo (legado) - HQL original:
    // Select a from StatusCompromisso a left join fetch a.statusModulos where a.id = ?1
    public static final String SQL_BUSCAR_STATUS_COM_MODULO =
            "SELECT a.* FROM bas_status_compromisso a WHERE a.id = ?1";

    public Uni<java.util.List<StatusCompromisso>> buscarStatusComModulo(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_STATUS_COM_MODULO, StatusCompromisso.class)
                    .setParameter(1, id)
                    .getResultList());
    }

}
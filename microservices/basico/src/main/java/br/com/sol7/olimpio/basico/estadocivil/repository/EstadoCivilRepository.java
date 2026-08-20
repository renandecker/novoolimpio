package br.com.sol7.olimpio.basico.estadocivil.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.estadocivil.entity.EstadoCivil;

@ApplicationScoped
public class EstadoCivilRepository implements PanacheRepository<EstadoCivil> {

    // Migrado de EstadoCivilRepository.autoComplete (legado) - HQL original:
    // select c from EstadoCivil c where  lower(c.descricao) like '%' || lower(?1) || '%'  OR  str(c.id) = ?1 order by c.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT c.* FROM bas_estado_civil c WHERE lower(c.descricao) like '%' || lower(?1) || '%' OR CAST(c.id AS text) = ?1 ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<EstadoCivil>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, EstadoCivil.class)
                        .setParameter(1, lowerCase)
                        .getResultList());
    }

    // Migrado de EstadoCivilRepository.autoComplete (legado) - HQL original:
    // select c from EstadoCivil c order by c.descricao
    public static final String SQL_AUTO_COMPLETE_ALL =
            "SELECT c.* FROM bas_estado_civil c ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<EstadoCivil>> autoCompleteAll() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ALL, EstadoCivil.class)
                        .getResultList());
    }

}
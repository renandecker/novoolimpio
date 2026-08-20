package br.com.sol7.olimpio.basico.motivo.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.motivo.entity.Motivo;

@ApplicationScoped
public class MotivoRepository implements PanacheRepository<Motivo> {

    // Migrado de MotivoRepository.autoComplete (legado) - HQL original:
    // select distinct  m from Motivo m where (lower(m.descricao) like '%' || ?1 || '%' or str(m.id) = ?1) and m.ativo = true order by m.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT m.* FROM bas_motivo m WHERE (lower(m.descricao) like '%' || ?1 || '%' or CAST(m.id AS text) = ?1) and m.ativo = true ORDER BY m.descricao";

    public Uni<java.util.List<Motivo>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Motivo.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Migrado de MotivoRepository.autoCompleteList (legado) - HQL original:
    // select distinct  m from Motivo m where m.ativo = true order by m.descricao
    public static final String SQL_AUTO_COMPLETE_LIST =
            "SELECT DISTINCT m.* FROM bas_motivo m WHERE m.ativo = true ORDER BY m.descricao LIMIT 10";

    public Uni<java.util.List<Motivo>> autoCompleteList() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_LIST, Motivo.class)

                        .getResultList());
    }

}
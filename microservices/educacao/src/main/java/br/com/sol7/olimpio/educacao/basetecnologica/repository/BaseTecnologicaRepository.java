package br.com.sol7.olimpio.educacao.basetecnologica;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class BaseTecnologicaRepository implements PanacheRepository<BaseTecnologica> {

    // Migrado de BaseTecnologicaRepository.autoComplete (legado) - HQL original:
    // select b from BaseTecnologica b where lower(b.nome) like '%' || ?1 || '%' OR lower(b.descricao) like '%' || ?1 || '%' OR str(b.id) = ?1 order by b.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT b.* FROM edc_base_tecnologica b WHERE lower(b.nome) like '%' || ?1 || '%' OR lower(b.descricao) like '%' || ?1 || '%' OR CAST(b.id AS text) = ?1 ORDER BY b.nome";

    public Uni<java.util.List<BaseTecnologica>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, BaseTecnologica.class)
                        .setParameter(1, query)
                        .getResultList());
    }

}
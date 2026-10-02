package br.com.sol7.olimpio.basico.compromisso.repository;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;

@ApplicationScoped
public class CompromissoPessoaStatusRepository {

    // select m from CompromissoPessoaStatus m where m.compromisso = ?1 order by m.id
    public static final String SQL_BUSCAR_PESSOA_STATUS_POR_COMPROMISSO =
            "SELECT cps.id, cps.id_compromisso, cps.id_status_anterior, cps.id_status_proximo, "
                    + "cps.id_pessoa, cps.id_usuario, cps.data "
                    + "FROM bas_compromisso_pessoa_status cps WHERE cps.id_compromisso = ?1 ORDER BY cps.id";

    public Uni<java.util.List<Tuple>> getCompromissoPessoaStatusByCompromisso(Long compromissoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PESSOA_STATUS_POR_COMPROMISSO, Tuple.class)
                        .setParameter(1, compromissoId)
                        .getResultList());
    }

}

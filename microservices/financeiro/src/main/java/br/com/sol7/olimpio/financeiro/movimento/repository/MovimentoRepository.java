package br.com.sol7.olimpio.financeiro.movimento;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class MovimentoRepository implements PanacheRepository<Movimento> {

    // select u from Movimento u where (lower(u.descricaocompleta) like '%' || ?1 || '%' or str(u.id) = ?1)  order by u.descricaocompleta
    public static final String SQL_AUTO_COMPLETE =
            "SELECT u.* FROM fin_movimento u WHERE (lower(u.descricaocompleta) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1) ORDER BY u.descricaocompleta LIMIT 10";

    public Uni<java.util.List<Movimento>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Movimento.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // select u from Movimento u where (lower(u.descricaocompleta) like '%' || ?1 || '%' or str(u.id) = ?1) and u.tipoMovimento = ?2 order by u.descricaocompleta
    public static final String SQL_AUTO_COMPLETE_COM_TIPO =
            "SELECT u.* FROM fin_movimento u WHERE (lower(u.descricaocompleta) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1) and u.id_tipo_movimento = ?2 ORDER BY u.descricaocompleta LIMIT 10";

    public Uni<java.util.List<Movimento>> autoCompleteComTipo(String query, Long tipoMovimentoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_TIPO, Movimento.class)
                        .setParameter(1, query)
                        .setParameter(2, tipoMovimentoId)
                        .getResultList());
    }

}
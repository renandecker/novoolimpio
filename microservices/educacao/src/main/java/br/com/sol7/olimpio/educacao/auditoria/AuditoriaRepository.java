package br.com.sol7.olimpio.educacao.auditoria;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class AuditoriaRepository {

    // Whitelist: tabelas _aud legadas (Envers) expostas na tela de auditoria.
    private static final Map<String, String> TABELAS = Map.of(
            "matricula", "public.edc_matricula_aud",
            "oferecimento", "public.edc_oferecimento_componente_curricular_aud");

    public boolean existeEntidade(String entidade) {
        return TABELAS.containsKey(entidade);
    }

    private String sqlLista(String tabela) {
        return "SELECT a.*, ba.\"timestamp\" AS \"rev_timestamp\", ba.username AS \"rev_usuario\", ba.action AS \"rev_action\""
                + " FROM " + tabela + " a"
                + " JOIN public.bas_auditoria ba ON ba.id = a.rev"
                + " ORDER BY ba.\"timestamp\" DESC, a.rev DESC, a.id DESC";
    }

    private String sqlConta(String tabela) {
        return "SELECT count(*) FROM " + tabela + " a"
                + " JOIN public.bas_auditoria ba ON ba.id = a.rev";
    }

    public Uni<List<Tuple>> listar(String entidade, int page, int size) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sqlLista(TABELAS.get(entidade)), Tuple.class)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList());
    }

    public Uni<Long> contar(String entidade) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery(sqlConta(TABELAS.get(entidade)))
                .getSingleResult())
                .map(resultado -> ((Number) resultado).longValue());
    }
}

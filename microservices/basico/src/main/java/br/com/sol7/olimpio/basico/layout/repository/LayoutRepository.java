package br.com.sol7.olimpio.basico.layout.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.layout.entity.Layout;

@ApplicationScoped
public class LayoutRepository implements PanacheRepository<Layout> {

    // Select c from Layout c where c.temaPadrao = true
    public static final String SQL_BUSCA_LAYOUT =
            "SELECT c.* FROM bas_layout c WHERE c.fl_default = true";

    public Uni<java.util.List<Layout>> buscaLayout() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_LAYOUT, Layout.class)

                        .getResultList());
    }


    // select distinct u from Layout u where (((lower(u.titulo) like '%' || ?1 || '%' OR lower(u.tema) like '%' || ?1 || '%'   OR str(u.id) = ?1) and ?1 <> '') or ?1 = '') order by u.titulo
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT u.* FROM bas_layout u WHERE (((lower(u.titulo) like '%' || ?1 || '%' OR lower(u.tema) like '%' || ?1 || '%' OR CAST(u.id AS text) = ?1) and ?1 <> '') or ?1 = '') ORDER BY u.titulo LIMIT 10";

    public Uni<java.util.List<Layout>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Layout.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Select c from Layout c where c.temaPadrao = true
    public static final String SQL_FIND_DEFAULT =
            "SELECT c.* FROM bas_layout c WHERE c.fl_default = true";

    public Uni<java.util.List<Layout>> findDefault() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_DEFAULT, Layout.class)

                        .getResultList());
    }


    // Select distinct r.layout from Rede r  inner join r.unidades u where u = ?1 and r.layout.temaPadrao = false
    public static final String SQL_TEMA_REDE =
            "SELECT DISTINCT r.id_layout FROM bas_rede r INNER JOIN bas_rede_unidade r_u_jt ON r_u_jt.id_rede = r.id INNER JOIN bas_unidade u ON u.id = r_u_jt.id_unidade LEFT JOIN bas_layout j_r_layout ON j_r_layout.id = r.id_layout WHERE u.id = ?1 and j_r_layout.fl_default = false LIMIT 10";

    public Uni<java.util.List<Object>> temaRede(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TEMA_REDE)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // Select u.layout from Unidade u where u = ?1 and u.layout.temaPadrao = false
    public static final String SQL_TEMA_UNIDADE =
            "SELECT u.id_tema FROM bas_unidade u LEFT JOIN bas_layout j_u_layout ON j_u_layout.id = u.id_tema WHERE u.id = ?1 and j_u_layout.fl_default = false LIMIT 10";

    public Uni<java.util.List<Object>> temaUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TEMA_UNIDADE)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }

}
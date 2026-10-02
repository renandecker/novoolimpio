package br.com.sol7.olimpio.relatorios.organograma.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import br.com.sol7.olimpio.relatorios.organograma.entity.Organograma;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Tuple;

@ApplicationScoped
public class OrganogramaRepository implements PanacheRepository<Organograma> {

    // select p from Organograma p where (lower(p.nome) like '%' || ?1 || '%' OR  str(p.id) = ?1) order by p.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT p.* FROM rel_organograma p WHERE (lower(p.nome) like '%' || ?1 || '%' OR CAST(p.id AS text) = ?1) ORDER BY p.nome LIMIT 10";

    public Uni<java.util.List<Organograma>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Organograma.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'unidades' sem coluna mapeada)
    public static final String SQL_BUSCAR_UNIDADES_HQL_ORIGINAL =
            "select a.unidades from Organograma a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'perfils' sem coluna mapeada)
    public static final String SQL_BUSCAR_PERFILS_HQL_ORIGINAL =
            "select a.perfils from Organograma a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'usuarios' sem coluna mapeada)
    public static final String SQL_BUSCAR_USUARIOS_HQL_ORIGINAL =
            "select a.usuarios from Organograma a where a = ?1";

    public Uni<List<Long>> listUsuarios(Long organogramaId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id_usuario AS id FROM rel_organograma_usuario WHERE id_organograma = :id ORDER BY id_usuario")
                .setParameter("id", organogramaId)
                .getResultList())
                .map(OrganogramaRepository::toLongs);
    }

    public Uni<List<Long>> listUnidades(Long organogramaId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id_unidade AS id FROM rel_organograma_unidade WHERE id_organograma = :id ORDER BY id_unidade")
                .setParameter("id", organogramaId)
                .getResultList())
                .map(OrganogramaRepository::toLongs);
    }

    public Uni<List<Long>> listPerfis(Long organogramaId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id_perfil AS id FROM rel_organograma_perfil WHERE id_organograma = :id ORDER BY id_perfil")
                .setParameter("id", organogramaId)
                .getResultList())
                .map(OrganogramaRepository::toLongs);
    }

    private static List<Long> toLongs(List<?> rows) {
        List<Long> out = new ArrayList<>();
        if (rows == null) return out;
        for (Object row : rows) {
            if (row instanceof Tuple t) {
                Object id = TupleHelper.get(t, "id");
                if (id != null) out.add(TupleHelper.toLong(id));
            } else if (row != null) {
                out.add(((Number) row).longValue());
            }
        }
        return out.stream().filter(Objects::nonNull).toList();
    }

}
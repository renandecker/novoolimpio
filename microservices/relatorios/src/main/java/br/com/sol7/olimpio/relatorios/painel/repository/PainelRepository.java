package br.com.sol7.olimpio.relatorios.painel.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import br.com.sol7.olimpio.relatorios.painel.entity.Painel;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Tuple;
import org.hibernate.reactive.mutiny.Mutiny;

@ApplicationScoped
public class PainelRepository implements PanacheRepository<Painel> {

    // select p from Tabela p where (lower(p.nome) like '%' || ?1 || '%' OR  str(p.id) = ?1) and  p.estrutura = ?2 order by p.nome
    // Obs: condicao removida (Painel nao possui coluna id_estrutura neste microsservico)
    public static final String SQL_AUTO_COMPLETE =
            "SELECT p.* FROM rel_painel p WHERE (lower(p.nome) like '%' || ?1 || '%' OR CAST(p.id AS text) = ?1) ORDER BY p.nome LIMIT 10";

    public Uni<java.util.List<Painel>> autoComplete(String query, Long estruturaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Painel.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'unidades' sem coluna mapeada)
    public static final String SQL_BUSCAR_UNIDADES_HQL_ORIGINAL =
            "select a.unidades from Painel a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'perfils' sem coluna mapeada)
    public static final String SQL_BUSCAR_PERFILS_HQL_ORIGINAL =
            "select a.perfils from Painel a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'usuarios' sem coluna mapeada)
    public static final String SQL_BUSCAR_USUARIOS_HQL_ORIGINAL =
            "select a.usuarios from Painel a where a = ?1";

    public Uni<List<Long>> listUsuarios(Long painelId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id AS id FROM rel_painel_usuario WHERE id_painel = :id ORDER BY id")
                .setParameter("id", painelId)
                .getResultList())
                .map(PainelRepository::toLongs);
    }

    public Uni<List<Long>> listUnidades(Long painelId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id AS id FROM rel_painel_unidade WHERE id_painel = :id ORDER BY id")
                .setParameter("id", painelId)
                .getResultList())
                .map(PainelRepository::toLongs);
    }

    public Uni<List<Long>> listPerfis(Long painelId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id AS id FROM rel_painel_perfil WHERE id_painel = :id ORDER BY id")
                .setParameter("id", painelId)
                .getResultList())
                .map(PainelRepository::toLongs);
    }

    public Uni<List<Long>> listFiltrosIds(Long painelId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id AS id FROM rel_filtro_painel WHERE id_painel = :id ORDER BY id")
                .setParameter("id", painelId)
                .getResultList())
                .map(PainelRepository::toLongs);
    }

    public Uni<Void> replacePermissoes(Long painelId, List<Long> usuariosIds, List<Long> unidadesIds, List<Long> perfisIds) {
        return Panache.getSession().chain(session -> {
            Uni<Integer> u = session.createNativeQuery("DELETE FROM rel_painel_usuario WHERE id_painel = :id").setParameter("id", painelId).executeUpdate();
            Uni<Integer> un = session.createNativeQuery("DELETE FROM rel_painel_unidade WHERE id_painel = :id").setParameter("id", painelId).executeUpdate();
            Uni<Integer> p = session.createNativeQuery("DELETE FROM rel_painel_perfil WHERE id_painel = :id").setParameter("id", painelId).executeUpdate();
            return Uni.combine().all().unis(u, un, p).asTuple().replaceWithVoid()
                    .flatMap(v -> insertPermissoes(session, painelId, nullSafe(usuariosIds), nullSafe(unidadesIds), nullSafe(perfisIds)))
                    .replaceWithVoid();
        });
    }

    private Uni<?> insertPermissoes(Mutiny.Session session, Long painelId, List<Long> usuariosIds,
                                    List<Long> unidadesIds, List<Long> perfisIds) {
        Uni<?> chain = Uni.createFrom().voidItem();
        for (Long id : usuariosIds) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_painel_usuario (id_painel, id_usuario) VALUES (:pid, :rid)")
                    .setParameter("pid", painelId).setParameter("rid", id)
                    .executeUpdate().replaceWithVoid());
        }
        for (Long id : unidadesIds) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_painel_unidade (id_painel, id_unidade) VALUES (:pid, :rid)")
                    .setParameter("pid", painelId).setParameter("rid", id)
                    .executeUpdate().replaceWithVoid());
        }
        for (Long id : perfisIds) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_painel_perfil (id_painel, id_perfil) VALUES (:pid, :rid)")
                    .setParameter("pid", painelId).setParameter("rid", id)
                    .executeUpdate().replaceWithVoid());
        }
        return chain;
    }

    public Uni<Void> replaceFiltros(Long painelId, List<Long> filtrosIds) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("DELETE FROM rel_filtro_painel WHERE id_painel = :id").setParameter("id", painelId).executeUpdate()
                        .flatMap(v -> insertFiltros(session, painelId, nullSafe(filtrosIds)))
                        .replaceWithVoid());
    }

    private Uni<?> insertFiltros(Mutiny.Session session, Long painelId, List<Long> filtrosIds) {
        Uni<?> chain = Uni.createFrom().voidItem();
        for (Long id : filtrosIds) {
            chain = chain.flatMap(v -> session
                    .createNativeQuery("INSERT INTO rel_filtro_painel (id_painel, id_filtro) VALUES (:pid, :rid)")
                    .setParameter("pid", painelId).setParameter("rid", id)
                    .executeUpdate().replaceWithVoid());
        }
        return chain;
    }

    public Uni<Void> deleteJoinByPainelId(Long painelId) {
        return Panache.getSession().chain(session -> {
            Uni<Integer> top = session.createNativeQuery("DELETE FROM rel_painel_topico WHERE id_painel = :id").setParameter("id", painelId).executeUpdate();
            Uni<Integer> usu = session.createNativeQuery("DELETE FROM rel_painel_usuario WHERE id_painel = :id").setParameter("id", painelId).executeUpdate();
            Uni<Integer> uni = session.createNativeQuery("DELETE FROM rel_painel_unidade WHERE id_painel = :id").setParameter("id", painelId).executeUpdate();
            Uni<Integer> per = session.createNativeQuery("DELETE FROM rel_painel_perfil WHERE id_painel = :id").setParameter("id", painelId).executeUpdate();
            Uni<Integer> fil = session.createNativeQuery("DELETE FROM rel_filtro_painel WHERE id_painel = :id").setParameter("id", painelId).executeUpdate();
            return Uni.combine().all().unis(top, usu, uni, per, fil).asTuple().replaceWithVoid();
        });
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

    private static List<Long> nullSafe(List<Long> list) {
        return list == null ? List.of() : list;
    }
}
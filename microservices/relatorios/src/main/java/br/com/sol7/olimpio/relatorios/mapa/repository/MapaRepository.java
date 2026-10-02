package br.com.sol7.olimpio.relatorios.mapa.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import br.com.sol7.olimpio.relatorios.mapa.entity.Mapa;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Tuple;

@ApplicationScoped
public class MapaRepository implements PanacheRepository<Mapa> {

    // select a from Mapa a where a.id = ?1
    public static final String SQL_BUSCAR_MAPA_PELO_ID =
            "SELECT a.* FROM rel_mapa a WHERE a.id = ?1";

    public Uni<java.util.List<Mapa>> buscarMapaPeloId(int id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MAPA_PELO_ID, Mapa.class)
                        .setParameter(1, id)
                        .getResultList());
    }


    // select a from Mapa a where a.estrutura = ?1
    public static final String SQL_BUSCAR_MAPS_PELO_FATO =
            "SELECT a.* FROM rel_mapa a WHERE a.id_estrutura = ?1";

    public Uni<java.util.List<Mapa>> buscarMapsPeloFato(Long fatoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MAPS_PELO_FATO, Mapa.class)
                        .setParameter(1, fatoId)
                        .getResultList());
    }


    // select p from Mapa p where (lower(p.nome) like '%' || ?1 || '%' OR  str(p.id) = ?1) and  p.estrutura = ?2 order by p.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT p.* FROM rel_mapa p WHERE (lower(p.nome) like '%' || ?1 || '%' OR CAST(p.id AS text) = ?1) and p.id_estrutura = ?2 ORDER BY p.nome LIMIT 10";

    public Uni<java.util.List<Mapa>> autoComplete(String query, Long estruturaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Mapa.class)
                        .setParameter(1, query)
                        .setParameter(2, estruturaId)
                        .getResultList());
    }


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'unidades' sem coluna mapeada)
    public static final String SQL_BUSCAR_UNIDADES_HQL_ORIGINAL =
            "select a.unidades from Mapa a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'perfils' sem coluna mapeada)
    public static final String SQL_BUSCAR_PERFILS_HQL_ORIGINAL =
            "select a.perfils from Mapa a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'usuarios' sem coluna mapeada)
    public static final String SQL_BUSCAR_USUARIOS_HQL_ORIGINAL =
            "select a.usuarios from Mapa a where a = ?1";

    public Uni<List<Long>> listUsuarios(Long mapaId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id_usuario AS id FROM rel_mapa_usuario WHERE id_mapa = :id ORDER BY id_usuario")
                .setParameter("id", mapaId)
                .getResultList())
                .map(MapaRepository::toLongs);
    }

    public Uni<List<Long>> listUnidades(Long mapaId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id_unidade AS id FROM rel_mapa_unidade WHERE id_mapa = :id ORDER BY id_unidade")
                .setParameter("id", mapaId)
                .getResultList())
                .map(MapaRepository::toLongs);
    }

    public Uni<List<Long>> listPerfis(Long mapaId) {
        return Panache.getSession().chain(session -> session
                .createNativeQuery("SELECT id_perfil AS id FROM rel_mapa_perfil WHERE id_mapa = :id ORDER BY id_perfil")
                .setParameter("id", mapaId)
                .getResultList())
                .map(MapaRepository::toLongs);
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
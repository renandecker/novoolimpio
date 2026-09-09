package br.com.sol7.olimpio.relatorios.mapa.repository;

import java.util.List;

import br.com.sol7.olimpio.relatorios.mapa.entity.Mapa;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class MapaRepository implements PanacheRepository<Mapa> {

    // Migrado de MapaRepository.buscarMapaPeloId (legado) - HQL original:
    // select a from Mapa a where a.id = ?1
    public static final String SQL_BUSCAR_MAPA_PELO_ID =
            "SELECT a.* FROM rel_mapa a WHERE a.id = ?1";

    public Uni<java.util.List<Mapa>> buscarMapaPeloId(int id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MAPA_PELO_ID, Mapa.class)
                        .setParameter(1, id)
                        .getResultList());
    }


    // Migrado de MapaRepository.buscarMapsPeloFato (legado) - HQL original:
    // select a from Mapa a where a.estrutura = ?1
    public static final String SQL_BUSCAR_MAPS_PELO_FATO =
            "SELECT a.* FROM rel_mapa a WHERE a.id_estrutura = ?1";

    public Uni<java.util.List<Mapa>> buscarMapsPeloFato(Long fatoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MAPS_PELO_FATO, Mapa.class)
                        .setParameter(1, fatoId)
                        .getResultList());
    }


    // Migrado de MapaRepository.autoComplete (legado) - HQL original:
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
    // Migrado de MapaRepository.buscarUnidades (legado) - HQL original:
    public static final String SQL_BUSCAR_UNIDADES_HQL_ORIGINAL =
            "select a.unidades from Mapa a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'perfils' sem coluna mapeada)
    // Migrado de MapaRepository.buscarPerfils (legado) - HQL original:
    public static final String SQL_BUSCAR_PERFILS_HQL_ORIGINAL =
            "select a.perfils from Mapa a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'usuarios' sem coluna mapeada)
    // Migrado de MapaRepository.buscarUsuarios (legado) - HQL original:
    public static final String SQL_BUSCAR_USUARIOS_HQL_ORIGINAL =
            "select a.usuarios from Mapa a where a = ?1";

}
package br.com.sol7.olimpio.relatorios.grafico;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class GraficoRepository implements PanacheRepository<Grafico> {

    // Migrado de GraficoRepository.autoComplete (legado) - HQL original:
    // select p from Grafico p where (lower(p.nome) like '%' || ?1 || '%' OR  str(p.id) = ?1) and  p.estrutura = ?2 order by p.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT p.* FROM rel_grafico p WHERE (lower(p.nome) like '%' || ?1 || '%' OR CAST(p.id AS text) = ?1) and p.id_estrutura = ?2 ORDER BY p.nome LIMIT 10";

    public Uni<java.util.List<Grafico>> autoComplete(String query, Long estruturaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Grafico.class)
                        .setParameter(1, query)
                        .setParameter(2, estruturaId)
                        .getResultList());
    }


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'unidades' sem coluna mapeada)
    // Migrado de GraficoRepository.buscarUnidades (legado) - HQL original:
    public static final String SQL_BUSCAR_UNIDADES_HQL_ORIGINAL =
            "select a.unidades from Grafico a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'perfils' sem coluna mapeada)
    // Migrado de GraficoRepository.buscarPerfils (legado) - HQL original:
    public static final String SQL_BUSCAR_PERFILS_HQL_ORIGINAL =
            "select a.perfils from Grafico a where a = ?1";


    // Migrado de GraficoRepository.buscarGraficoPeloFato (legado) - HQL original:
    // select a from Grafico a where a.estrutura = ?1
    public static final String SQL_BUSCAR_GRAFICO_PELO_FATO =
            "SELECT a.* FROM rel_grafico a WHERE a.id_estrutura = ?1";

    public Uni<java.util.List<Grafico>> buscarGraficoPeloFato(Long fatoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_GRAFICO_PELO_FATO, Grafico.class)
                        .setParameter(1, fatoId)
                        .getResultList());
    }


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'usuarios' sem coluna mapeada)
    // Migrado de GraficoRepository.buscarUsuarios (legado) - HQL original:
    public static final String SQL_BUSCAR_USUARIOS_HQL_ORIGINAL =
            "select a.usuarios from Grafico a where a = ?1";

}
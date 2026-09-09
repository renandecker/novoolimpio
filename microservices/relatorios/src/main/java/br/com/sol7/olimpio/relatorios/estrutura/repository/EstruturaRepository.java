package br.com.sol7.olimpio.relatorios.estrutura.repository;
import br.com.sol7.olimpio.relatorios.estrutura.entity.Estrutura;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class EstruturaRepository implements PanacheRepository<Estrutura> {

    // Migrado de EstruturaRepository.buscarEstruturas (legado) - HQL original:
    // select a from Estrutura a order by a.nome
    public static final String SQL_BUSCAR_ESTRUTURAS =
            "SELECT a.* FROM rel_estrutura a ORDER BY a.nome";

    public Uni<java.util.List<Estrutura>> buscarEstruturas() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_ESTRUTURAS, Estrutura.class)

                        .getResultList());
    }


    // Migrado de EstruturaRepository.buscarBancos (legado) - HQL original:
    // select a from Estrutura a where a.nomeBanco = ?1 order by a.id desc
    public static final String SQL_BUSCAR_BANCOS =
            "SELECT a.* FROM rel_estrutura a WHERE a.nome_banco = ?1 ORDER BY a.id desc";

    public Uni<java.util.List<Estrutura>> buscarBancos(String banco) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_BANCOS, Estrutura.class)
                        .setParameter(1, banco)
                        .getResultList());
    }


    // Migrado de EstruturaRepository.buscarBancosComId (legado) - HQL original:
    // select a from Estrutura a where a.nomeBanco = ?1 and a.id <> ?2 order by a.id desc
    public static final String SQL_BUSCAR_BANCOS_COM_ID =
            "SELECT a.* FROM rel_estrutura a WHERE a.nome_banco = ?1 and a.id <> ?2 ORDER BY a.id desc";

    public Uni<java.util.List<Estrutura>> buscarBancosComId(String banco, Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_BANCOS_COM_ID, Estrutura.class)
                        .setParameter(1, banco)
                        .setParameter(2, id)
                        .getResultList());
    }


    // Migrado de EstruturaRepository.autoComplete (legado) - HQL original:
    // select p from Estrutura p where lower(p.nome) like '%' || ?1 || '%' OR str(p.id) = ?1 order by p.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT p.* FROM rel_estrutura p WHERE lower(p.nome) like '%' || ?1 || '%' OR CAST(p.id AS text) = ?1 ORDER BY p.nome LIMIT 10";

    public Uni<java.util.List<Estrutura>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Estrutura.class)
                        .setParameter(1, query)
                        .getResultList());
    }

}
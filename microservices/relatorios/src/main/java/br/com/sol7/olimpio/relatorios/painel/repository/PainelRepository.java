package br.com.sol7.olimpio.relatorios.painel.repository;
import br.com.sol7.olimpio.relatorios.tabela.entity.Tabela;

import java.util.List;

import br.com.sol7.olimpio.relatorios.painel.entity.Painel;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class PainelRepository implements PanacheRepository<Painel> {

    // Migrado de PainelRepository.autoComplete (legado, metodo comentado) - HQL original:
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
    // Migrado de PainelRepository.buscarUnidades (legado) - HQL original:
    public static final String SQL_BUSCAR_UNIDADES_HQL_ORIGINAL =
            "select a.unidades from Painel a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'perfils' sem coluna mapeada)
    // Migrado de PainelRepository.buscarPerfils (legado) - HQL original:
    public static final String SQL_BUSCAR_PERFILS_HQL_ORIGINAL =
            "select a.perfils from Painel a where a = ?1";


    // NAO TRADUZIDA AUTOMATICAMENTE (campo 'usuarios' sem coluna mapeada)
    // Migrado de PainelRepository.buscarUsuarios (legado) - HQL original:
    public static final String SQL_BUSCAR_USUARIOS_HQL_ORIGINAL =
            "select a.usuarios from Painel a where a = ?1";

}
package br.com.sol7.olimpio.financeiro.configuracaoparcela;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class ConfiguracaoParcelaRepository implements PanacheRepository<ConfiguracaoParcela> {

    // Migrado de ConfiguracaoParcelaRepository.buscarConf (legado) - HQL original:
    // Select c from ConfiguracaoParcela c where c.unidade = ?1 order by c.id desc
    public static final String SQL_BUSCAR_CONF =
            "SELECT c.* FROM fin_configuracao_parcela c WHERE c.id_unidade = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<ConfiguracaoParcela>> buscarConf(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONF, ConfiguracaoParcela.class)
                    .setParameter(1, unidadeId)
                    .getResultList());
    }


    // Migrado de ConfiguracaoParcelaRepository.buscarConfComUnidades (legado) - HQL original:
    // Select c from ConfiguracaoParcela c where c.unidade in (?1) order by c.id desc
    public static final String SQL_BUSCAR_CONF_COM_UNIDADES =
            "SELECT c.* FROM fin_configuracao_parcela c WHERE c.id_unidade in (?1) ORDER BY c.id desc";

    public Uni<java.util.List<ConfiguracaoParcela>> buscarConfComUnidades(List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONF_COM_UNIDADES, ConfiguracaoParcela.class)
                    .setParameter(1, unidadeIds)
                    .getResultList());
    }


    // Migrado de ConfiguracaoParcelaRepository.buscarConfComUnidadesNotCancelamento (legado) - HQL original:
    // Select c from ConfiguracaoParcela c left join fetch c.cancelamentos where c.unidade not in (?1) order by c.id desc
    public static final String SQL_BUSCAR_CONF_COM_UNIDADES_NOT_CANCELAMENTO =
            "SELECT c.* FROM fin_configuracao_parcela c WHERE c.id_unidade not in (?1) ORDER BY c.id desc";

    public Uni<java.util.List<ConfiguracaoParcela>> buscarConfComUnidadesNotCancelamento(List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONF_COM_UNIDADES_NOT_CANCELAMENTO, ConfiguracaoParcela.class)
                    .setParameter(1, unidadeIds)
                    .getResultList());
    }

}
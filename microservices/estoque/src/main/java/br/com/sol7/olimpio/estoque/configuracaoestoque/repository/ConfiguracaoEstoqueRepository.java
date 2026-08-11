package br.com.sol7.olimpio.estoque.configuracaoestoque;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class ConfiguracaoEstoqueRepository implements PanacheRepository<ConfiguracaoEstoque> {

    // Migrado de ConfiguracaoEstoqueRepository.buscarConfiguracaoComUnidadeUsuario (legado) - HQL original:
    // Select c from ConfiguracaoEstoque c where  c.unidade = ?1 order by c.id desc
    public static final String SQL_BUSCAR_CONFIGURACAO_COM_UNIDADE_USUARIO =
            "SELECT c.* FROM est_configuracao_estoque c WHERE c.id_unidade = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<ConfiguracaoEstoque>> buscarConfiguracaoComUnidadeUsuario(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFIGURACAO_COM_UNIDADE_USUARIO, ConfiguracaoEstoque.class)
                    .setParameter(1, unidadeId)
                    .getResultList());
    }


    // Migrado de ConfiguracaoEstoqueRepository.buscarCentral (legado) - HQL original:
    // Select c from ConfiguracaoEstoque c where c.central = true order by c.id desc
    public static final String SQL_BUSCAR_CENTRAL =
            "SELECT c.* FROM est_configuracao_estoque c WHERE c.fl_estoque_central = true ORDER BY c.id desc";

    public Uni<java.util.List<ConfiguracaoEstoque>> buscarCentral() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CENTRAL, ConfiguracaoEstoque.class)

                    .getResultList());
    }

}
package br.com.sol7.olimpio.estoque.controleestoque;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class ControleEstoqueRepository implements PanacheRepository<ControleEstoque> {

    // Migrado de ControleEstoqueRepository.buscarExistenciaProduto (legado) - HQL original:
    // Select c from ControleEstoque c where c.unidade = ?1 AND c.produto = ?2
    public static final String SQL_BUSCAR_EXISTENCIA_PRODUTO =
            "SELECT c.* FROM est_controle_estoque c WHERE c.id_unidade = ?1 AND c.id_produto = ?2";

    public Uni<java.util.List<ControleEstoque>> buscarExistenciaProduto(Long unidadeId, Long produtoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_EXISTENCIA_PRODUTO, ControleEstoque.class)
                    .setParameter(1, unidadeId)
                    .setParameter(2, produtoId)
                    .getResultList());
    }


    // Migrado de ControleEstoqueRepository.buscarItenUnidade (legado) - HQL original:
    // Select c from ControleEstoque c where c.unidade = ?1 order by c.produto.id
    public static final String SQL_BUSCAR_ITEN_UNIDADE =
            "SELECT c.* FROM est_controle_estoque c LEFT JOIN est_produto j_c_produto ON j_c_produto.id = c.id_produto WHERE c.id_unidade = ?1 ORDER BY j_c_produto.id";

    public Uni<java.util.List<ControleEstoque>> buscarItenUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_ITEN_UNIDADE, ControleEstoque.class)
                    .setParameter(1, unidadeId)
                    .getResultList());
    }


    // Migrado de ControleEstoqueRepository.buscarProdutoEstoque (legado) - HQL original:
    // Select c from ControleEstoque c where c.id = ?1
    public static final String SQL_BUSCAR_PRODUTO_ESTOQUE =
            "SELECT c.* FROM est_controle_estoque c WHERE c.id = ?1";

    public Uni<java.util.List<ControleEstoque>> buscarProdutoEstoque(int codigo) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PRODUTO_ESTOQUE, ControleEstoque.class)
                    .setParameter(1, codigo)
                    .getResultList());
    }


    // Migrado de ControleEstoqueRepository.autoComplete (legado) - HQL original:
    // select distinct ce from ControleEstoque ce inner join ce.produto p left join p.produtoCampos lc where ce.unidade = ?2  and (lower(lc.valor) like '%' || ?1 || '%' OR (p.id) like '%' || ?1 || '%')
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT ce.* FROM est_controle_estoque ce INNER JOIN est_produto p ON p.id = ce.id_produto LEFT JOIN est_produto_campo_informacao lc ON lc.id_produto = p.id WHERE ce.id_unidade = ?2 and (lower(lc.valor) like '%' || ?1 || '%' OR (p.id) like '%' || ?1 || '%') LIMIT 10";

    public Uni<java.util.List<ControleEstoque>> autoComplete(String query, Long unidadesId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, ControleEstoque.class)
                    .setParameter(1, query)
                    .setParameter(2, unidadesId)
                    .getResultList());
    }


    // Migrado de ControleEstoqueRepository.autoCompleteComUnidade (legado) - HQL original:
    // select  p from ControleEstoque p  where p.unidade = ?1 order by p.produto.id
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE =
            "SELECT p.* FROM est_controle_estoque p LEFT JOIN est_produto j_p_produto ON j_p_produto.id = p.id_produto WHERE p.id_unidade = ?1 ORDER BY j_p_produto.id";

    public Uni<java.util.List<ControleEstoque>> autoCompleteComUnidade(Long unidadesId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE, ControleEstoque.class)
                    .setParameter(1, unidadesId)
                    .getResultList());
    }

}
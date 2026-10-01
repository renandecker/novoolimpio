package br.com.sol7.olimpio.estoque.produto;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ProdutoRepository implements PanacheRepository<Produto> {

    // select p from Produto p left join fetch p.unidades where p = ?1
    public static final String SQL_CARREGAR_UNIDADE =
            "SELECT p.* FROM est_produto p WHERE p.id = ?1";

    public Uni<java.util.List<Produto>> carregarUnidade(Long produtoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CARREGAR_UNIDADE, Produto.class)
                        .setParameter(1, produtoId)
                        .getResultList());
    }


    // select p from Produto p left join fetch p.fornecedores where p = ?1
    public static final String SQL_CARREGAR_FORNECEDOR =
            "SELECT p.* FROM est_produto p WHERE p.id = ?1";

    public Uni<java.util.List<Produto>> carregarFornecedor(Long produtoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CARREGAR_FORNECEDOR, Produto.class)
                        .setParameter(1, produtoId)
                        .getResultList());
    }


    // Select distinct p from ControleEstoque c inner join c.produto p where c.id = ?1
    public static final String SQL_BUSCAR_PRODUTO_ESTOQUE =
            "SELECT DISTINCT p.* FROM est_controle_estoque c INNER JOIN est_produto p ON p.id = c.id_produto WHERE c.id = ?1";

    public Uni<java.util.List<Produto>> buscarProdutoEstoque(int codigo) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PRODUTO_ESTOQUE, Produto.class)
                        .setParameter(1, codigo)
                        .getResultList());
    }


    // select distinct p from Produto p left join p.produtoCampos lc where (lower(lc.valor) like '%' || ?1 || '%' OR (p.id) like '%' || ?1 || '%')
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT p.* FROM est_produto p LEFT JOIN est_produto_campo_informacao lc ON lc.id_produto = p.id WHERE (lower(lc.valor) like '%' || ?1 || '%' OR (p.id) like '%' || ?1 || '%') LIMIT 10";

    public Uni<java.util.List<Produto>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Produto.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // select p from Produto p left join fetch p.produtoCampos where p = ?1
    public static final String SQL_CARREGAR_CAMPOS =
            "SELECT p.* FROM est_produto p WHERE p.id = ?1";

    public Uni<java.util.List<Produto>> carregarCampos(Long livroId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CARREGAR_CAMPOS, Produto.class)
                        .setParameter(1, livroId)
                        .getResultList());
    }

}
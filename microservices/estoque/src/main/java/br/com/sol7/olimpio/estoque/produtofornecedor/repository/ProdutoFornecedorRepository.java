package br.com.sol7.olimpio.estoque.produtofornecedor;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class ProdutoFornecedorRepository implements PanacheRepository<ProdutoFornecedor> {

    public Uni<List<ProdutoFornecedor>> listByProduto(Long produtoId) {
        return find("produtoId", produtoId).list();
    }

    public Uni<Void> add(Long produtoId, Long fornecedorId) {
        return find("produtoId = ?1 and fornecedorId = ?2", produtoId, fornecedorId).firstResult()
                .chain(existing -> {
                    if (existing != null) {
                        return Uni.createFrom().voidItem();
                    }
                    var e = new ProdutoFornecedor();
                    e.produtoId = produtoId;
                    e.fornecedorId = fornecedorId;
                    return persist(e).replaceWithVoid();
                });
    }

    public Uni<Void> remove(Long produtoId, Long fornecedorId) {
        return delete("produtoId = ?1 and fornecedorId = ?2", produtoId, fornecedorId).replaceWithVoid();
    }
}

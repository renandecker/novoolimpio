package br.com.sol7.olimpio.estoque.produtounidade;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class ProdutoUnidadeRepository implements PanacheRepository<ProdutoUnidade> {

    public Uni<List<ProdutoUnidade>> listByProduto(Long produtoId) {
        return find("produtoId", produtoId).list();
    }

    public Uni<Void> add(Long produtoId, Long unidadeId) {
        return find("produtoId = ?1 and unidadeId = ?2", produtoId, unidadeId).firstResult()
                .chain(existing -> {
                    if (existing != null) {
                        return Uni.createFrom().voidItem();
                    }
                    var e = new ProdutoUnidade();
                    e.produtoId = produtoId;
                    e.unidadeId = unidadeId;
                    return persist(e).replaceWithVoid();
                });
    }

    public Uni<Void> remove(Long produtoId, Long unidadeId) {
        return delete("produtoId = ?1 and unidadeId = ?2", produtoId, unidadeId).replaceWithVoid();
    }
}

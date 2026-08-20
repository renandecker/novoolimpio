package br.com.sol7.olimpio.estoque.produtounidade;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ProdutoUnidadeService {

    @Inject
    ProdutoUnidadeRepository repository;

    public Uni<List<Long>> listUnidadeIdsByProduto(Long produtoId) {
        return repository.listByProduto(produtoId).map(list -> list.stream().map(x -> x.unidadeId).toList());
    }

    public Uni<Void> add(Long produtoId, Long unidadeId) {
        return repository.add(produtoId, unidadeId);
    }

    public Uni<Void> remove(Long produtoId, Long unidadeId) {
        return repository.remove(produtoId, unidadeId);
    }
}

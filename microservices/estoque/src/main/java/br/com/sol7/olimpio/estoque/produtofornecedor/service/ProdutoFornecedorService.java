package br.com.sol7.olimpio.estoque.produtofornecedor;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ProdutoFornecedorService {

    @Inject
    ProdutoFornecedorRepository repository;

    public Uni<List<Long>> listFornecedorIdsByProduto(Long produtoId) {
        return repository.listByProduto(produtoId).map(list -> list.stream().map(x -> x.fornecedorId).toList());
    }

    public Uni<Void> add(Long produtoId, Long fornecedorId) {
        return repository.add(produtoId, fornecedorId);
    }

    public Uni<Void> remove(Long produtoId, Long fornecedorId) {
        return repository.remove(produtoId, fornecedorId);
    }
}

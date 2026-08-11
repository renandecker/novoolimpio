package br.com.sol7.olimpio.estoque.produtocampoinformacao;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class ProdutoCampoInformacaoRepository implements PanacheRepository<ProdutoCampoInformacao> {

    public Uni<List<ProdutoCampoInformacao>> listByProduto(Long produtoId) {
        return find("produtoId = ?1", produtoId).list();
    }
}

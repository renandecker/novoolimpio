package br.com.sol7.olimpio.estoque.vendaproduto;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class VendaProdutoRepository implements PanacheRepository<VendaProduto> {}
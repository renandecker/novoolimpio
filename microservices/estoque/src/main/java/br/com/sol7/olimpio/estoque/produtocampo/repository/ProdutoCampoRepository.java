package br.com.sol7.olimpio.estoque.produtocampo;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProdutoCampoRepository implements PanacheRepository<ProdutoCampo> {
}

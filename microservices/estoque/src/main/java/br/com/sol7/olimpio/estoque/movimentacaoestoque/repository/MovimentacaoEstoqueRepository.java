package br.com.sol7.olimpio.estoque.movimentacaoestoque;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MovimentacaoEstoqueRepository implements PanacheRepository<MovimentacaoEstoque> {}

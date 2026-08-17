package br.com.sol7.olimpio.relatorios.tabela.repository;

import br.com.sol7.olimpio.relatorios.tabela.entity.TabelaColuna;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TabelaColunaRepository implements PanacheRepository<TabelaColuna> {}

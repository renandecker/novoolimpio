package br.com.sol7.olimpio.financeiro.pagamentocartao.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.financeiro.pagamentocartao.entity.PagamentoCartao;

@ApplicationScoped
public class PagamentoCartaoRepository implements PanacheRepository<PagamentoCartao> {
}

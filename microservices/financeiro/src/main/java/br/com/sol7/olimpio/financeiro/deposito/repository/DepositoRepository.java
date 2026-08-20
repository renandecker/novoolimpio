package br.com.sol7.olimpio.financeiro.deposito.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.financeiro.deposito.entity.Deposito;

@ApplicationScoped
public class DepositoRepository implements PanacheRepository<Deposito> {
}

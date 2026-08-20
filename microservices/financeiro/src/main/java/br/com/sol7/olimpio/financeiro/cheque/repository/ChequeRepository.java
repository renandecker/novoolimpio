package br.com.sol7.olimpio.financeiro.cheque.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.financeiro.cheque.entity.Cheque;

@ApplicationScoped
public class ChequeRepository implements PanacheRepository<Cheque> {
}

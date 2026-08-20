package br.com.sol7.olimpio.financeiro.contacorrente;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ContaCorrenteRepository implements PanacheRepository<ContaCorrente> {
}
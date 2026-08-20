package br.com.sol7.olimpio.financeiro.boleto.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.financeiro.boleto.entity.Boleto;

@ApplicationScoped
public class BoletoRepository implements PanacheRepository<Boleto> {
}

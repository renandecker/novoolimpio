package br.com.sol7.olimpio.financeiro.transferencia.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.financeiro.transferencia.entity.Transferencia;

@ApplicationScoped
public class TransferenciaRepository implements PanacheRepository<Transferencia> {
}

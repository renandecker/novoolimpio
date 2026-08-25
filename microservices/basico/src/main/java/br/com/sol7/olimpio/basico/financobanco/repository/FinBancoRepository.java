package br.com.sol7.olimpio.basico.financobanco.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.financobanco.entity.FinBanco;

@ApplicationScoped
public class FinBancoRepository implements PanacheRepository<FinBanco> {
}

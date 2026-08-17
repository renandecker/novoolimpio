package br.com.sol7.olimpio.pagamento.parcela.repository;

import br.com.sol7.olimpio.pagamento.parcela.entity.Parcela;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ParcelaRepository implements PanacheRepository<Parcela> {
}

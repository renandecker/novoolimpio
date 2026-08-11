package br.com.sol7.olimpio.pagamento.pix.repository;

import br.com.sol7.olimpio.pagamento.pix.entity.ParcelaPix;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ParcelaPixRepository implements PanacheRepository<ParcelaPix> {
}

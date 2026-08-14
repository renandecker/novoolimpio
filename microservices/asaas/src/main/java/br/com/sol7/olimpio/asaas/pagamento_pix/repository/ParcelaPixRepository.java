package br.com.sol7.olimpio.asaas.pagamento_pix.repository;

import br.com.sol7.olimpio.asaas.pagamento_pix.entity.ParcelaPix;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ParcelaPixRepository implements PanacheRepository<ParcelaPix> {
}

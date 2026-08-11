package br.com.sol7.olimpio.pagamento.parcelacartao.repository;

import br.com.sol7.olimpio.pagamento.parcelacartao.entity.ParcelaCartao;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ParcelaCartaoRepository implements PanacheRepository<ParcelaCartao> {
}

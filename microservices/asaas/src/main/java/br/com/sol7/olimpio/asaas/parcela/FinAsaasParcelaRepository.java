package br.com.sol7.olimpio.asaas.parcela;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class FinAsaasParcelaRepository implements PanacheRepository<FinAsaasParcela> {

    public Uni<FinAsaasParcela> findByAsaasId(String asaasId) {
        return find("asaasId", asaasId).firstResult();
    }

    public Uni<Long> countByAsaasId(String asaasId) {
        return count("asaasId", asaasId);
    }
}

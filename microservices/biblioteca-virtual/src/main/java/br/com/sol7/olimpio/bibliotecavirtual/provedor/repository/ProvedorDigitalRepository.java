package br.com.sol7.olimpio.bibliotecavirtual.provedor.repository;

import br.com.sol7.olimpio.bibliotecavirtual.provedor.entity.ProvedorDigital;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class ProvedorDigitalRepository implements PanacheRepository<ProvedorDigital> {

    public Uni<List<ProvedorDigital>> findAllAtivos() {
        return list("flAtivo = true order by nome");
    }

    public Uni<ProvedorDigital> findByNome(String nome) {
        return find("nome = ?1 and flAtivo = true", nome).firstResult();
    }
}
package br.com.sol7.olimpio.basico.feriado.repository;

import br.com.sol7.olimpio.basico.feriado.entity.FeriadoAjuste;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class FeriadoAjusteRepository implements PanacheRepository<FeriadoAjuste> {

    public Uni<FeriadoAjuste> findByIdWithDetails(Long id) {
        return find("id", id).firstResult();
    }

    public Uni<List<FeriadoAjuste>> listAllWithDetails() {
        return listAll();
    }

    public Uni<Long> countAll() {
        return count();
    }
}
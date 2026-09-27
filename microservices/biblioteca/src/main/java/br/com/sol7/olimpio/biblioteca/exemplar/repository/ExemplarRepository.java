package br.com.sol7.olimpio.biblioteca.exemplar.repository;

import br.com.sol7.olimpio.biblioteca.exemplar.entity.Exemplar;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class ExemplarRepository implements PanacheRepository<Exemplar> {

    public Uni<List<Exemplar>> findByObraId(Long obraId) {
        return list("obra.id = ?1 and flAtivo = true", obraId);
    }

    public Uni<List<Exemplar>> findByStatus(Exemplar.StatusExemplar status) {
        return list("status = ?1 and flAtivo = true", status);
    }

    public Uni<List<Exemplar>> findDisponiveisByObraId(Long obraId) {
        return list("obra.id = ?1 and status = ?2 and flAtivo = true", obraId, Exemplar.StatusExemplar.DISPONIVEL);
    }

    public Uni<Exemplar> findByCodigoBarras(String codigoBarras) {
        return find("codigoBarras = ?1 and flAtivo = true", codigoBarras).firstResult();
    }

    public Uni<Exemplar> findByTombo(String tombo) {
        return find("tombo = ?1 and flAtivo = true", tombo).firstResult();
    }
}
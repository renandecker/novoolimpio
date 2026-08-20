package br.com.sol7.olimpio.professor.nota.repository;

import br.com.sol7.olimpio.professor.nota.entity.GrauNota;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class GrauNotaRepository implements PanacheRepository<GrauNota> {

    public Uni<List<GrauNota>> findByGrau(Long grauId) {
        return find("grauId", grauId).list();
    }
}

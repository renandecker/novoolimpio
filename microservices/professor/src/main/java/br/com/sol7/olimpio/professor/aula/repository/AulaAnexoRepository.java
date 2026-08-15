package br.com.sol7.olimpio.professor.aula.repository;

import br.com.sol7.olimpio.professor.aula.entity.AulaAnexo;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class AulaAnexoRepository implements PanacheRepository<AulaAnexo> {

    public Uni<List<AulaAnexo>> anexosDaAula(Long aulaId) {
        return list("aulaId", aulaId);
    }
}

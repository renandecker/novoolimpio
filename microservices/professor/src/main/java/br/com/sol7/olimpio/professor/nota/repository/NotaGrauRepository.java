package br.com.sol7.olimpio.professor.nota.repository;
import br.com.sol7.olimpio.professor.nota.entity.NotaGrau;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import java.util.List;
@ApplicationScoped public class NotaGrauRepository implements PanacheRepository<NotaGrau> {

    public Uni<List<NotaGrau>> findByGrauNota(Long grauNotaId) {
        return find("grauNotaId", grauNotaId).list();
    }
}

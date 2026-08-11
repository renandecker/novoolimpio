package br.com.sol7.olimpio.professor.nota.repository;
import br.com.sol7.olimpio.professor.nota.entity.NotaMatricula;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import java.util.List;
@ApplicationScoped public class NotaMatriculaRepository implements PanacheRepository<NotaMatricula> {

    public Uni<List<NotaMatricula>> findByOferecimento(Long oferecimentoComponenteCurricularId) {
        return find("oferecimentoComponenteCurricularId", oferecimentoComponenteCurricularId).list();
    }

    public Uni<List<NotaMatricula>> findByMatricula(Long matriculaId) {
        return find("matriculaId", matriculaId).list();
    }
}

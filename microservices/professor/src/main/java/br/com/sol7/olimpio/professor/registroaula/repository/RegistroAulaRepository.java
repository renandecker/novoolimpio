package br.com.sol7.olimpio.professor.registroaula.repository;
import br.com.sol7.olimpio.professor.registroaula.entity.RegistroAula;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import java.util.List;
@ApplicationScoped public class RegistroAulaRepository implements PanacheRepository<RegistroAula> {

    public Uni<List<RegistroAula>> findByOcorrencia(Long ocorrenciaComponenteCurricularId) {
        return find("ocorrenciaComponenteCurricularId", ocorrenciaComponenteCurricularId).list();
    }
}

package br.com.sol7.olimpio.professor.cadernochamada.repository;
import br.com.sol7.olimpio.professor.cadernochamada.entity.CadernoComponenteCurricular;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import java.util.List;
@ApplicationScoped public class CadernoComponenteCurricularRepository implements PanacheRepository<CadernoComponenteCurricular> {

    public Uni<List<CadernoComponenteCurricular>> findByOcorrencia(Long ocorrenciaComponenteCurricularId) {
        return find("ocorrenciaComponenteCurricularId", ocorrenciaComponenteCurricularId).list();
    }

    public Uni<CadernoComponenteCurricular> findByMatriculaAndOcorrencia(Long matriculaId, Long ocorrenciaComponenteCurricularId) {
        return find("matriculaId = ?1 and ocorrenciaComponenteCurricularId = ?2", matriculaId, ocorrenciaComponenteCurricularId).firstResult();
    }
}

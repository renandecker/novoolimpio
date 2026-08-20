package br.com.sol7.olimpio.professor.aula.repository;

import br.com.sol7.olimpio.professor.aula.entity.Aula;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class AulaRepository implements PanacheRepository<Aula> {

    @SuppressWarnings("unchecked")
    private <T> Uni<List<T>> nativeList(String sql, Object... params) {
        return Panache.getSession().onItem().transformToUni(session -> {
            var query = session.createNativeQuery(sql);
            for (int i = 0; i < params.length; i++) query.setParameter(i + 1, params[i]);
            return query.getResultList();
        }).map(list -> (List<T>) list);
    }

    public Uni<List<Object[]>> ocorrenciasDoOferecimento(Long oferecimentoId) {
        String sql = "" "
        SELECT occ.id, occ.data, COALESCE(occ.aula_coringa, false) AS aula_coringa,
        COALESCE(occ.aula_presencial, false) AS aula_presencial
        FROM edc_ocorrencia_componente_curricular occ
        WHERE occ.id_oferecimento_componente_curricular = ?1 AND occ.fl_ativo = true
        ORDER BY occ.data
        "" ";
        return nativeList(sql, oferecimentoId);
    }

    public Uni<List<Aula>> aulasDaOcorrencia(Long ocorrenciaId) {
        return list("ocorrenciaComponenteCurricularId", ocorrenciaId);
    }
}

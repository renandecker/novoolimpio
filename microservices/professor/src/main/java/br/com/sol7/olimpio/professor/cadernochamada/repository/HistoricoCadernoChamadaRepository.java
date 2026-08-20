package br.com.sol7.olimpio.professor.cadernochamada.repository;

import br.com.sol7.olimpio.professor.cadernochamada.entity.HistoricoCadernoChamada;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class HistoricoCadernoChamadaRepository implements PanacheRepository<HistoricoCadernoChamada> {

    public Uni<List<HistoricoCadernoChamada>> findByOcorrencia(Long ocorrenciaComponenteCurricularId) {
        return find("ocorrenciaComponenteCurricularId", ocorrenciaComponenteCurricularId).list();
    }
}

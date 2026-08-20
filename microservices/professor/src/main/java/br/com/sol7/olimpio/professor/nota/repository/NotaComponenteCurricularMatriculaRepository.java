package br.com.sol7.olimpio.professor.nota.repository;

import br.com.sol7.olimpio.professor.nota.entity.NotaComponenteCurricularMatricula;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class NotaComponenteCurricularMatriculaRepository implements PanacheRepository<NotaComponenteCurricularMatricula> {

    public Uni<List<NotaComponenteCurricularMatricula>> findByMatricula(Long matriculaId) {
        return find("matriculaId", matriculaId).list();
    }
}

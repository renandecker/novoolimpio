package br.com.sol7.olimpio.professor.nota.repository;

import br.com.sol7.olimpio.professor.nota.entity.Nota;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class NotaRepository implements PanacheRepository<Nota> {

    public Uni<List<Nota>> findByNotaComponenteCurricularMatricula(Long notaComponenteCurricularMatriculaId) {
        return find("notaComponenteCurricularMatriculaId", notaComponenteCurricularMatriculaId).list();
    }
}

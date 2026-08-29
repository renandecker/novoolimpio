package br.com.sol7.olimpio.educacao.disponibilidadeprofessor;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class DisponibilidadeProfessorRepository implements PanacheRepository<DisponibilidadeProfessor> {

    public Uni<List<DisponibilidadeProfessor>> findByProfessorId(Long professorId) {
        return find("professorId", professorId).list();
    }

    public Uni<List<DisponibilidadeProfessor>> findByUnidadeId(Long unidadeId) {
        return find("unidadeId", unidadeId).list();
    }

    public Uni<List<DisponibilidadeProfessor>> findByUnidadeIdAndProfessorId(Long unidadeId, Long professorId) {
        return find("unidadeId = ?1 and professorId = ?2", unidadeId, professorId).list();
    }
}
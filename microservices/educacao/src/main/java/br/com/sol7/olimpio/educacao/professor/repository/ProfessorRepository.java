package br.com.sol7.olimpio.educacao.professor;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class ProfessorRepository implements PanacheRepository<Professor> {

    // Select distinct p from Professor p inner join p.disponibilidadesProfessor dp inner join p.componentesCurriculares c where c in (?1) and d.unidade = ?2 and d.professor.ativo = true
    public static final String SQL_BUSCAR_LISTA_PROFESSORES_PARA_TURMA =
            "SELECT DISTINCT p.* FROM edc_professor p " +
                    "INNER JOIN edc_disponibilidade_professor dp ON dp.id_professor = p.id " +
                    "INNER JOIN edc_professor_componente_curricular pc ON pc.id_professor = p.id " +
                    "WHERE pc.id_componente_curricular = ?1 AND dp.id_unidade = ?2 AND p.ativo = true";

    public Uni<java.util.List<Professor>> buscarListaProfessoresParaTurma(Long componenteCurricularId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_LISTA_PROFESSORES_PARA_TURMA, Professor.class)
                        .setParameter(1, componenteCurricularId)
                        .setParameter(2, unidadeId)
                        .getResultList());
    }

}

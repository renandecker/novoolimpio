package br.com.sol7.olimpio.professor.professor.repository;
import br.com.sol7.olimpio.professor.professor.entity.Professor;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import java.util.List;
import java.util.Date;
@ApplicationScoped public class ProfessorRepository implements PanacheRepository<Professor> {

    public static final String SQL_AUTO_COMPLETE_PROFESSOR_FISICA =
            "SELECT DISTINCT p.* FROM edc_professor p INNER JOIN edc_professor_unidade dp ON dp.id_professor = p.id LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_p_pessoa_pessoaFisica ON j_j_p_pessoa_pessoaFisica.id_pessoa = j_p_pessoa.id WHERE dp.id_unidade in (?2) and (lower(j_j_p_pessoa_pessoaFisica.nome) like '%' || ?1 || '%' OR (j_j_p_pessoa_pessoaFisica.cpf) like '%' || ?1 || '%') and p.fl_ativo = true LIMIT 10";

    public Uni<List<Professor>> autoCompleteProfessorFisica(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_PROFESSOR_FISICA, Professor.class)
                    .setParameter(1, query)
                    .setParameter(2, unidadesIds)
                    .getResultList());
    }

    public static final String SQL_AUTO_COMPLETE_PROFESSOR_JURIDICA =
            "SELECT DISTINCT p.* FROM edc_professor p INNER JOIN edc_professor_unidade dp ON dp.id_professor = p.id LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa LEFT JOIN bas_pessoa_juridica j_j_p_pessoa_pessoaJuridica ON j_j_p_pessoa_pessoaJuridica.id_pessoa = j_p_pessoa.id WHERE dp.id_unidade in (?2) and (lower(j_j_p_pessoa_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' OR (j_j_p_pessoa_pessoaJuridica.cnpj) like '%' || ?1 || '%') and p.fl_ativo = true LIMIT 10";

    public Uni<List<Professor>> autoCompleteProfessorJuridica(String query, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_PROFESSOR_JURIDICA, Professor.class)
                    .setParameter(1, query)
                    .setParameter(2, unidadesIds)
                    .getResultList());
    }

    public static final String SQL_AUTO_COMPLETE_PROFESSOR =
            "SELECT p.id, COALESCE(pf.nome, pj.nome_fantasia, '') AS nome FROM edc_professor p " +
            "LEFT JOIN bas_pessoa pes ON pes.id = p.id_pessoa " +
            "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
            "LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = pes.id " +
            "WHERE p.fl_ativo = true AND (lower(COALESCE(pf.nome, '')) like '%' || ?1 || '%' " +
            "OR lower(COALESCE(pj.nome_fantasia, '')) like '%' || ?1 || '%' " +
            "OR pf.cpf like '%' || ?1 || '%' OR pj.cnpj like '%' || ?1 || '%') " +
            "ORDER BY lower(COALESCE(pf.nome, pj.nome_fantasia, '')) LIMIT 20";

    public Uni<List<Object>> autoCompleteProfessor(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_PROFESSOR)
                    .setParameter(1, query)
                    .getResultList());
    }

    public static final String SQL_AUTO_COMPLETE_PROFESSOR_FISICA_COM_COMPONENTE_UNIDADE =
            "SELECT DISTINCT p.* FROM edc_professor_unidade d INNER JOIN edc_professor p ON p.id = d.id_professor INNER JOIN edc_professor_componente_curricular p_c_jt ON p_c_jt.id_professor = p.id INNER JOIN edc_componente_curricular c ON c.id = p_c_jt.id_componente_curricular LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa LEFT JOIN bas_pessoa_fisica j_j_p_pessoa_pessoaFisica ON j_j_p_pessoa_pessoaFisica.id_pessoa = j_p_pessoa.id WHERE c.id = ?2 and d.id_unidade = ?3 and (lower(j_j_p_pessoa_pessoaFisica.nome) like '%' || ?1 || '%' OR (j_j_p_pessoa_pessoaFisica.cpf) like '%' || ?1 || '%') and p.fl_ativo = true LIMIT 10";

    public Uni<List<Professor>> autoCompleteProfessorFisicaComComponenteUnidade(String query, Long componenteCurricularId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_PROFESSOR_FISICA_COM_COMPONENTE_UNIDADE, Professor.class)
                    .setParameter(1, query)
                    .setParameter(2, componenteCurricularId)
                    .setParameter(3, unidadeId)
                    .getResultList());
    }

    public static final String SQL_AUTO_COMPLETE_PROFESSOR_JURIDICA_COM_COMPONENTE_UNIDADE =
            "SELECT DISTINCT p.* FROM edc_professor_unidade d INNER JOIN edc_professor p ON p.id = d.id_professor INNER JOIN edc_professor_componente_curricular p_c_jt ON p_c_jt.id_professor = p.id INNER JOIN edc_componente_curricular c ON c.id = p_c_jt.id_componente_curricular LEFT JOIN bas_pessoa j_p_pessoa ON j_p_pessoa.id = p.id_pessoa LEFT JOIN bas_pessoa_juridica j_j_p_pessoa_pessoaJuridica ON j_j_p_pessoa_pessoaJuridica.id_pessoa = j_p_pessoa.id WHERE c.id = ?2 and d.id_unidade = ?3 and (lower(j_j_p_pessoa_pessoaJuridica.nome_fantasia) like '%' || ?1 || '%' OR (j_j_p_pessoa_pessoaJuridica.cnpj) like '%' || ?1 || '%') and p.fl_ativo = true LIMIT 10";

    public Uni<List<Professor>> autoCompleteProfessorJuridicaComComponenteUnidade(String query, Long componenteCurricularId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_PROFESSOR_JURIDICA_COM_COMPONENTE_UNIDADE, Professor.class)
                    .setParameter(1, query)
                    .setParameter(2, componenteCurricularId)
                    .setParameter(3, unidadeId)
                    .getResultList());
    }

    public static final String SQL_BUSCAR_PROFESSOR_COM_UNIDADES =
            "SELECT p.* FROM edc_professor p WHERE p.id = ?1";

    public Uni<List<Professor>> buscarProfessorComUnidades(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PROFESSOR_COM_UNIDADES, Professor.class)
                    .setParameter(1, entityId)
                    .getResultList());
    }

    public static final String SQL_BUSCAR_DISPONIBILIDADE_COM_DIA_SEMANA =
            "SELECT dp.* FROM edc_professor_unidade dp WHERE dp.id_professor = ?1";

    public Uni<List<br.com.sol7.olimpio.professor.disponibilidade.entity.DisponibilidadeProfessor>> buscarDisponibilidadeComDiaSemana(Long professorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_DISPONIBILIDADE_COM_DIA_SEMANA, br.com.sol7.olimpio.professor.disponibilidade.entity.DisponibilidadeProfessor.class)
                    .setParameter(1, professorId)
                    .getResultList());
    }

    public static final String SQL_LISTAR_PROFESSORES_DAS_UNIDADES =
            "SELECT DISTINCT p.* FROM edc_professor p INNER JOIN edc_professor_unidade dp ON dp.id_professor = p.id WHERE dp.id_unidade in ?1 LIMIT 10";

    public Uni<List<Professor>> listarProfessoresDasUnidades(List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_PROFESSORES_DAS_UNIDADES, Professor.class)
                    .setParameter(1, unidadesIds)
                    .getResultList());
    }

    public static final String SQL_BUSCAR_PROFESSOR_COM_COMPONENTE_CURRICULAR =
            "SELECT p.* FROM edc_professor p WHERE p.id = ?1";

    public Uni<List<Professor>> buscarProfessorComComponenteCurricular(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PROFESSOR_COM_COMPONENTE_CURRICULAR, Professor.class)
                    .setParameter(1, entityId)
                    .getResultList());
    }

    public static final String SQL_IS_PROFESSOR =
            "SELECT count(p) FROM edc_professor p WHERE p.id_pessoa = ?1 and p.fl_ativo = true";

    public Uni<List<Object>> isProfessor(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_IS_PROFESSOR)
                    .setParameter(1, pessoaId)
                    .getResultList());
    }

    public static final String SQL_SOU_PROFESSOR =
            "SELECT p.* FROM edc_professor p WHERE p.id_pessoa = ?1 and p.fl_ativo = true";

    public Uni<List<Professor>> souProfessor(Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_SOU_PROFESSOR, Professor.class)
                    .setParameter(1, pessoaId)
                    .getResultList());
    }

    public static final String SQL_BUSCAR_LISTA_PROFESSORES_PARA_TURMA =
            "SELECT DISTINCT p.* FROM edc_professor_unidade d INNER JOIN edc_professor p ON p.id = d.id_professor INNER JOIN edc_professor_componente_curricular p_c_jt ON p_c_jt.id_professor = p.id INNER JOIN edc_componente_curricular c ON c.id = p_c_jt.id_componente_curricular LEFT JOIN edc_professor j_d_professor ON j_d_professor.id = d.id_professor WHERE c in (?1) and d.id_unidade = ?2 and j_d_professor.fl_ativo = true";

    public Uni<List<Professor>> buscarListaProfessoresParaTurma(Long componenteCurricularId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_LISTA_PROFESSORES_PARA_TURMA, Professor.class)
                    .setParameter(1, componenteCurricularId)
                    .setParameter(2, unidadeId)
                    .getResultList());
    }

    public static final String SQL_PROFESSOR_COM_UNIDADES =
            "SELECT DISTINCT p.* FROM edc_professor p INNER JOIN bas_pessoa pes ON pes.id = p.id_pessoa INNER JOIN bas_pessoa_unidade pes_u_jt ON pes_u_jt.id_pessoa = pes.id INNER JOIN bas_unidade u ON u.id = pes_u_jt.id_unidade WHERE u.id = ?1 and p.fl_ativo = true ORDER BY p.id desc";

    public Uni<List<Professor>> professorComUnidades(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_PROFESSOR_COM_UNIDADES, Professor.class)
                    .setParameter(1, unidadeId)
                    .getResultList());
    }

    public static final String SQL_BUSCAR_PROFESSOR_POR_UNIDADES =
            "SELECT DISTINCT p.* FROM edc_professor p INNER JOIN bas_pessoa pes ON pes.id = p.id_pessoa INNER JOIN bas_pessoa_unidade pes_u_jt ON pes_u_jt.id_pessoa = pes.id INNER JOIN bas_unidade u ON u.id = pes_u_jt.id_unidade WHERE u in (?1) and p.fl_ativo = true ORDER BY p.id desc";

    public Uni<List<Professor>> buscarProfessorPorUnidades(List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PROFESSOR_POR_UNIDADES, Professor.class)
                    .setParameter(1, unidadeIds)
                    .getResultList());
    }

}

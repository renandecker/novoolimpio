package br.com.sol7.olimpio.educacao.curriculo;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class CurriculoRepository implements PanacheRepository<Curriculo> {

    // Migrado de CurriculoRepository.autoComplete (legado) - HQL original:
    // select c from Curriculo c where  (lower(c.descricao) like '%' || ?1 || '%'  OR lower(c.sucinto) like '%' || ?1 || '%'  OR  lower(c.curso.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1)  AND (c.dataCancelamento > current_date  or c.dataCancelamento is null) order by c.curso.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT c.* FROM edc_curriculo c LEFT JOIN edc_curso j_c_curso ON j_c_curso.id = c.id_curso WHERE (lower(c.descricao) like '%' || ?1 || '%' OR lower(c.sucinto) like '%' || ?1 || '%' OR lower(j_c_curso.nome) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1) AND (c.data_cancelamento > current_date or c.data_cancelamento is null) ORDER BY j_c_curso.nome LIMIT 10";

    public Uni<java.util.List<Curriculo>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Curriculo.class)
                        .setParameter(1, lowerCase)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.autoCompleteComUnidades (legado) - HQL original:
    // Select distinct c from Curriculo c inner join c.unidades un where  (lower(c.descricao) like '%' || ?1 || '%'  OR lower(c.sucinto) like '%' || ?1 || '%'  OR  lower(c.curso.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1)  AND (c.dataCancelamento > current_date or c.dataCancelamento is null) and un in (?2)
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADES =
            "SELECT DISTINCT c.* FROM edc_curriculo c INNER JOIN edc_curriculo_unidade c_un_jt ON c_un_jt.id_curriculo = c.id INNER JOIN bas_unidade un ON un.id = c_un_jt.id_unidade LEFT JOIN edc_curso j_c_curso ON j_c_curso.id = c.id_curso WHERE (lower(c.descricao) like '%' || ?1 || '%' OR lower(c.sucinto) like '%' || ?1 || '%' OR lower(j_c_curso.nome) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1) AND (c.data_cancelamento > current_date or c.data_cancelamento is null) and un in (?2) LIMIT 10";

    public Uni<java.util.List<Curriculo>> autoCompleteComUnidades(String lowerCase, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADES, Curriculo.class)
                        .setParameter(1, lowerCase)
                        .setParameter(2, unidadesIds)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.autoCompleteComUnidade (legado) - HQL original:
    // Select distinct c from Curriculo c inner join c.unidades un where  (lower(c.descricao) like '%' || ?1 || '%'  OR lower(c.sucinto) like '%' || ?1 || '%'  OR  lower(c.curso.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1)  AND (c.dataCancelamento > current_date or c.dataCancelamento is null) and un = ?2
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADE =
            "SELECT DISTINCT c.* FROM edc_curriculo c INNER JOIN edc_curriculo_unidade c_un_jt ON c_un_jt.id_curriculo = c.id INNER JOIN bas_unidade un ON un.id = c_un_jt.id_unidade LEFT JOIN edc_curso j_c_curso ON j_c_curso.id = c.id_curso WHERE (lower(c.descricao) like '%' || ?1 || '%' OR lower(c.sucinto) like '%' || ?1 || '%' OR lower(j_c_curso.nome) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1) AND (c.data_cancelamento > current_date or c.data_cancelamento is null) and un.id = ?2 LIMIT 10";

    public Uni<java.util.List<Curriculo>> autoCompleteComUnidade(String lowerCase, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADE, Curriculo.class)
                        .setParameter(1, lowerCase)
                        .setParameter(2, unidadeId)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.buscarCursoComUnidades (legado) - HQL original:
    // Select c from Curriculo c left join fetch c.unidades where c = ?1
    public static final String SQL_BUSCAR_CURSO_COM_UNIDADES =
            "SELECT c.* FROM edc_curriculo c WHERE c.id = ?1";

    public Uni<java.util.List<Curriculo>> buscarCursoComUnidades(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CURSO_COM_UNIDADES, Curriculo.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.cursoComUnidades (legado) - HQL original:
    // Select distinct c from Curriculo c left join fetch c.unidades un where (c.dataCancelamento > current_date  or c.dataCancelamento is null) and un in (?1)
    public static final String SQL_CURSO_COM_UNIDADES =
            "SELECT DISTINCT c.* FROM edc_curriculo c LEFT JOIN edc_curriculo_unidade c_un_jt ON c_un_jt.id_curriculo = c.id LEFT JOIN bas_unidade un ON un.id = c_un_jt.id_unidade WHERE (c.data_cancelamento > current_date or c.data_cancelamento is null) and un in (?1)";

    public Uni<java.util.List<Curriculo>> cursoComUnidades(List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CURSO_COM_UNIDADES, Curriculo.class)
                        .setParameter(1, unidadesIds)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.buscarCursoComMatrizCurriculares (legado) - HQL original:
    // Select c from Curriculo c left join fetch c.matrizCurriculares m where c = ?1 order by m.ordem
    public static final String SQL_BUSCAR_CURSO_COM_MATRIZ_CURRICULARES =
            "SELECT c.* FROM edc_curriculo c LEFT JOIN edc_matriz_curricular m ON m.id_curriculo = c.id WHERE c.id = ?1 ORDER BY m.ordem";

    public Uni<java.util.List<Curriculo>> buscarCursoComMatrizCurriculares(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CURSO_COM_MATRIZ_CURRICULARES, Curriculo.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.buscarCursosDaUnidade (legado) - HQL original:
    // Select c from Curriculo c left join c.unidades u where u in (?1) AND (c.dataCancelamento > current_date  or c.dataCancelamento is null)
    public static final String SQL_BUSCAR_CURSOS_DA_UNIDADE =
            "SELECT c.* FROM edc_curriculo c LEFT JOIN edc_curriculo_unidade c_u_jt ON c_u_jt.id_curriculo = c.id LEFT JOIN bas_unidade u ON u.id = c_u_jt.id_unidade WHERE u in (?1) AND (c.data_cancelamento > current_date or c.data_cancelamento is null)";

    public Uni<java.util.List<Curriculo>> buscarCursosDaUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CURSOS_DA_UNIDADE, Curriculo.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.unidadesCurso (legado) - HQL original:
    // select distinct c from Curriculo c inner join c.unidades u where u in (?1) and (c.dataCancelamento > current_date  or c.dataCancelamento is null)
    public static final String SQL_UNIDADES_CURSO =
            "SELECT DISTINCT c.* FROM edc_curriculo c INNER JOIN edc_curriculo_unidade c_u_jt ON c_u_jt.id_curriculo = c.id INNER JOIN bas_unidade u ON u.id = c_u_jt.id_unidade WHERE u in (?1) and (c.data_cancelamento > current_date or c.data_cancelamento is null) LIMIT 10";

    public Uni<java.util.List<Curriculo>> unidadesCurso(List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_UNIDADES_CURSO, Curriculo.class)
                        .setParameter(1, unidadeIds)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.unidadesCursorematricula (legado) - HQL original:
    // select distinct c from Curriculo c inner join c.unidades u where u in (?1) and (c.dataCancelamento > current_date  or c.dataCancelamento is null) and  exists (select o from Matricula mat join mat.oferecimentoComponenteCurricular o  where c = mat.contrato.curriculo and o.unidade.ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') and (mat.status = 'CANCELADO' or mat.status = 'FINALIZADA') and mat.contrato.pessoa = ?2)
    public static final String SQL_UNIDADES_CURSOREMATRICULA =
            "SELECT DISTINCT c.* FROM edc_curriculo c INNER JOIN edc_curriculo_unidade c_u_jt ON c_u_jt.id_curriculo = c.id INNER JOIN bas_unidade u ON u.id = c_u_jt.id_unidade WHERE u in (?1) and (c.data_cancelamento > current_date or c.data_cancelamento is null) and exists (select o from Matricula mat join mat.oferecimentoComponenteCurricular o where c.id = mat.contrato.curriculo and o.unidade.ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') and (mat.status = 'CANCELADO' or mat.status = 'FINALIZADA') and mat.contrato.pessoa = ?2) LIMIT 10";

    public Uni<java.util.List<Curriculo>> unidadesCursorematricula(List<Long> unidadeIds, Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_UNIDADES_CURSOREMATRICULA, Curriculo.class)
                        .setParameter(1, unidadeIds)
                        .setParameter(2, pessoaId)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.autoCompleteComUnidadesrematricula (legado) - HQL original:
    // Select distinct c from Curriculo c inner join c.unidades un where  (lower(c.descricao) like '%' || ?1 || '%'  OR lower(c.sucinto) like '%' || ?1 || '%'  OR  lower(c.curso.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1)  AND (c.dataCancelamento > current_date or c.dataCancelamento is null) and un in (?2) and exists (select o from Matricula mat join mat.oferecimentoComponenteCurricular o  where c = mat.contrato.curriculo and o.unidade.ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') and (mat.status = 'CANCELADO' or mat.status = 'FINALIZADA') and mat.contrato.pessoa = ?3)
    public static final String SQL_AUTO_COMPLETE_COM_UNIDADESREMATRICULA =
            "SELECT DISTINCT c.* FROM edc_curriculo c INNER JOIN edc_curriculo_unidade c_un_jt ON c_un_jt.id_curriculo = c.id INNER JOIN bas_unidade un ON un.id = c_un_jt.id_unidade LEFT JOIN edc_curso j_c_curso ON j_c_curso.id = c.id_curso WHERE (lower(c.descricao) like '%' || ?1 || '%' OR lower(c.sucinto) like '%' || ?1 || '%' OR lower(j_c_curso.nome) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1) AND (c.data_cancelamento > current_date or c.data_cancelamento is null) and un in (?2) and exists (select o from Matricula mat join mat.oferecimentoComponenteCurricular o where c.id = mat.contrato.curriculo and o.unidade.ativo = true and (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') and (mat.status = 'CANCELADO' or mat.status = 'FINALIZADA') and mat.contrato.pessoa = ?3) LIMIT 10";

    public Uni<java.util.List<Curriculo>> autoCompleteComUnidadesrematricula(String lowerCase, List<Long> unidadesIds, Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_UNIDADESREMATRICULA, Curriculo.class)
                        .setParameter(1, lowerCase)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, pessoaId)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.unidadeCurso (legado) - HQL original:
    // select distinct c from Curriculo c inner join c.unidades u where u = ?1
    public static final String SQL_UNIDADE_CURSO =
            "SELECT DISTINCT c.* FROM edc_curriculo c INNER JOIN edc_curriculo_unidade c_u_jt ON c_u_jt.id_curriculo = c.id INNER JOIN bas_unidade u ON u.id = c_u_jt.id_unidade WHERE u.id = ?1 LIMIT 10";

    public Uni<java.util.List<Curriculo>> unidadeCurso(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_UNIDADE_CURSO, Curriculo.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.curriculoComUnidades (legado) - HQL original:
    // select distinct c from Curriculo c inner join c.unidades u where u = ?1 order by c.id desc
    public static final String SQL_CURRICULO_COM_UNIDADES =
            "SELECT DISTINCT c.* FROM edc_curriculo c INNER JOIN edc_curriculo_unidade c_u_jt ON c_u_jt.id_curriculo = c.id INNER JOIN bas_unidade u ON u.id = c_u_jt.id_unidade WHERE u.id = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<Curriculo>> curriculoComUnidades(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CURRICULO_COM_UNIDADES, Curriculo.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }


    // Migrado de CurriculoRepository.buscarCurriculoPorUnidades (legado) - HQL original:
    // select distinct c from Curriculo c inner join c.unidades u where u in (?1) order by c.id desc
    public static final String SQL_BUSCAR_CURRICULO_POR_UNIDADES =
            "SELECT DISTINCT c.* FROM edc_curriculo c INNER JOIN edc_curriculo_unidade c_u_jt ON c_u_jt.id_curriculo = c.id INNER JOIN bas_unidade u ON u.id = c_u_jt.id_unidade WHERE u in (?1) ORDER BY c.id desc";

    public Uni<java.util.List<Curriculo>> buscarCurriculoPorUnidades(List<Long> unidadeIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CURRICULO_POR_UNIDADES, Curriculo.class)
                        .setParameter(1, unidadeIds)
                        .getResultList());
    }

}
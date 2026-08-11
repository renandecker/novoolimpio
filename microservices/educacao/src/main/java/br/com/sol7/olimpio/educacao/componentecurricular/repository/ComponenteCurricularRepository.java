package br.com.sol7.olimpio.educacao.componentecurricular;
import java.util.List;
import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricular;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class ComponenteCurricularRepository implements PanacheRepository<ComponenteCurricular> {

    // Migrado de ComponenteCurricularRepository.componenteCurricularDoCurso (legado) - HQL original:
    // select mc.componenteCurricular from MatrizCurricular mc where mc.curriculo = ?1 order by mc.componenteCurricular.descricao
    public static final String SQL_COMPONENTE_CURRICULAR_DO_CURSO =
            "SELECT mc.id_componente_curricular FROM edc_matriz_curricular mc LEFT JOIN edc_componente_curricular j_mc_componenteCurricular ON j_mc_componenteCurricular.id = mc.id_componente_curricular WHERE mc.id_curriculo = ?1 ORDER BY j_mc_componenteCurricular.descricao";

    public Uni<java.util.List<Object>> componenteCurricularDoCurso(Long curriculoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_COMPONENTE_CURRICULAR_DO_CURSO)
                    .setParameter(1, curriculoId)
                    .getResultList());
    }


    // Migrado de ComponenteCurricularRepository.autocomplete (legado) - HQL original:
    // select c from ComponenteCurricular c where lower(c.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1 or lower(c.sucinto) like '%' || ?1 || '%' order by c.descricao
    public static final String SQL_AUTOCOMPLETE =
            "SELECT c.* FROM edc_componente_curricular c WHERE lower(c.descricao) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1 or lower(c.sucinto) like '%' || ?1 || '%' ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<ComponenteCurricular>> autocomplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTOCOMPLETE, ComponenteCurricular.class)
                    .setParameter(1, query)
                    .getResultList());
    }


    // Migrado de ComponenteCurricularRepository.autocompleteComponenteAtivoProfessor (legado) - HQL original:
    // select distinct ofc from OcorrenciaComponenteCurricular occ inner join  occ.oferecimentoComponenteCurricular ofc inner join ofc.componenteCurricular c where (lower(c.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1 or lower(c.sucinto) like '%' || ?1 || '%')  and occ.ativo = true AND occ.professor.pessoa = ?2 AND ofc.status = 'EM_ANDAMENTO' order by ofc.id
    public static final String SQL_AUTOCOMPLETE_COMPONENTE_ATIVO_PROFESSOR =
            "SELECT DISTINCT ofc.* FROM edc_ocorrencia_componente_curricular occ INNER JOIN edc_oferecimento_componente_curricular ofc ON ofc.id = occ.id_oferecimento_componente_curricular INNER JOIN edc_componente_curricular c ON c.id = ofc.id_componente_curricular LEFT JOIN edc_professor j_occ_professor ON j_occ_professor.id = occ.id_professor WHERE (lower(c.descricao) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1 or lower(c.sucinto) like '%' || ?1 || '%') and occ.fl_ativo = true AND j_occ_professor.id_pessoa = ?2 AND ofc.status = 'EM_ANDAMENTO' ORDER BY ofc.id LIMIT 10";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> autocompleteComponenteAtivoProfessor(String query, Long professorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTOCOMPLETE_COMPONENTE_ATIVO_PROFESSOR, OferecimentoComponenteCurricular.class)
                    .setParameter(1, query)
                    .setParameter(2, professorId)
                    .getResultList());
    }


    // Migrado de ComponenteCurricularRepository.autocompleteComponenteAtivo (legado) - HQL original:
    // select distinct ofc from OcorrenciaComponenteCurricular occ inner join  occ.oferecimentoComponenteCurricular ofc inner join ofc.componenteCurricular c where (lower(c.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1 or lower(c.sucinto) like '%' || ?1 || '%') AND ofc.status = 'EM_ANDAMENTO' and occ.ativo = true order by ofc.id
    public static final String SQL_AUTOCOMPLETE_COMPONENTE_ATIVO =
            "SELECT DISTINCT ofc.* FROM edc_ocorrencia_componente_curricular occ INNER JOIN edc_oferecimento_componente_curricular ofc ON ofc.id = occ.id_oferecimento_componente_curricular INNER JOIN edc_componente_curricular c ON c.id = ofc.id_componente_curricular WHERE (lower(c.descricao) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1 or lower(c.sucinto) like '%' || ?1 || '%') AND ofc.status = 'EM_ANDAMENTO' and occ.fl_ativo = true ORDER BY ofc.id LIMIT 10";

    public Uni<java.util.List<OferecimentoComponenteCurricular>> autocompleteComponenteAtivo(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTOCOMPLETE_COMPONENTE_ATIVO, OferecimentoComponenteCurricular.class)
                    .setParameter(1, query)
                    .getResultList());
    }


    // Migrado de ComponenteCurricularRepository.buscarComponenteCurricularComBaseTecnologica (legado) - HQL original:
    // Select cc from ComponenteCurricular cc left join fetch cc.baseTecnologicas where cc = ?1
    public static final String SQL_BUSCAR_COMPONENTE_CURRICULAR_COM_BASE_TECNOLOGICA =
            "SELECT cc.* FROM edc_componente_curricular cc WHERE cc.id = ?1";

    public Uni<java.util.List<ComponenteCurricular>> buscarComponenteCurricularComBaseTecnologica(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COMPONENTE_CURRICULAR_COM_BASE_TECNOLOGICA, ComponenteCurricular.class)
                    .setParameter(1, entityId)
                    .getResultList());
    }


    // Migrado de ComponenteCurricularRepository.buscarComponenteCurricularComReferenciaBibliografica (legado) - HQL original:
    // Select cc from ComponenteCurricular cc left join fetch cc.referenciaBibliograficas where cc = ?1
    public static final String SQL_BUSCAR_COMPONENTE_CURRICULAR_COM_REFERENCIA_BIBLIOGRAFICA =
            "SELECT cc.* FROM edc_componente_curricular cc WHERE cc.id = ?1";

    public Uni<java.util.List<ComponenteCurricular>> buscarComponenteCurricularComReferenciaBibliografica(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COMPONENTE_CURRICULAR_COM_REFERENCIA_BIBLIOGRAFICA, ComponenteCurricular.class)
                    .setParameter(1, entityId)
                    .getResultList());
    }


    // Migrado de ComponenteCurricularRepository.buscarComponenteCurricularComCronograma (legado) - HQL original:
    // Select cc from ComponenteCurricular cc join fetch cc.cronogramaComponenteCurriculares where cc = ?1
    public static final String SQL_BUSCAR_COMPONENTE_CURRICULAR_COM_CRONOGRAMA =
            "SELECT cc.* FROM edc_componente_curricular cc WHERE cc.id = ?1";

    public Uni<java.util.List<ComponenteCurricular>> buscarComponenteCurricularComCronograma(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_COMPONENTE_CURRICULAR_COM_CRONOGRAMA, ComponenteCurricular.class)
                    .setParameter(1, entityId)
                    .getResultList());
    }


    // Migrado de ComponenteCurricularRepository.buscarExistenciaEmOferecimento (legado) - HQL original:
    // Select cc from OferecimentoComponenteCurricular o inner join o.componenteCurricular cc where cc = ?1
    public static final String SQL_BUSCAR_EXISTENCIA_EM_OFERECIMENTO =
            "SELECT cc.* FROM edc_oferecimento_componente_curricular o INNER JOIN edc_componente_curricular cc ON cc.id = o.id_componente_curricular WHERE cc.id = ?1";

    public Uni<java.util.List<ComponenteCurricular>> buscarExistenciaEmOferecimento(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_EXISTENCIA_EM_OFERECIMENTO, ComponenteCurricular.class)
                    .setParameter(1, entityId)
                    .getResultList());
    }

}
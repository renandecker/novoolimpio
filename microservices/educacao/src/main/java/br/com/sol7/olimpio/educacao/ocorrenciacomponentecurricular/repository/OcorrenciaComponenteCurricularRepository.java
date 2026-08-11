package br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular;
import java.util.Date;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class OcorrenciaComponenteCurricularRepository implements PanacheRepository<OcorrenciaComponenteCurricular> {

    // Migrado de OcorrenciaComponenteCurricularRepository.buscarOcorrenciaPorProfessor (legado) - HQL original:
    // select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true  and o.professor= ?1 and o.data  between ?2 and ?3  order by o.data
    public static final String SQL_BUSCAR_OCORRENCIA_POR_PROFESSOR =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular WHERE o.fl_ativo = true and o.id_professor= ?1 and o.data between ?2 and ?3 ORDER BY o.data";

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorProfessor(Long professorId, Date inicio, Date fim) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_POR_PROFESSOR, OcorrenciaComponenteCurricular.class)
                    .setParameter(1, professorId)
                    .setParameter(2, inicio)
                    .setParameter(3, fim)
                    .getResultList());
    }


    // Migrado de OcorrenciaComponenteCurricularRepository.buscarOcorrenciaExtras (legado) - HQL original:
    // select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.aulaCoringa = true and o.oferecimentoComponenteCurricular= ?1 order by o.data
    public static final String SQL_BUSCAR_OCORRENCIA_EXTRAS =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular WHERE o.fl_ativo = true and o.aula_coringa = true and o.id_oferecimento_componente_curricular= ?1 ORDER BY o.data";

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarOcorrenciaExtras(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_EXTRAS, OcorrenciaComponenteCurricular.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList());
    }


    // Migrado de OcorrenciaComponenteCurricularRepository.buscarOcorrenciaNormais (legado) - HQL original:
    // select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.aulaCoringa = false and o.oferecimentoComponenteCurricular= ?1 order by o.data
    public static final String SQL_BUSCAR_OCORRENCIA_NORMAIS =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular WHERE o.fl_ativo = true and o.aula_coringa = false and o.id_oferecimento_componente_curricular= ?1 ORDER BY o.data";

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarOcorrenciaNormais(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_NORMAIS, OcorrenciaComponenteCurricular.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList());
    }


    // Migrado de OcorrenciaComponenteCurricularRepository.buscarOcorrenciaPorOferecimentoEDatas (legado) - HQL original:
    // select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.oferecimentoComponenteCurricular= ?1 and o.data  between ?2 and ?3  order by o.data
    public static final String SQL_BUSCAR_OCORRENCIA_POR_OFERECIMENTO_E_DATAS =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular WHERE o.fl_ativo = true and o.id_oferecimento_componente_curricular= ?1 and o.data between ?2 and ?3 ORDER BY o.data";

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorOferecimentoEDatas(Long oferecimentoComponenteCurricularId, Date inicio, Date fim) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_POR_OFERECIMENTO_E_DATAS, OcorrenciaComponenteCurricular.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .setParameter(2, inicio)
                    .setParameter(3, fim)
                    .getResultList());
    }


    // Migrado de OcorrenciaComponenteCurricularRepository.buscarOcorrenciaPorOferecimentoEDatasCoringa (legado) - HQL original:
    // select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.oferecimentoComponenteCurricular= ?1 and o.data  between ?2 and ?3 and o.aulaCoringa = ?4 order by o.data
    public static final String SQL_BUSCAR_OCORRENCIA_POR_OFERECIMENTO_E_DATAS_CORINGA =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular WHERE o.fl_ativo = true and o.id_oferecimento_componente_curricular= ?1 and o.data between ?2 and ?3 and o.aula_coringa = ?4 ORDER BY o.data";

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorOferecimentoEDatasCoringa(Long oferecimentoComponenteCurricularId, Date inicio, Date fim, Boolean coring) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_POR_OFERECIMENTO_E_DATAS_CORINGA, OcorrenciaComponenteCurricular.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .setParameter(2, inicio)
                    .setParameter(3, fim)
                    .setParameter(4, coring)
                    .getResultList());
    }


    // Migrado de OcorrenciaComponenteCurricularRepository.buscarOcorrenciaPorOferecimento (legado) - HQL original:
    // select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and ofe = ?1 order by o.data
    public static final String SQL_BUSCAR_OCORRENCIA_POR_OFERECIMENTO =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular WHERE o.fl_ativo = true and ofe.id = ?1 ORDER BY o.data";

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorOferecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_POR_OFERECIMENTO, OcorrenciaComponenteCurricular.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList());
    }


    // Migrado de OcorrenciaComponenteCurricularRepository.buscarTodasOcorrenciaPorOferecimento (legado) - HQL original:
    // select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where ofe = ?1
    public static final String SQL_BUSCAR_TODAS_OCORRENCIA_POR_OFERECIMENTO =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular WHERE ofe.id = ?1";

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarTodasOcorrenciaPorOferecimento(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TODAS_OCORRENCIA_POR_OFERECIMENTO, OcorrenciaComponenteCurricular.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList());
    }


    // Migrado de OcorrenciaComponenteCurricularRepository.buscarOcorrenciaPorDataUnidade (legado) - HQL original:
    // select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and o.data  between Date(?1) and Date(?2)  and o.oferecimentoComponenteCurricular.unidade in (?3) order by o.oferecimentoComponenteCurricular.id
    public static final String SQL_BUSCAR_OCORRENCIA_POR_DATA_UNIDADE =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular LEFT JOIN edc_oferecimento_componente_curricular j_o_oferecimentoComponenteCurricular ON j_o_oferecimentoComponenteCurricular.id = o.id_oferecimento_componente_curricular WHERE o.fl_ativo = true and o.data between Date(?1) and Date(?2) and j_o_oferecimentoComponenteCurricular.id_unidade in (?3) ORDER BY j_o_oferecimentoComponenteCurricular.id";

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorDataUnidade(Date inicio, Date fim, List<Long> unidadesIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_POR_DATA_UNIDADE, OcorrenciaComponenteCurricular.class)
                    .setParameter(1, inicio)
                    .setParameter(2, fim)
                    .setParameter(3, unidadesIds)
                    .getResultList());
    }

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorDataUnidade(Date date, List<Long> unidadesIds) {
        return buscarOcorrenciaPorDataUnidade(date, date, unidadesIds);
    }


    // Migrado de OcorrenciaComponenteCurricularRepository.buscarOcorrenciaPorOferecimentoComGrupo (legado) - HQL original:
    // select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and o.aulaCoringa = false and ofe.grupo = ?1 order by o.data
    public static final String SQL_BUSCAR_OCORRENCIA_POR_OFERECIMENTO_COM_GRUPO =
            "SELECT o.* FROM edc_ocorrencia_componente_curricular o INNER JOIN edc_oferecimento_componente_curricular ofe ON ofe.id = o.id_oferecimento_componente_curricular WHERE o.fl_ativo = true and o.aula_coringa = false and ofe.id_grupo = ?1 ORDER BY o.data";

    public Uni<java.util.List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorOferecimentoComGrupo(Long grupoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_OCORRENCIA_POR_OFERECIMENTO_COM_GRUPO, OcorrenciaComponenteCurricular.class)
                    .setParameter(1, grupoId)
                    .getResultList());
    }

}
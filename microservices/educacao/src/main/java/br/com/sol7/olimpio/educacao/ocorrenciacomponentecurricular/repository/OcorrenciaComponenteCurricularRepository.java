package br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular;

import java.util.Date;
import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class OcorrenciaComponenteCurricularRepository implements PanacheRepository<OcorrenciaComponenteCurricular> {

    // NOTA: as queries nativas originais (SELECT o.* ... INNER JOIN ... com mapeamento para
    // a entidade) quebravam no Hibernate Reactive com NPE em sqlSelection (HTTP 500).
    // Todas foram migradas para Panache/JPQL. Os INNER JOINs com ofe eram neutros (sem
    // filtro em ofe), exceto em ...ComGrupo e ...PorDataUnidade, resolvidos com subquery.

    // HQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true  and o.professor= ?1 and o.data  between ?2 and ?3  order by o.data
    public Uni<List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorProfessor(Long professorId, Date inicio, Date fim) {
        if (professorId == null || inicio == null || fim == null) {
            return Uni.createFrom().item(List.of());
        }
        return find("ativo = true and professorId = ?1 and data between ?2 and ?3 order by data",
                professorId, inicio, fim).list();
    }


    // HQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.aulaCoringa = true and o.oferecimentoComponenteCurricular= ?1 order by o.data
    public Uni<List<OcorrenciaComponenteCurricular>> buscarOcorrenciaExtras(Long oferecimentoComponenteCurricularId) {
        if (oferecimentoComponenteCurricularId == null) {
            return Uni.createFrom().item(List.of());
        }
        return find("ativo = true and aulaCoringa = true and oferecimentoComponenteCurricularId = ?1 order by data",
                oferecimentoComponenteCurricularId).list();
    }


    // HQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.aulaCoringa = false and o.oferecimentoComponenteCurricular= ?1 order by o.data
    public Uni<List<OcorrenciaComponenteCurricular>> buscarOcorrenciaNormais(Long oferecimentoComponenteCurricularId) {
        if (oferecimentoComponenteCurricularId == null) {
            return Uni.createFrom().item(List.of());
        }
        return find("ativo = true and aulaCoringa = false and oferecimentoComponenteCurricularId = ?1 order by data",
                oferecimentoComponenteCurricularId).list();
    }


    // HQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.oferecimentoComponenteCurricular= ?1 and o.data  between ?2 and ?3  order by o.data
    public Uni<List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorOferecimentoEDatas(Long oferecimentoComponenteCurricularId, Date inicio, Date fim) {
        if (oferecimentoComponenteCurricularId == null || inicio == null || fim == null) {
            return Uni.createFrom().item(List.of());
        }
        return find("ativo = true and oferecimentoComponenteCurricularId = ?1 and data between ?2 and ?3 order by data",
                oferecimentoComponenteCurricularId, inicio, fim).list();
    }


    // HQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.oferecimentoComponenteCurricular= ?1 and o.data  between ?2 and ?3 and o.aulaCoringa = ?4 order by o.data
    public Uni<List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorOferecimentoEDatasCoringa(Long oferecimentoComponenteCurricularId, Date inicio, Date fim, Boolean coring) {
        if (oferecimentoComponenteCurricularId == null || inicio == null || fim == null || coring == null) {
            return Uni.createFrom().item(List.of());
        }
        return find("ativo = true and oferecimentoComponenteCurricularId = ?1 and data between ?2 and ?3 and aulaCoringa = ?4 order by data",
                oferecimentoComponenteCurricularId, inicio, fim, coring).list();
    }


    // HQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and ofe = ?1 order by o.data
    public Uni<List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorOferecimento(Long oferecimentoComponenteCurricularId) {
        if (oferecimentoComponenteCurricularId == null) {
            return Uni.createFrom().item(List.of());
        }
        return find("ativo = true and oferecimentoComponenteCurricularId = ?1 order by data",
                oferecimentoComponenteCurricularId).list();
    }


    // HQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where ofe = ?1
    public Uni<List<OcorrenciaComponenteCurricular>> buscarTodasOcorrenciaPorOferecimento(Long oferecimentoComponenteCurricularId) {
        if (oferecimentoComponenteCurricularId == null) {
            return Uni.createFrom().item(List.of());
        }
        return find("oferecimentoComponenteCurricularId = ?1", oferecimentoComponenteCurricularId).list();
    }


    // HQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and o.data  between Date(?1) and Date(?2)  and o.oferecimentoComponenteCurricular.unidade in (?3) order by o.oferecimentoComponenteCurricular.id
    public Uni<List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorDataUnidade(Date inicio, Date fim, List<Long> unidadesIds) {
        if (inicio == null || fim == null || unidadesIds == null || unidadesIds.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        return find("ativo = true and data between ?1 and ?2 and oferecimentoComponenteCurricularId in "
                        + "(select o.id from OferecimentoComponenteCurricular o where o.unidadeId in ?3) "
                        + "order by oferecimentoComponenteCurricularId",
                inicio, fim, unidadesIds).list();
    }

    public Uni<List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorDataUnidade(Date date, List<Long> unidadesIds) {
        return buscarOcorrenciaPorDataUnidade(date, date, unidadesIds);
    }


    // HQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and o.aulaCoringa = false and ofe.grupo = ?1 order by o.data
    public Uni<List<OcorrenciaComponenteCurricular>> buscarOcorrenciaPorOferecimentoComGrupo(Long grupoId) {
        if (grupoId == null) {
            return Uni.createFrom().item(List.of());
        }
        return find("ativo = true and aulaCoringa = false and oferecimentoComponenteCurricularId in "
                        + "(select o.id from OferecimentoComponenteCurricular o where o.grupoId = ?1) order by data",
                grupoId).list();
    }

}

package br.com.sol7.olimpio.educacao.chamadaassinadaimpressa;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ChamadaAssinadaImpressaRepository implements PanacheRepository<ChamadaAssinadaImpressa> {

    // Migrado de ChamadaAssinadaImpressaRepository.verificaPossuiPendentes (legado) - HQL original:
    // select count(c) from ChamadaAssinadaImpressa c where c.oferecimentoComponenteCurricular = ?1 AND c.sequencia = ?2 and c.ativo = true
    public static final String SQL_VERIFICA_POSSUI_PENDENTES =
            "SELECT count(c) FROM edc_chamada_assinada_impressa c WHERE c.id_oferecimento_componente_curricular = ?1 AND c.sequencia = ?2 and c.ativo = true";

    public Uni<java.util.List<Object>> verificaPossuiPendentes(Long oferecimentoComponenteCurricularId, int sequencia) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICA_POSSUI_PENDENTES)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .setParameter(2, sequencia)
                        .getResultList());
    }


    // Migrado de ChamadaAssinadaImpressaRepository.chamadasAtivas (legado) - HQL original:
    // select c from ChamadaAssinadaImpressa c where c.oferecimentoComponenteCurricular = ?1  and c.ativo = true
    public static final String SQL_CHAMADAS_ATIVAS =
            "SELECT c.* FROM edc_chamada_assinada_impressa c WHERE c.id_oferecimento_componente_curricular = ?1 and c.ativo = true";

    public Uni<java.util.List<ChamadaAssinadaImpressa>> chamadasAtivas(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CHAMADAS_ATIVAS, ChamadaAssinadaImpressa.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // Migrado de ChamadaAssinadaImpressaRepository.maiorSequencia (legado) - HQL original:
    // select MAX(c.sequencia) from ChamadaAssinadaImpressa c where c.oferecimentoComponenteCurricular = ?1  and c.ativo = true
    public static final String SQL_MAIOR_SEQUENCIA =
            "SELECT MAX(c.sequencia) FROM edc_chamada_assinada_impressa c WHERE c.id_oferecimento_componente_curricular = ?1 and c.ativo = true";

    public Uni<java.util.List<Object>> maiorSequencia(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MAIOR_SEQUENCIA)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // Migrado de ChamadaAssinadaImpressaRepository.chamadasAtivasNaoDigitadas (legado) - HQL original:
    // select c from ChamadaAssinadaImpressa c where c.oferecimentoComponenteCurricular = ?1  and c.ativo = true and not exists (Select dc.id from DigitalizacaoChamada dc where dc.chamadaAssinadaImpressa = c) order by c.sequencia
    public static final String SQL_CHAMADAS_ATIVAS_NAO_DIGITADAS =
            "SELECT c.* FROM edc_chamada_assinada_impressa c WHERE c.id_oferecimento_componente_curricular = ?1 and c.ativo = true and not exists (Select dc.id from DigitalizacaoChamada dc where dc.chamadaAssinadaImpressa = c) ORDER BY c.sequencia";

    public Uni<java.util.List<ChamadaAssinadaImpressa>> chamadasAtivasNaoDigitadas(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CHAMADAS_ATIVAS_NAO_DIGITADAS, ChamadaAssinadaImpressa.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // Migrado de ChamadaAssinadaImpressaRepository.verificaPossuiChamadasPendentes (legado) - HQL original:
    // select c from ChamadaAssinadaImpressa c where c.oferecimentoComponenteCurricular = ?1 and c.pendente = true and c.ativo = true
    public static final String SQL_VERIFICA_POSSUI_CHAMADAS_PENDENTES =
            "SELECT c.* FROM edc_chamada_assinada_impressa c WHERE c.id_oferecimento_componente_curricular = ?1 and c.pendente = true and c.ativo = true";

    public Uni<java.util.List<ChamadaAssinadaImpressa>> verificaPossuiChamadasPendentes(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICA_POSSUI_CHAMADAS_PENDENTES, ChamadaAssinadaImpressa.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // Migrado de ChamadaAssinadaImpressaRepository.verificaUltimaBaixada (legado) - HQL original:
    // select c from ChamadaAssinadaImpressa c where c.oferecimentoComponenteCurricular = ?1 and c.pendente = false and c.ativo = true order by c.fim desc
    public static final String SQL_VERIFICA_ULTIMA_BAIXADA =
            "SELECT c.* FROM edc_chamada_assinada_impressa c WHERE c.id_oferecimento_componente_curricular = ?1 and c.pendente = false and c.ativo = true ORDER BY c.fim desc LIMIT 10";

    public Uni<java.util.List<ChamadaAssinadaImpressa>> verificaUltimaBaixada(Long oferecimentoComponenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICA_ULTIMA_BAIXADA, ChamadaAssinadaImpressa.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }


    // Migrado de ChamadaAssinadaImpressaRepository.teste (legado) - HQL original:
    // select distinct o from OferecimentoComponenteCurricular o where not exists (select c.oferecimentoComponenteCurricular from ChamadaAssinadaImpressa c where c.oferecimentoComponenteCurricular = o)
    public static final String SQL_TESTE =
            "SELECT DISTINCT o.* FROM edc_oferecimento_componente_curricular o WHERE not exists (select c.oferecimentoComponenteCurricular from ChamadaAssinadaImpressa c where c.oferecimentoComponenteCurricular = o)";

    // Atencao: a query original seleciona 'OferecimentoComponenteCurricular', nao 'ChamadaAssinadaImpressa'.
    // Se 'OferecimentoComponenteCurricular' existir como entidade neste microsservico, troque Object por OferecimentoComponenteCurricular.class abaixo.
    public Uni<java.util.List<Object>> teste() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TESTE)

                        .getResultList());
    }

}
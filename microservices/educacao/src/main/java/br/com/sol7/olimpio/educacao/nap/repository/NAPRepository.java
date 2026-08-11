package br.com.sol7.olimpio.educacao.nap;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class NAPRepository implements PanacheRepository<NAP> {

    // Migrado de NAPRepository.listaLigacaoNapComEtapa (legado) - HQL original:
    // select a from Nap a where a.contrato = ?1 and a.etapasNAP = ?2
    public static final String SQL_LISTA_LIGACAO_NAP_COM_ETAPA =
            "SELECT a.* FROM edc_nap a WHERE a.id_contrato = ?1 and a.id_etapas_nap = ?2";

    // Atencao: a query original seleciona 'Nap', nao 'NAP'.
    // Se 'Nap' existir como entidade neste microsservico, troque Object por Nap.class abaixo.
    public Uni<java.util.List<Object>> listaLigacaoNapComEtapa(Long contratoId, Long etapasNAPId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_LIGACAO_NAP_COM_ETAPA)
                    .setParameter(1, contratoId)
                    .setParameter(2, etapasNAPId)
                    .getResultList());
    }


    // Migrado de NAPRepository.listaNapComEtapa (legado) - HQL original:
    // select a from Nap a where a.etapasNAP = ?1
    public static final String SQL_LISTA_NAP_COM_ETAPA =
            "SELECT a.* FROM edc_nap a WHERE a.id_etapas_nap = ?1";

    // Atencao: a query original seleciona 'Nap', nao 'NAP'.
    // Se 'Nap' existir como entidade neste microsservico, troque Object por Nap.class abaixo.
    public Uni<java.util.List<Object>> listaNapComEtapa(Long etapasNAPId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_NAP_COM_ETAPA)
                    .setParameter(1, etapasNAPId)
                    .getResultList());
    }


    // Migrado de NAPRepository.listaNapSemEtapa (legado) - HQL original:
    // select a from Nap a where a.etapasNAP is null
    public static final String SQL_LISTA_NAP_SEM_ETAPA =
            "SELECT a.* FROM edc_nap a WHERE a.id_etapas_nap is null";

    // Atencao: a query original seleciona 'Nap', nao 'NAP'.
    // Se 'Nap' existir como entidade neste microsservico, troque Object por Nap.class abaixo.
    public Uni<java.util.List<Object>> listaNapSemEtapa() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_NAP_SEM_ETAPA)

                    .getResultList());
    }


    // Migrado de NAPRepository.buscaObjeto (legado) - HQL original:
    // select a from Nap a where a.id = ?1
    public static final String SQL_BUSCA_OBJETO =
            "SELECT a.* FROM edc_nap a WHERE a.id = ?1";

    // Atencao: a query original seleciona 'Nap', nao 'NAP'.
    // Se 'Nap' existir como entidade neste microsservico, troque Object por Nap.class abaixo.
    public Uni<java.util.List<Object>> buscaObjeto(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_OBJETO)
                    .setParameter(1, id)
                    .getResultList());
    }

}
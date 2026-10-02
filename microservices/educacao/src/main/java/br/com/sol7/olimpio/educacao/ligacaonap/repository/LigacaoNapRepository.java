package br.com.sol7.olimpio.educacao.ligacaonap;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class LigacaoNapRepository implements io.quarkus.hibernate.reactive.panache.PanacheRepository<LigacaoNap> {

    // Logica original (adaptar): retorna ligacoes de NAP da etapa informada
    public static final String SQL_LISTA_LIGACAO_NAP_COM_ETAPA =
            "SELECT l.* FROM edc_ligacao_nap l WHERE l.id_etapas_nap = ?1 AND l.ativo = true";

    public Uni<java.util.List<LigacaoNap>> listaLigacaoNapComEtapa(Long etapasNapId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_LIGACAO_NAP_COM_ETAPA, LigacaoNap.class)
                        .setParameter(1, etapasNapId)
                        .getResultList());
    }

    // Logica original (adaptar): retorna ligacoes de NAP sem etapa (tab "Ligacao NAP pendente")
    public static final String SQL_LISTA_LIGACAO_NAP_SEM_ETAPA =
            "SELECT l.* FROM edc_ligacao_nap l WHERE l.id_etapas_nap is null AND l.ativo = true";

    public Uni<java.util.List<LigacaoNap>> listaLigacaoNapSemEtapa() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_LIGACAO_NAP_SEM_ETAPA, LigacaoNap.class)
                        .getResultList());
    }

    // Migrado de LigacaoNapService.buscaObjeto (legado)
    public static final String SQL_BUSCA_OBJETO =
            "SELECT l.* FROM edc_ligacao_nap l WHERE l.id = ?1";

    public Uni<java.util.List<LigacaoNap>> buscaObjeto(Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_OBJETO, LigacaoNap.class)
                        .setParameter(1, id)
                        .getResultList());
    }

    public static final String SQL_BUSCA_POR_CONTRATO =
            "SELECT l.* FROM edc_ligacao_nap l WHERE l.id_contrato = ?1";

    public Uni<java.util.List<LigacaoNap>> buscaPorContrato(Long contratoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_POR_CONTRATO, LigacaoNap.class)
                        .setParameter(1, contratoId)
                        .getResultList());
    }
}

package br.com.sol7.olimpio.financeiro.cobranca;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class CobrancaRepository implements PanacheRepository<Cobranca> {

    // Migrado de CobrancaRepository.listaLigacaoCobrancaComEtapaAtivos (legado) - HQL original:
    // select l from Cobranca l where l.etapasCobranca = ?1
    public static final String SQL_LISTA_LIGACAO_COBRANCA_COM_ETAPA_ATIVOS =
            "SELECT l.* FROM fin_cobranca l WHERE l.id_etapa_cobranca = ?1";

    public Uni<java.util.List<Cobranca>> listaLigacaoCobrancaComEtapaAtivos(Long etapasCobrancaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_LIGACAO_COBRANCA_COM_ETAPA_ATIVOS, Cobranca.class)
                        .setParameter(1, etapasCobrancaId)
                        .getResultList());
    }


    // Migrado de CobrancaRepository.listaLigacaoSemEtapaAtivos (legado) - HQL original:
    // select l from Cobranca l where l.etapasCobranca is null
    public static final String SQL_LISTA_LIGACAO_SEM_ETAPA_ATIVOS =
            "SELECT l.* FROM fin_cobranca l WHERE l.id_etapa_cobranca is null";

    public Uni<java.util.List<Cobranca>> listaLigacaoSemEtapaAtivos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_LIGACAO_SEM_ETAPA_ATIVOS, Cobranca.class)

                        .getResultList());
    }


    // Migrado de CobrancaRepository.buscaObjeto (legado) - HQL original:
    // select l from Cobranca l where l.id = ?1
    public static final String SQL_BUSCA_OBJETO =
            "SELECT l.* FROM fin_cobranca l WHERE l.id = ?1";

    public Uni<java.util.List<Cobranca>> buscaObjeto(Integer id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_OBJETO, Cobranca.class)
                        .setParameter(1, id)
                        .getResultList());
    }

}
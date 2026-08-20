package br.com.sol7.olimpio.financeiro.ligacaocobranca;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Date;

@ApplicationScoped
public class LigacaoCobrancaRepository implements io.quarkus.hibernate.reactive.panache.PanacheRepository<LigacaoCobranca> {

    // Migrado de LigacaoCobrancaService.listaLigacaoCobrancaComEtapaAtivos (legado)
    // Logica original (adaptar): retorna ligacoes de cobranca ativas da etapa informada
    public static final String SQL_LISTA_LIGACAO_COBRANCA_COM_ETAPA_ATIVOS =
            "SELECT l.* FROM fin_ligacao_cobranca l WHERE l.id_etapa_cobranca = ?1 AND l.ativo = true";

    public Uni<java.util.List<LigacaoCobranca>> listaLigacaoCobrancaComEtapaAtivos(Long etapasCobrancaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_LIGACAO_COBRANCA_COM_ETAPA_ATIVOS, LigacaoCobranca.class)
                        .setParameter(1, etapasCobrancaId)
                        .getResultList());
    }

    // Migrado de LigacaoCobrancaService.listaLigacaoCobrancaSemEtapa (legado)
    // Logica original (adaptar): retorna ligacoes de cobranca sem etapa (tab "Ligacao Cobranca pendente")
    public static final String SQL_LISTA_LIGACAO_COBRANCA_SEM_ETAPA_ATIVOS =
            "SELECT l.* FROM fin_ligacao_cobranca l WHERE l.id_etapa_cobranca is null AND l.ativo = true";

    public Uni<java.util.List<LigacaoCobranca>> listaLigacaoCobrancaSemEtapaAtivos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTA_LIGACAO_COBRANCA_SEM_ETAPA_ATIVOS, LigacaoCobranca.class)
                        .getResultList());
    }

    // Migrado de LigacaoCobrancaService.buscaObjeto (legado)
    public static final String SQL_BUSCA_OBJETO =
            "SELECT l.* FROM fin_ligacao_cobranca l WHERE l.id = ?1";

    public Uni<java.util.List<LigacaoCobranca>> buscaObjeto(Long id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_OBJETO, LigacaoCobranca.class)
                        .setParameter(1, id)
                        .getResultList());
    }

    // Migrado de LigacaoCobrancaService.buscaLigacaoCobrancaPorContratoECompromisso (legado)
    public static final String SQL_BUSCA_POR_CONTRATO_E_COMPROMISSO =
            "SELECT l.* FROM fin_ligacao_cobranca l WHERE l.id_contrato = ?1 AND l.id_compromisso = ?2";

    public Uni<java.util.List<LigacaoCobranca>> buscaPorContratoECompromisso(Long contratoId, Long compromissoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_POR_CONTRATO_E_COMPROMISSO, LigacaoCobranca.class)
                        .setParameter(1, contratoId)
                        .setParameter(2, compromissoId)
                        .getResultList());
    }

    // Migrado de LigacaoCobrancaService.cobradasPessoas (legado)
    // Retorna pessoas que foram cobradas (ligações com resultado de sucesso) em uma data/unidade
    public static final String SQL_COBRADAS_PESSOAS =
            "SELECT DISTINCT l.id_contrato FROM fin_ligacao_cobranca l " +
                    "JOIN fin_resultado_ligacao_cobranca r ON r.id = l.id_resultado_cobranca " +
                    "WHERE l.id_unidade = ?1 AND date(l.data_inicial) = ?2 " +
                    "AND r.tela IN (1, 2) AND l.ativo = true"; // tela 1=atendeu, 2=promessa

    public Uni<java.util.List<Long>> buscarPessoasCobradas(Long unidadeId, Date data) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_COBRADAS_PESSOAS)
                        .setParameter(1, unidadeId)
                        .setParameter(2, data)
                        .getResultList())
                .map(list -> list.stream().map(o -> ((Number) o).longValue()).collect(java.util.stream.Collectors.toList()));
    }

    // Migrado de LigacaoCobrancaService.quantidadeLigacoesRealizadasPessoa (legado)
    // Conta ligações realizadas para uma pessoa em uma data/unidade
    public static final String SQL_QTD_LIGACOES_PESSOA =
            "SELECT COUNT(*) FROM fin_ligacao_cobranca l " +
                    "WHERE l.id_unidade = ?1 AND date(l.data_inicial) = ?2 AND l.id_contrato = ?3 AND l.ativo = true";

    public Uni<Long> contarLigacoesRealizadasPessoa(Long unidadeId, Date data, Long pessoaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_QTD_LIGACOES_PESSOA)
                        .setParameter(1, unidadeId)
                        .setParameter(2, data)
                        .setParameter(3, pessoaId)
                        .getSingleResult())
                .map(o -> ((Number) o).longValue());
    }
}

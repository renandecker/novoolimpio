package br.com.sol7.olimpio.financeiro.controleimpressao.repository;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.financeiro.controleimpressao.entity.ControleImpressao;

@ApplicationScoped
public class ControleImpressaoRepository implements PanacheRepository<ControleImpressao> {

    // Migrado de ControleImpressaoRepository.verificarControle (legado) - HQL original:
    // Select count (c) from ControleImpressao c where c.movimentacaoFinanceira.caixa = ?1 and c.movimentacaoFinanceira = ?2
    public static final String SQL_VERIFICAR_CONTROLE =
            "SELECT count(c) FROM fin_controle_impressao c " +
                    "JOIN fin_movimentacao m ON m.id = c.id_movimentacao " +
                    "WHERE m.id_caixa = ?1 AND c.id_movimentacao = ?2";

    public Uni<Long> verificarControle(Long caixaId, Long movimentacaoId) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_CONTROLE)
                        .setParameter(1, caixaId)
                        .setParameter(2, movimentacaoId)
                        .getSingleResult())
                .map(v -> ((Number) v).longValue());
    }
}

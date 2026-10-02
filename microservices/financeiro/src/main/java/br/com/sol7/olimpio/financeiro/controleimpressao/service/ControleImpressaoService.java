package br.com.sol7.olimpio.financeiro.controleimpressao.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import br.com.sol7.olimpio.financeiro.controleimpressao.entity.ControleImpressao;
import br.com.sol7.olimpio.financeiro.controleimpressao.repository.ControleImpressaoRepository;

import java.util.Date;

@ApplicationScoped
@WithTransaction
public class ControleImpressaoService {

    @Inject
    ControleImpressaoRepository repository;

    public Uni<Long> verificarControle(Long caixaId, Long movimentacaoId) {
        return repository.verificarControle(caixaId, movimentacaoId);
    }

    public Uni<Void> registrarImpressao(Long movimentacaoFinanceiraId, Long usuarioId) {
        var e = new ControleImpressao();
        e.data = new Date();
        e.movimentacaoId = movimentacaoFinanceiraId;
        e.usuarioId = usuarioId;
        return repository.persist(e).replaceWithVoid();
    }
}

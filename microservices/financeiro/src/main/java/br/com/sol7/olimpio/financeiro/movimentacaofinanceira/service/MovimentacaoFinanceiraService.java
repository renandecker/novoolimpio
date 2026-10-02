package br.com.sol7.olimpio.financeiro.movimentacaofinanceira.service;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.util.List;

import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.MovimentacaoFinanceira;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.TipoPagamento;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.repository.MovimentacaoFinanceiraRepository;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraRequest;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraResponse;

@ApplicationScoped
@WithTransaction
public class MovimentacaoFinanceiraService {

    @Inject
    MovimentacaoFinanceiraRepository repository;

    public Uni<List<MovimentacaoFinanceiraResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MovimentacaoFinanceiraResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<MovimentacaoFinanceiraResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Movimentação financeira não encontrada"))
                .map(this::toResponse);
    }

    public Uni<List<MovimentacaoFinanceiraResponse>> buscarPorCaixa(Long caixaId) {
        return repository.buscarMovimentacaoCaixaDia(caixaId).map(items -> items.stream().map(this::toResponse).toList());
    }

    // Busca apenas movimentações de ENTRADA (tipo_movimento = 1) de um caixa
    public Uni<List<MovimentacaoFinanceiraResponse>> buscarMovimentacaoCaixaEntrada(Long caixaId) {
        return repository.buscarMovimentacaoCaixaEntrada(caixaId).map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<MovimentacaoFinanceiraResponse> create(MovimentacaoFinanceiraRequest r) {
        var e = new MovimentacaoFinanceira();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MovimentacaoFinanceiraResponse> update(Long id, MovimentacaoFinanceiraRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Movimentação financeira não encontrada"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Movimentação financeira não encontrada")));
    }

    // Registra uma movimentacao extra (entrada/saida manual) do caixa. Regras de obrigatoriedade
    // ("Descrição", "Valor" e "Tipo Movimento"/"Movimento" sao obrigatorios) preservadas do legado;
    // o detalhe de forma de pagamento (cheque/cartao) e persistido pelos modulos cheque/pagamentocartao.
    public Uni<MovimentacaoFinanceiraResponse> registrarMovimentacaoExtra(MovimentacaoFinanceiraRequest r) {
        if (r.historico() == null || r.historico().isBlank()) {
            throw new BadRequestException("Descrição é um campo Obrigatório!");
        }
        if (r.valor() == null) {
            throw new BadRequestException("Valor é um campo Obrigatório!");
        }
        if (r.movimentoId() == null) {
            throw new BadRequestException("Movimento é um campo Obrigatório!");
        }
        var e = new MovimentacaoFinanceira();
        apply(e, r);
        e.dataMovimento = new java.util.Date();
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    // Obs: a limpeza da parcela associada (fin_parcela) pertence ao microservico comercial e nao e
    // executada aqui; os detalhes locais (cheque/cartao/boleto/transferencia/deposito) sao removidos
    // via native delete, preservando o comportamento do legado dentro do escopo do financeiro.
    public Uni<Void> excluirMovimentacao(Long id) {
        return Panache.getSession().chain(session ->
                session.createNativeQuery("DELETE FROM fin_cheque WHERE id_movimentacao = ?1").setParameter(1, id).executeUpdate()
                        .chain(v -> session.createNativeQuery("DELETE FROM fin_pagamento_cartao WHERE id_movimentacao = ?1").setParameter(1, id).executeUpdate())
                        .chain(v -> session.createNativeQuery("DELETE FROM fin_boleto WHERE id_movimentacao = ?1").setParameter(1, id).executeUpdate())
                        .chain(v -> session.createNativeQuery("DELETE FROM fin_tranferencia WHERE id_movimentacao = ?1").setParameter(1, id).executeUpdate())
                        .chain(v -> session.createNativeQuery("DELETE FROM fin_deposito WHERE id_movimentacao = ?1").setParameter(1, id).executeUpdate())
                        .chain(v -> session.createNativeQuery("DELETE FROM fin_movimentacao WHERE id = ?1").setParameter(1, id).executeUpdate())
        ).replaceWithVoid();
    }

    private void apply(MovimentacaoFinanceira e, MovimentacaoFinanceiraRequest r) {
        e.dataMovimento = r.dataMovimento() != null ? r.dataMovimento() : e.dataMovimento;
        e.historico = r.historico();
        e.vencimento = r.vencimento();
        e.valor = r.valor();
        e.documento = r.documento();
        e.quantidade = r.quantidade();
        e.especie = r.especie();
        e.valorTroco = r.valorTroco() != null ? r.valorTroco() : BigDecimal.ZERO;
        e.caixaId = r.caixaId();
        e.movimentoId = r.movimentoId();
        e.tipoHistoricoId = r.tipoHistoricoId();
        e.contaCorrenteId = r.contaCorrenteId();
        e.tipoPagamento = r.tipoPagamento();
        e.usuarioId = r.usuarioId();
        e.parcelaId = r.parcelaId();
        e.desconto = r.desconto();
        e.multaJuros = r.multaJuros();
    }

    private MovimentacaoFinanceiraResponse toResponse(MovimentacaoFinanceira e) {
        return new MovimentacaoFinanceiraResponse(e.id, e.dataMovimento, e.historico, e.vencimento, e.valor, e.documento,
                e.quantidade, e.especie, e.valorTroco, e.caixaId, e.movimentoId, e.tipoHistoricoId, e.contaCorrenteId,
                e.tipoPagamento, e.usuarioId, e.parcelaId, e.desconto, e.multaJuros);
    }
}

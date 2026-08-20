package br.com.sol7.olimpio.financeiro.pagamentocartao.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.financeiro.pagamentocartao.entity.PagamentoCartao;
import br.com.sol7.olimpio.financeiro.pagamentocartao.entity.TipoPagamentoCartao;
import br.com.sol7.olimpio.financeiro.pagamentocartao.repository.PagamentoCartaoRepository;
import br.com.sol7.olimpio.financeiro.pagamentocartao.dto.PagamentoCartaoRequest;
import br.com.sol7.olimpio.financeiro.pagamentocartao.dto.PagamentoCartaoResponse;

@ApplicationScoped
@WithTransaction
public class PagamentoCartaoService {
    @Inject
    PagamentoCartaoRepository repository;

    public Uni<List<PagamentoCartaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PagamentoCartaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count().map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagamentoCartaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Pagamento com cartão não encontrado")).map(this::toResponse);
    }

    // Migrado de CaixaController.salvar / pagamentoCartaoCredito (legado) - se o pagamento nao e
    // credito, a quantidade de parcelas nao se aplica e e zerada (nula) ao salvar.
    public Uni<PagamentoCartaoResponse> create(PagamentoCartaoRequest r) {
        var e = new PagamentoCartao();
        apply(e, r);
        if (e.tipoPagamentoCartao != TipoPagamentoCartao.CREDITO) {
            e.quantidadeParcelas = null;
        }
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PagamentoCartaoResponse> update(Long id, PagamentoCartaoRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Pagamento com cartão não encontrado")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Pagamento com cartão não encontrado")));
    }

    private void apply(PagamentoCartao e, PagamentoCartaoRequest r) {
        e.movimentacaoId = r.movimentacaoId();
        e.tipoPagamentoCartao = r.tipoPagamentoCartao();
        e.quantidadeParcelas = r.quantidadeParcelas();
        e.bandeiraId = r.bandeiraId();
    }

    private PagamentoCartaoResponse toResponse(PagamentoCartao e) {
        return new PagamentoCartaoResponse(e.id, e.movimentacaoId, e.tipoPagamentoCartao, e.quantidadeParcelas, e.bandeiraId);
    }
}

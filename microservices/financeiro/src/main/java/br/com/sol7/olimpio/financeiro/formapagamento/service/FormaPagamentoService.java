package br.com.sol7.olimpio.financeiro.formapagamento;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class FormaPagamentoService {

    @Inject
    FormaPagamentoRepository repository;

    public Uni<List<FormaPagamentoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FormaPagamentoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<FormaPagamentoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FormaPagamento not found"))
                .map(this::toResponse);
    }

    public Uni<FormaPagamentoResponse> create(FormaPagamentoRequest r) {
        var e = new FormaPagamento();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FormaPagamentoResponse> update(Long id, FormaPagamentoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FormaPagamento not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("FormaPagamento not found")));
    }

    private void apply(FormaPagamento e, FormaPagamentoRequest r) {
        e.vezes = r.vezes();
        e.juros = r.juros();
        e.desconto = r.desconto();
        e.ajusteParcelaAluno = r.ajusteParcelaAluno();
        e.ajusteParcela = r.ajusteParcela();
        e.operacao = r.operacao();
        e.tipoRegra = r.tipoRegra();
        e.tipoRegraValor = r.tipoRegraValor();
        e.periodicidade = r.periodicidade();
        e.perfilId = r.perfilId();
        e.regra = r.regra();
        e.ativo = r.ativo();
        e.usado = r.usado();
        e.ajuste = r.ajuste();
        e.cota = r.cota();
        e.tipoPessoa = r.tipoPessoa();
        e.valorRegra = r.valorRegra();
        e.percentualMinimo = r.percentualMinimo();
        e.percentualMaximo = r.percentualMaximo();
        e.percentualMinimoAluno = r.percentualMinimoAluno();
        e.percentualMaximoAluno = r.percentualMaximoAluno();
        e.valorCota = r.valorCota();
        e.valorCotaControle = r.valorCotaControle();
        e.dateCotaControle = r.dateCotaControle();
    }

    private FormaPagamentoResponse toResponse(FormaPagamento e) {
        return new FormaPagamentoResponse(e.id, e.vezes, e.juros, e.desconto, e.ajusteParcelaAluno, e.ajusteParcela, e.operacao, e.tipoRegra, e.tipoRegraValor, e.periodicidade, e.perfilId, e.regra, e.ativo, e.usado, e.ajuste, e.cota, e.tipoPessoa, e.valorRegra, e.percentualMinimo, e.percentualMaximo, e.percentualMinimoAluno, e.percentualMaximoAluno, e.valorCota, e.valorCotaControle, e.dateCotaControle);
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(Integer.parseInt(query)).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoComplete2(Integer query) {
        return repository.find("(vezes) = ?1", query).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Void> verificarCotaAuto() {
        return repository.verificarCotaAutoNativo();
    }

    public Uni<Void> verificarCota() {
        return repository.verificarCotaNativo();
    }

    public Uni<Void> verificarCotaEntity(Long valorCursoId) {
        return repository.verificarCotaEntityNativo(valorCursoId);
    }

}

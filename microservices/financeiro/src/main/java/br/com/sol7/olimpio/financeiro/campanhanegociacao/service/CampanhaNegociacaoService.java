package br.com.sol7.olimpio.financeiro.campanhanegociacao;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class CampanhaNegociacaoService {

    @Inject CampanhaNegociacaoRepository repository;

    public Uni<List<CampanhaNegociacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CampanhaNegociacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CampanhaNegociacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CampanhaNegociacao not found"))
                .map(this::toResponse);
    }

    public Uni<CampanhaNegociacaoResponse> create(CampanhaNegociacaoRequest r) {
        var e = new CampanhaNegociacao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CampanhaNegociacaoResponse> update(Long id, CampanhaNegociacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CampanhaNegociacao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("CampanhaNegociacao not found")));
    }

    private void apply(CampanhaNegociacao e, CampanhaNegociacaoRequest r) { e.descricao = r.descricao(); e.diaPagamentoAntecipado = r.diaPagamentoAntecipado(); e.diasParaVencer = r.diasParaVencer(); e.dia = r.dia(); e.mes = r.mes(); e.parcela = r.parcela(); e.ano = r.ano(); e.valor = r.valor(); e.percentual = r.percentual(); e.ativo = r.ativo(); e.dataFim = r.dataFim(); }

    private CampanhaNegociacaoResponse toResponse(CampanhaNegociacao e) {
        return new CampanhaNegociacaoResponse(e.id, e.descricao, e.diaPagamentoAntecipado, e.diasParaVencer, e.dia, e.mes, e.parcela, e.ano, e.valor, e.percentual, e.ativo, e.dataFim);
    }
}

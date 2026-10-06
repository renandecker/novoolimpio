package br.com.sol7.olimpio.educacao.gerirnap;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class GerirNapService {

    @Inject
    GerirNapRepository repository;

    public Uni<List<GerirNapResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GerirNapResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<GerirNapResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("GerirNap not found"))
                .map(this::toResponse);
    }

    public Uni<GerirNapResponse> create(GerirNapRequest r) {
        var e = new GerirNap();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GerirNapResponse> update(Long id, GerirNapRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("GerirNap not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("GerirNap not found")));
    }

    private void apply(GerirNap e, GerirNapRequest r) {
        e.data = r.data();
        e.qtdEmails = r.qtdEmails();
        e.qtdCartas = r.qtdCartas();
        e.qtdLigacoes = r.qtdLigacoes();
        e.qtdPresente = r.qtdPresente();
        e.qtdAusente = r.qtdAusente();
        e.qtdAtestado = r.qtdAtestado();
        e.qtdMeiaPresenca = r.qtdMeiaPresenca();
        e.qtdSemRegistro = r.qtdSemRegistro();
        e.qtdCancelado = r.qtdCancelado();
        e.qtdTrocaTurma = r.qtdTrocaTurma();
        e.qtdProrrogado = r.qtdProrrogado();
        e.qtdDesistente = r.qtdDesistente();
        e.qtdAtrasado = r.qtdAtrasado();
    }

    private GerirNapResponse toResponse(GerirNap e) {
        return new GerirNapResponse(e.id, e.data, e.qtdEmails, e.qtdCartas, e.qtdLigacoes, e.qtdPresente, e.qtdAusente, e.qtdAtestado, e.qtdMeiaPresenca, e.qtdSemRegistro, e.qtdCancelado, e.qtdTrocaTurma, e.qtdProrrogado, e.qtdDesistente, e.qtdAtrasado);
    }


}


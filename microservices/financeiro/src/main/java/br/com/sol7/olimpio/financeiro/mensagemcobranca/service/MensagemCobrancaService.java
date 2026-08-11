package br.com.sol7.olimpio.financeiro.mensagemcobranca;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class MensagemCobrancaService {

    @Inject MensagemCobrancaRepository repository;

    public Uni<List<MensagemCobrancaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MensagemCobrancaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<MensagemCobrancaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MensagemCobranca not found"))
                .map(this::toResponse);
    }

    public Uni<MensagemCobrancaResponse> create(MensagemCobrancaRequest r) {
        var e = new MensagemCobranca();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MensagemCobrancaResponse> update(Long id, MensagemCobrancaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MensagemCobranca not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("MensagemCobranca not found")));
    }

    private void apply(MensagemCobranca e, MensagemCobrancaRequest r) { e.descricao = r.descricao(); e.assunto = r.assunto(); e.mensagem = r.mensagem(); e.flagEmail = r.flagEmail(); }

    private MensagemCobrancaResponse toResponse(MensagemCobranca e) {
        return new MensagemCobrancaResponse(e.id, e.descricao, e.assunto, e.mensagem, e.flagEmail);
    }
}

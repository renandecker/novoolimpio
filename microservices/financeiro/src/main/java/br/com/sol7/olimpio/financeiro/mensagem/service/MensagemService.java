package br.com.sol7.olimpio.financeiro.mensagem;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class MensagemService {

    @Inject MensagemRepository repository;

    public Uni<List<MensagemResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MensagemResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<MensagemResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Mensagem not found"))
                .map(this::toResponse);
    }

    public Uni<MensagemResponse> create(MensagemRequest r) {
        var e = new Mensagem();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MensagemResponse> update(Long id, MensagemRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Mensagem not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Mensagem not found")));
    }

    private void apply(Mensagem e, MensagemRequest r) { e.descricao = r.descricao(); e.assunto = r.assunto(); e.mensagem = r.mensagem(); e.flagEmail = r.flagEmail(); }

    private MensagemResponse toResponse(Mensagem e) {
        return new MensagemResponse(e.id, e.descricao, e.assunto, e.mensagem, e.flagEmail);
    }
}

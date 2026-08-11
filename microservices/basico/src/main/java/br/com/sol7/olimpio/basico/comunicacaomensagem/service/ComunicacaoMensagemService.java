package br.com.sol7.olimpio.basico.comunicacaomensagem.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.comunicacaomensagem.dto.ComunicacaoMensagemRequest;
import br.com.sol7.olimpio.basico.comunicacaomensagem.dto.ComunicacaoMensagemResponse;
import br.com.sol7.olimpio.basico.comunicacaomensagem.entity.ComunicacaoMensagem;
import br.com.sol7.olimpio.basico.comunicacaomensagem.repository.ComunicacaoMensagemRepository;

@ApplicationScoped
@WithTransaction
public class ComunicacaoMensagemService {

    @Inject ComunicacaoMensagemRepository repository;

    public Uni<List<ComunicacaoMensagemResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ComunicacaoMensagemResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ComunicacaoMensagemResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ComunicacaoMensagem not found"))
                .map(this::toResponse);
    }

    public Uni<ComunicacaoMensagemResponse> create(ComunicacaoMensagemRequest r) {
        var e = new ComunicacaoMensagem();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ComunicacaoMensagemResponse> update(Long id, ComunicacaoMensagemRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ComunicacaoMensagem not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ComunicacaoMensagem not found")));
    }

    private void apply(ComunicacaoMensagem e, ComunicacaoMensagemRequest r) { e.data = r.data(); e.comunicacaoId = r.comunicacaoId(); e.mensagem = r.mensagem(); }

    private ComunicacaoMensagemResponse toResponse(ComunicacaoMensagem e) {
        return new ComunicacaoMensagemResponse(e.id, e.data, e.comunicacaoId, e.mensagem);
    }
}

package br.com.sol7.olimpio.aula.avaliacao.service;

import br.com.sol7.olimpio.aula.avaliacao.entity.AvaliacaoPerguntaAnexo;
import br.com.sol7.olimpio.aula.avaliacao.repository.AvaliacaoPerguntaAnexoRepository;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AvaliacaoPerguntaAnexoRequest;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AvaliacaoPerguntaAnexoResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class AvaliacaoPerguntaAnexoService {

    @Inject
    AvaliacaoPerguntaAnexoRepository repository;

    public Uni<List<AvaliacaoPerguntaAnexoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AvaliacaoPerguntaAnexoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<AvaliacaoPerguntaAnexoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("AvaliacaoPerguntaAnexo not found"))
                .map(this::toResponse);
    }

    public Uni<AvaliacaoPerguntaAnexoResponse> create(AvaliacaoPerguntaAnexoRequest r) {
        var e = new AvaliacaoPerguntaAnexo();
        apply(e, r);
        return repository.persistAndFlush(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AvaliacaoPerguntaAnexoResponse> update(Long id, AvaliacaoPerguntaAnexoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("AvaliacaoPerguntaAnexo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("AvaliacaoPerguntaAnexo not found")));
    }

    private void apply(AvaliacaoPerguntaAnexo e, AvaliacaoPerguntaAnexoRequest r) {
        e.avaliacaoPerguntaId = r.avaliacaoPerguntaId();
        e.nome = r.nome();
        e.anexo = r.anexo();
    }

    private AvaliacaoPerguntaAnexoResponse toResponse(AvaliacaoPerguntaAnexo e) {
        return new AvaliacaoPerguntaAnexoResponse(e.id, e.avaliacaoPerguntaId, e.nome, e.anexo);
    }
}

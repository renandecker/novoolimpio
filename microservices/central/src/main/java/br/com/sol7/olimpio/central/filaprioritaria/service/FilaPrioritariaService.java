package br.com.sol7.olimpio.central.filaprioritaria;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Date;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class FilaPrioritariaService {

    @Inject
    FilaPrioritariaRepository repository;

    public Uni<List<FilaPrioritariaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FilaPrioritariaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<FilaPrioritariaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FilaPrioritaria not found"))
                .map(this::toResponse);
    }

    public Uni<FilaPrioritariaResponse> create(FilaPrioritariaRequest r) {
        var e = new FilaPrioritaria();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FilaPrioritariaResponse> update(Long id, FilaPrioritariaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FilaPrioritaria not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("FilaPrioritaria not found")));
    }

    public Uni<List<FilaPrioritariaResponse>> buscarPorUsuario(Long usuarioId) {
        return repository.buscarPorUsuario(usuarioId).map(list -> list.stream().map(this::toResponse).toList());
    }

    public Uni<List<FilaPrioritariaResponse>> buscarPorOrdemLigacao(Long ordemLigacaoId) {
        return repository.buscarPorOrdemLigacao(ordemLigacaoId).map(list -> list.stream().map(this::toResponse).toList());
    }

    public Uni<FilaPrioritariaResponse> buscarProximaRetorno(Long usuarioId) {
        return repository.buscarProximaRetorno(usuarioId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Nenhum retorno agendado"))
                .map(this::toResponse);
    }

    public Uni<Long> contarPorUsuarioEStatus(Long usuarioId, String status) {
        return repository.contarPorUsuarioEStatus(usuarioId, status);
    }

    public Uni<FilaPrioritariaResponse> agendarRetorno(Long ligacaoId, Long ordemLigacaoId, Date data, Long usuarioId) {
        var e = new FilaPrioritaria();
        e.ligacaoId = ligacaoId;
        e.ordemLigacaoId = ordemLigacaoId;
        e.data = data;
        e.status = "AGUARDANDO";
        e.usuarioId = usuarioId;
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FilaPrioritariaResponse> concluirRetorno(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FilaPrioritaria not found"))
                .invoke(e -> e.status = "CONCLUIDO")
                .map(this::toResponse);
    }

    public Uni<FilaPrioritariaResponse> cancelarRetorno(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FilaPrioritaria not found"))
                .invoke(e -> e.status = "CANCELADO")
                .map(this::toResponse);
    }

    private void apply(FilaPrioritaria e, FilaPrioritariaRequest r) {
        e.ligacaoId = r.ligacaoId();
        e.ordemLigacaoId = r.ordemLigacaoId();
        e.data = r.data();
        e.status = r.status();
        e.usuarioId = r.usuarioId();
    }

    private FilaPrioritariaResponse toResponse(FilaPrioritaria e) {
        return new FilaPrioritariaResponse(e.id, e.ligacaoId, e.ordemLigacaoId, e.data, e.status, e.usuarioId);
    }
}
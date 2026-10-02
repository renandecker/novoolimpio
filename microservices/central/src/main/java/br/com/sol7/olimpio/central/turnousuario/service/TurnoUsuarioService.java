package br.com.sol7.olimpio.central.turnousuario;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.GenericSearchService;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class TurnoUsuarioService {

    @Inject
    TurnoUsuarioRepository repository;

    @Inject
    GenericSearchService genericSearch;

    public Uni<List<TurnoUsuarioResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TurnoUsuarioResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<TurnoUsuarioResponse>> search(SearchFilterRequest request, int page, int size) {
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return genericSearch.search(TurnoUsuario.class, request, page, s)
                .map(paged -> new PagedResponse<>(
                        paged.content().stream().map(this::toResponse).toList(),
                        paged.totalElements(), paged.page(), paged.size()));
    }


    public Uni<TurnoUsuarioResponse> find(Long usuarioId, Long turnoTrabalhoId) {
        return repository.findById(new TurnoUsuario.TurnoUsuarioId(usuarioId, turnoTrabalhoId)).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoUsuario not found"))
                .map(this::toResponse);
    }

    public Uni<TurnoUsuarioResponse> create(TurnoUsuarioRequest r) {
        var e = new TurnoUsuario();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<TurnoUsuarioResponse> update(Long usuarioId, Long turnoTrabalhoId, TurnoUsuarioRequest r) {
        return repository.findById(new TurnoUsuario.TurnoUsuarioId(usuarioId, turnoTrabalhoId)).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoUsuario not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long usuarioId, Long turnoTrabalhoId) {
        return repository.deleteById(new TurnoUsuario.TurnoUsuarioId(usuarioId, turnoTrabalhoId)).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TurnoUsuario not found")));
    }

    private void apply(TurnoUsuario e, TurnoUsuarioRequest r) {
        e.usuarioId = r.usuarioId();
        e.turnoTrabalhoId = r.turnoTrabalhoId();
    }

    private TurnoUsuarioResponse toResponse(TurnoUsuario e) {
        return new TurnoUsuarioResponse(e.usuarioId, e.turnoTrabalhoId);
    }


    public Uni<List<Long>> atualizarListaDeTurnos(Long usuarioId) {
        return repository.buscarTurno(usuarioId).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarTurno(Long operadorId) {
        return repository.buscarTurno(operadorId).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<List<Long>> buscarTurnoDiaSemana(Long operadorId, Integer diaSemana) {
        return repository.buscarTurnoDiaSemana(operadorId, diaSemana).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    public Uni<Boolean> verificarTurnoDiaSemana(Long operadorId, Integer diaSemana) {
        return repository.verificarTurnoDiaSemana(operadorId, diaSemana).map(list -> !list.isEmpty());
    }

    public Uni<List<Long>> buscarTurnoUsuario(Long operadorId) {
        return repository.find("usuarioId = ?1", operadorId).list().map(list -> list.stream().map(x -> x.turnoTrabalhoId).toList());
    }

    // Replica TurnoUsuarioController.salvar() – substitui todos os vínculos do operador de forma atômica
    public Uni<Void> salvar(Long usuarioId, List<Long> turnoTrabalhoIds) {
        if (usuarioId == null) return Uni.createFrom().failure(new jakarta.ws.rs.BadRequestException("usuarioId é obrigatório"));
        List<Long> ids = turnoTrabalhoIds == null ? List.of() : turnoTrabalhoIds.stream().distinct().toList();
        return repository.delete("usuarioId", usuarioId)
                .chain(() -> {
                    if (ids.isEmpty()) return Uni.createFrom().voidItem();
                    var entities = ids.stream().map(tid -> {
                        var e = new TurnoUsuario();
                        e.usuarioId = usuarioId;
                        e.turnoTrabalhoId = tid;
                        return e;
                    }).toList();
                    return repository.persist(entities).replaceWithVoid();
                });
    }

    public Uni<List<TurnoUsuarioResponse>> buscarPorUsuario(Long usuarioId) {
        return repository.find("usuarioId = ?1", usuarioId).list().map(list -> list.stream().map(this::toResponse).toList());
    }

}

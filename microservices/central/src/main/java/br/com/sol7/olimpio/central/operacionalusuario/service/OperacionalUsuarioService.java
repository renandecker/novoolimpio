package br.com.sol7.olimpio.central.operacionalusuario;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.GenericSearchService;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class OperacionalUsuarioService {

    @Inject
    OperacionalUsuarioRepository repository;

    @Inject
    GenericSearchService genericSearch;

    public Uni<List<OperacionalUsuarioResponse>> listByOperacionalId(Long operacionalId) {
        return repository.findByOperacionalId(operacionalId)
                .map(list -> list.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    public Uni<PagedResponse<OperacionalUsuarioResponse>> search(SearchFilterRequest request, int page, int size) {
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return genericSearch.search(OperacionalUsuario.class, request, page, s)
                .map(paged -> new PagedResponse<>(
                        paged.content().stream().map(this::toResponse).toList(),
                        paged.totalElements(), paged.page(), paged.size()));
    }

    public Uni<OperacionalUsuarioResponse> create(OperacionalUsuarioRequest request) {
        var entity = new OperacionalUsuario();
        entity.operacionalId = request.operacionalId();
        entity.usuarioId = request.usuarioId();
        entity.status = request.status() != null ? request.status() : "AGUARDANDO";
        entity.meta = 0;
        entity.ligacao = 0;
        entity.agendado = 0;
        entity.pausa = 0;
        entity.prioritario = 0;
        return repository.persist(entity).replaceWith(() -> toResponse(entity));
    }

    public Uni<Void> deleteByOperacionalIdAndUsuarioId(Long operacionalId, Long usuarioId) {
        return repository.deleteByOperacionalIdAndUsuarioId(operacionalId, usuarioId);
    }

    private OperacionalUsuarioResponse toResponse(OperacionalUsuario e) {
        return new OperacionalUsuarioResponse(
                e.id, e.operacionalId, e.usuarioId, e.status,
                e.meta, e.ligacao, e.agendado, e.pausa, e.prioritario
        );
    }
}
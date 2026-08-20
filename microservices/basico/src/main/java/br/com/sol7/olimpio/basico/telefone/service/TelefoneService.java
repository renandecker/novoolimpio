package br.com.sol7.olimpio.basico.telefone.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.telefone.dto.TelefoneRequest;
import br.com.sol7.olimpio.basico.telefone.dto.TelefoneResponse;
import br.com.sol7.olimpio.basico.telefone.entity.Telefone;
import br.com.sol7.olimpio.basico.telefone.repository.TelefoneRepository;

@ApplicationScoped
@WithTransaction
public class TelefoneService {

    @Inject
    TelefoneRepository repository;

    public Uni<List<TelefoneResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TelefoneResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TelefoneResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Telefone not found"))
                .map(this::toResponse);
    }

    public Uni<TelefoneResponse> create(TelefoneRequest r) {
        var e = new Telefone();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<TelefoneResponse> update(Long id, TelefoneRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Telefone not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Telefone not found")));
    }

    private void apply(Telefone e, TelefoneRequest r) {
        e.numero = r.numero();
        e.token = r.token();
        e.operadora = r.operadora();
        e.tipoTelefoneId = r.tipoTelefoneId();
    }

    private TelefoneResponse toResponse(Telefone e) {
        return new TelefoneResponse(e.id, e.numero, e.token, e.operadora, e.tipoTelefoneId);
    }


    // Migrado de TelefoneController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/TelefoneController.java:85, camada controller)
    // Logica original (adaptar):
    // public List<Telefone> autoComplete(String query) {
    //         if (ObjectUtil.nullOrEmpty(query)) {
    //             return telefoneService.findAll();
    //         }
    // 
    //         return telefoneService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        if (query == null || query.isBlank()) {
            return repository.listAll().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de TelefoneService.buscarTelefoneUnidadePorUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/TelefoneService.java:26, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select tl from Usuario u left join u.unidades un left join un.telefones tl where u = ?1 and tl is not null
    // Logica original (adaptar):
    // public List<Telefone> buscarTelefoneUnidadePorUsuario(Usuario usuario) {
    //         return getTelefoneRepository().buscarTelefoneUnidadePorUsuario(usuario);
    //     }
    public Uni<List<Long>> buscarTelefoneUnidadePorUsuario(Long usuarioId) {
        return repository.buscarTelefoneUnidadePorUsuario(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }

}

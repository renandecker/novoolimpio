package br.com.sol7.olimpio.basico.favoritousuario.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.favoritousuario.dto.FavoritoUsuarioRequest;
import br.com.sol7.olimpio.basico.favoritousuario.dto.FavoritoUsuarioResponse;
import br.com.sol7.olimpio.basico.favoritousuario.entity.FavoritoUsuario;
import br.com.sol7.olimpio.basico.favoritousuario.repository.FavoritoUsuarioRepository;

@ApplicationScoped
@WithTransaction
public class FavoritoUsuarioService {

    @Inject FavoritoUsuarioRepository repository;

    public Uni<List<FavoritoUsuarioResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FavoritoUsuarioResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<FavoritoUsuarioResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FavoritoUsuario not found"))
                .map(this::toResponse);
    }

    public Uni<FavoritoUsuarioResponse> create(FavoritoUsuarioRequest r) {
        var e = new FavoritoUsuario();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FavoritoUsuarioResponse> update(Long id, FavoritoUsuarioRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("FavoritoUsuario not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("FavoritoUsuario not found")));
    }

    private void apply(FavoritoUsuario e, FavoritoUsuarioRequest r) { e.nome = r.nome(); e.icon = r.icon(); e.usuarioId = r.usuarioId(); e.moduloId = r.moduloId(); }

    private FavoritoUsuarioResponse toResponse(FavoritoUsuario e) {
        return new FavoritoUsuarioResponse(e.id, e.nome, e.icon, e.usuarioId, e.moduloId);
    }


    // Migrado de FavoritoUsuarioController.autoCompleteFavorito (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FavoritoUsuarioController.java:95, camada controller)
    // Logica original (adaptar):
    // public List<Modulo> autoCompleteFavorito(String query) {
    //         List<Modulo> modulosLivres = favoritoUsuarioService.autoCompleteFavoritoUsuario(usuarioLogadoController.getUsuario(), query);
    //         return modulosLivres;
    //     }
    public Uni<List<Long>> autoCompleteFavorito(String query) {
        // Obs: depende do microservico central (usuario logado) - autoCompleteFavoritoUsuario(usuarioLogadoController.getUsuario(), query)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FavoritoUsuarioService.buscarUsuarioeFavoritos (src/main/java/br/com/sol7/olimpio/service/services/basico/FavoritoUsuarioService.java:27, camada service)
    // Observacao: parametro usuariosId: era Usuario (referencia por id)
    // JPQL original: select fu from FavoritoUsuario fu inner join  fu.usuario  u where u = ?1
    // Logica original (adaptar):
    // public List<FavoritoUsuario> buscarUsuarioeFavoritos(Usuario usuarios) {
    //         return getFavoritoUsuarioRepository().buscarUsuarioPorPerfil(usuarios);
    //     }
    public Uni<List<Long>> buscarUsuarioeFavoritos(Long usuariosId) {
                return repository.buscarUsuarioPorPerfil(usuariosId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FavoritoUsuarioService.buscarUsuarioModuloPorPerfil (src/main/java/br/com/sol7/olimpio/service/services/basico/FavoritoUsuarioService.java:31, camada service)
    // Observacao: parametro usuariosId: era Usuario (referencia por id); parametro moduloId: era Modulo (referencia por id)
    // JPQL original: select fu from FavoritoUsuario fu inner join  fu.usuario  u where u = ?1
    // Logica original (adaptar):
    // public List<FavoritoUsuario> buscarUsuarioModuloPorPerfil(Usuario usuarios, Modulo modulo) {
    //         return getFavoritoUsuarioRepository().buscarUsuarioModuloPorPerfil(usuarios, modulo);
    //     }
    public Uni<List<Long>> buscarUsuarioModuloPorPerfil(Long usuariosId, Long moduloId) {
                return repository.buscarUsuarioModuloPorPerfil(usuariosId, moduloId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FavoritoUsuarioService.autoCompleteFavoritoUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/FavoritoUsuarioService.java:35, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // JPQL original: select m from Usuario u inner join u.perfis pp inner join pp.perfisModulos pm inner join pm.modulo m where u = ?1 and (lower(m.rotulo) like '%' || ?2 || '%' OR lower(m.descricao) like '%' || ?2 || '%'  OR str(m.id) = ?2) AND NOT (m.outcome is null OR m.outcome = '') order by m.rotulo
    // Logica original (adaptar):
    // public List<Modulo> autoCompleteFavoritoUsuario(Usuario usuario, String query) {
    //         return getFavoritoUsuarioRepository().autoCompleteFavoritoUsuario(usuario, query.toLowerCase().trim());
    //     }
    public Uni<List<Long>> autoCompleteFavoritoUsuario(Long usuarioId, String query) {
        return repository.autoCompleteFavoritoUsuario(usuarioId, query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
    }

}

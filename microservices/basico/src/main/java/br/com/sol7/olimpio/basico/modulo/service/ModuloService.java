package br.com.sol7.olimpio.basico.modulo.service;
import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.modulo.dto.ModuloRequest;
import br.com.sol7.olimpio.basico.modulo.dto.ModuloResponse;
import br.com.sol7.olimpio.basico.modulo.entity.Modulo;
import br.com.sol7.olimpio.basico.modulo.repository.ModuloRepository;

@ApplicationScoped
@WithTransaction
public class ModuloService {

    @Inject ModuloRepository repository;

    @CacheResult(cacheName = "modulo-menu-cache")
    public Uni<List<ModuloResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ModuloResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ModuloResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Modulo not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "modulo-menu-cache")
    public Uni<ModuloResponse> create(ModuloRequest r) {
        var e = new Modulo();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "modulo-menu-cache")
    public Uni<ModuloResponse> update(Long id, ModuloRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Modulo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "modulo-menu-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Modulo not found")));
    }

    private void apply(Modulo e, ModuloRequest r) { e.antecessorId = r.antecessorId(); e.rotulo = r.rotulo(); e.descricao = r.descricao(); e.icone = r.icone(); e.ajuda = r.ajuda(); e.outcome = r.outcome(); e.ordem = r.ordem(); }

    private ModuloResponse toResponse(Modulo e) {
        return new ModuloResponse(e.id, e.antecessorId, e.rotulo, e.descricao, e.icone, e.ajuda, e.outcome, e.ordem);
    }


    // Migrado de ModuloController.verificarAntecessor (src/main/java/br/com/sol7/olimpio/control/controllers/basico/ModuloController.java:84, camada controller)
    // Observacao: parametro moduloId: era Modulo (referencia por id)
    // Logica original (adaptar):
    // public boolean verificarAntecessor(Modulo modulo) {
    //         if (modulo.getAntecessor() != null) {
    //             if (ordem > 3) {
    //                 ordem = ordem + 1;
    //                 verificarAntecessor(modulo.getAntecessor());
    //             } else {
    //                 return true;
    //             }
    //         }
    //         return false;
    //     }
    public Uni<Boolean> verificarAntecessor(Long moduloId) {
        // Obs: helper de UI do controller JSF (usa o campo mutavel 'ordem' da tela)
        return Uni.createFrom().item(false);
    }


    // Migrado de ModuloController.carregarPerfis (src/main/java/br/com/sol7/olimpio/control/controllers/basico/ModuloController.java:106, camada controller)
    // Observacao: parametro moduloId: era Modulo (referencia por id)
    // Logica original (adaptar):
    // public void carregarPerfis(Modulo modulo) {
    //         perfils = perfilModuloService.buscarPerfilModulosComModulo(modulo);
    //         perfilsMarcados = null;
    //     }
    public Uni<Void> carregarPerfis(Long moduloId) {
        // Obs: metodo de UI do controller JSF (popula lista de perfis na tela via perfilModuloService)
        return Uni.createFrom().voidItem();
    }


    // Migrado de ModuloController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/ModuloController.java:153, camada controller)
    // Logica original (adaptar):
    // public List<Modulo> autoComplete(String query) {
    //         return moduloService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ModuloController.autoCompleteAntecessor (src/main/java/br/com/sol7/olimpio/control/controllers/basico/ModuloController.java:165, camada controller)
    // Logica original (adaptar):
    // public List<Modulo> autoCompleteAntecessor(String query) {
    //         return moduloService.autoCompleteAntecessor(query);
    //     }
    public Uni<List<Long>> autoCompleteAntecessor(String query) {
        return repository.autoCompleteAntecessor(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ModuloController.autoCompleteAntecessorOutcome (src/main/java/br/com/sol7/olimpio/control/controllers/basico/ModuloController.java:169, camada controller)
    // Logica original (adaptar):
    // public List<Modulo> autoCompleteAntecessorOutcome(String query) {
    //         return moduloService.autoCompleteAntecessorOutcome(query);
    //     }
    public Uni<List<Long>> autoCompleteAntecessorOutcome(String query) {
        return repository.autoCompleteAntecessorOutcome(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ModuloService.buscarPorOutcome (src/main/java/br/com/sol7/olimpio/service/services/basico/ModuloService.java:32, camada service)
    // Observacao: retorno: era Modulo (referencia por id)
    // Logica original (adaptar):
    // public Modulo buscarPorOutcome(String url) {
    //         if (!url.contains(DEFAULT_SUFFIX)) {
    //             url += DEFAULT_SUFFIX;
    //         }
    //         return getModuloRepository().buscarPorOutcome(url).get(0);
    //     }
    public Uni<Long> buscarPorOutcome(String url) {
        if (!url.contains(".xhtml")) {
            url += ".xhtml";
        }
        final String outcome = url;
        return repository.buscarPorOutcome(outcome).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ModuloService.autoCompleteFavorito (src/main/java/br/com/sol7/olimpio/service/services/basico/ModuloService.java:44, camada service)
    // Observacao: parametro perfilId: era Perfil (referencia por id)
    // Logica original (adaptar):
    // public List<Modulo> autoCompleteFavorito(Perfil perfil, String query) {
    //         query = query.toLowerCase();
    //         return getModuloRepository().autoCompleteFavorito(perfil, query);
    //     }
    public Uni<List<Long>> autoCompleteFavorito(Long perfilId, String query) {
        return repository.autoCompleteFavorito(perfilId, query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ModuloService.buscarPorRotulo (src/main/java/br/com/sol7/olimpio/service/services/basico/ModuloService.java:59, camada service)
    // Observacao: retorno: era Modulo (referencia por id)
    // Logica original (adaptar):
    // public Modulo buscarPorRotulo(String id) {
    //         return getModuloRepository().buscarPorRotulo(id);
    //     }
    public Uni<Long> buscarPorRotulo(String id) {
                return repository.find("rotulo = ?1", id).firstResult().map(x -> x == null ? null : x.id);
    }


    // Migrado de ModuloService.buscarAntecessoPorRotulo (src/main/java/br/com/sol7/olimpio/service/services/basico/ModuloService.java:63, camada service)
    // Observacao: parametro moduloId: era Modulo (referencia por id)
    // Logica original (adaptar):
    // public List<Modulo> buscarAntecessoPorRotulo(Modulo modulo) {
    //         return getModuloRepository().buscarAntecessoPorRotulo(modulo);
    //     }
    public Uni<List<Long>> buscarAntecessoPorRotulo(Long moduloId) {
                return repository.find("antecessorId = ?1", moduloId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}

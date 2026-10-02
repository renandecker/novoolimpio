package br.com.sol7.olimpio.estoque.configuracaoestoque;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ConfiguracaoEstoqueService {

    @Inject
    ConfiguracaoEstoqueRepository repository;

    public Uni<List<ConfiguracaoEstoqueResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ConfiguracaoEstoqueResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ConfiguracaoEstoqueResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoEstoque not found"))
                .map(this::toResponse);
    }

    public Uni<ConfiguracaoEstoqueResponse> create(ConfiguracaoEstoqueRequest r) {
        var e = new ConfiguracaoEstoque();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ConfiguracaoEstoqueResponse> update(Long id, ConfiguracaoEstoqueRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoEstoque not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ConfiguracaoEstoque not found")));
    }

    private void apply(ConfiguracaoEstoque e, ConfiguracaoEstoqueRequest r) {
        e.central = r.central();
        e.diasPrevisao = r.diasPrevisao();
        e.usuarioId = r.usuarioId();
        e.unidadeId = r.unidadeId();
        e.email = r.email();
        e.zoom = r.zoom();
        e.area = r.area();
    }

    private ConfiguracaoEstoqueResponse toResponse(ConfiguracaoEstoque e) {
        return new ConfiguracaoEstoqueResponse(e.id, e.central, e.diasPrevisao, e.usuarioId, e.unidadeId, e.email, e.zoom, e.area);
    }


    // Migrado de ConfiguracaoEstoqueController.autoCompleteUsuario (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/ConfiguracaoEstoqueController.java:100, camada controller)
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteUsuario(String query) {
    //         return usuarioService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoCompleteUsuario(String query) {
        // Obs: depende do microservico basico (Usuario) - usuarioService.autoComplete
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<Long> buscarConfiguracaoComUnidadeUsuario(Long unidadeId) {
        return repository.find("unidadeId = ?1 order by id desc", unidadeId).firstResult().map(x -> x == null ? null : x.id);
    }

    public Uni<Long> buscarCentral() {
        return repository.find("central = true order by id desc").firstResult().map(x -> x == null ? null : x.id);
    }

}

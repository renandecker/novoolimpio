package br.com.sol7.olimpio.basico.perfil.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.perfil.dto.PerfilRequest;
import br.com.sol7.olimpio.basico.perfil.dto.PerfilResponse;
import br.com.sol7.olimpio.basico.perfil.dto.PerfilUsuariosResponse;
import br.com.sol7.olimpio.basico.perfil.entity.Perfil;
import br.com.sol7.olimpio.basico.perfil.repository.PerfilRepository;
import br.com.sol7.olimpio.basico.usuario.repository.UsuarioRepository;

@ApplicationScoped
@WithTransaction
public class PerfilService {

    @Inject
    PerfilRepository repository;

    @Inject
    UsuarioRepository usuarioRepository;

    public Uni<List<PerfilResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PerfilResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<PerfilResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Perfil not found"))
                .map(this::toResponse);
    }

    public Uni<PerfilResponse> create(PerfilRequest r) {
        var e = new Perfil();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PerfilResponse> update(Long id, PerfilRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Perfil not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Perfil not found")));
    }

    private void apply(Perfil e, PerfilRequest r) {
        e.descricao = r.descricao();
        e.exibirFavorito = r.exibirFavorito();
        e.ajustarFavoritos = r.ajustarFavoritos();
        e.exibirFoto = r.exibirFoto();
        e.exibirSenha = r.exibirSenha();
        e.exibirMenu = r.exibirMenu();
        e.comunicar = r.comunicar();
        e.moduloId = r.moduloId();
        e.hierarquia = r.hierarquia();
    }

    private PerfilResponse toResponse(Perfil e) {
        return new PerfilResponse(e.id, e.descricao, e.exibirFavorito, e.ajustarFavoritos, e.exibirFoto, e.exibirSenha, e.exibirMenu, e.comunicar, e.moduloId, e.hierarquia);
    }


    public Uni<PerfilUsuariosResponse> carregarUsuarios(Long perfilId, Long usuarioLogadoId) {
        return usuarioRepository.buscarUnidadesDisponiveis(usuarioLogadoId).chain(unidades -> {
            List<Long> unidadesIds = unidades.stream().map(u -> u.id).toList();
            if (unidadesIds.isEmpty()) {
                return Uni.createFrom().item(new PerfilUsuariosResponse(List.of(), List.of()));
            }
            return usuarioRepository.buscarUsuarioPorUnidades(unidadesIds).chain(todos ->
                    usuarioRepository.usuarioComUnidadesPerfil(unidadesIds, perfilId).map(marcados ->
                            new PerfilUsuariosResponse(
                                    todos.stream().map(u -> u.id).toList(),
                                    marcados.stream().map(u -> u.id).toList())));
        });
    }

    // Migrado de PerfilController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PerfilController.java:364, camada controller)
    // Logica original (adaptar):
    // public List<Perfil> autoComplete(String query) {
    //         if (query.equals("") && ((usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN) || usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ESTRATEGICO)))) {
    //             return perfilService.autoCompleteAll();
    //         }
    //         if (!query.equals("") && ((usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN) || usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ESTRATEGICO)))) {
    //             return perfilService.autoComplete(query);
    //         }
    //         if (!query.equals("") && !usuarioLogadoController.getUsuario().getHierarquia().equal ...
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do usuario logado (hierarquia) nao disponivel na assinatura;
        // ver autoCompleteAll/autoComplete/autoCompleteComUsuario/autoCompleteDoUsuario
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<List<Long>> autoCompleteAll() {
        return repository.find("order by descricao").page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteComUsuario(String query, Long usuarioId) {
        return repository.autoCompleteComUsuario(query.toLowerCase().trim(), usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoCompleteDoUsuario(Long usuarioId) {
        return repository.autoCompleteDoUsuario(usuarioId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarPerfilComModulos(Integer id) {
        return repository.buscarPerfilComModulos(id).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarPerfilModulosComPerfil(Integer id) {
        return repository.buscarPerfilModulosComPerfil(id)
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

}

package br.com.sol7.olimpio.basico.usuariologado.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.usuariologado.dto.FavoritoDisponivelResponse;
import br.com.sol7.olimpio.basico.usuariologado.dto.UsuarioLogadoRequest;
import br.com.sol7.olimpio.basico.usuariologado.dto.UsuarioLogadoResponse;
import br.com.sol7.olimpio.basico.usuariologado.entity.UsuarioLogado;
import br.com.sol7.olimpio.basico.usuariologado.repository.UsuarioLogadoRepository;

@ApplicationScoped
@WithTransaction
public class UsuarioLogadoService {

    private static final String SQL_FAVORITOS_DO_USUARIO = """
            SELECT nome, icon, outcome
            FROM (
                SELECT DISTINCT ON (outcome) nome, icon, outcome
                FROM (
                    SELECT fu.nome, fu.icon, m.outcome, 0 AS prioridade
                    FROM bas_favorito_usuario fu
                    INNER JOIN bas_usuario u ON u.id = fu.id_usuario
                    INNER JOIN bas_modulo m ON m.id = fu.id_modulo
                    WHERE lower(u.login) = lower(?1)

                    UNION ALL

                    SELECT fp.nome, fp.icon, m.outcome, 1 AS prioridade
                    FROM bas_usuario u
                    INNER JOIN bas_usuario_perfil up ON up.id_usuario = u.id
                    INNER JOIN bas_favorito_perfil fp ON fp.id_perfil = up.id_perfil
                    INNER JOIN bas_modulo m ON m.id = fp.id_modulo
                    WHERE lower(u.login) = lower(?1)
                ) favoritos
                WHERE outcome IS NOT NULL AND trim(outcome) <> ''
                ORDER BY outcome, prioridade, nome
            ) favoritos_unicos
            ORDER BY nome
            """;

    @Inject UsuarioLogadoRepository repository;

    public Uni<List<UsuarioLogadoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    /**
     * Reproduz UsuarioLogadoController#listFavoritos do sistema legado: favoritos
     * específicos do usuário e favoritos de seus perfis. Quando ambos apontam
     * para o mesmo outcome, o favorito específico do usuário prevalece.
     */
    public Uni<List<FavoritoDisponivelResponse>> listarFavoritos(String username) {
        if (username == null || username.isBlank()) return Uni.createFrom().item(List.of());
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FAVORITOS_DO_USUARIO)
                        .setParameter(1, username)
                        .getResultList())
                .map(linhas -> linhas.stream()
                        .map(linha -> (Object[]) linha)
                        .map(linha -> new FavoritoDisponivelResponse(
                                linha[0] == null ? "" : linha[0].toString(),
                                linha[1] == null ? "" : linha[1].toString(),
                                linha[2] == null ? "" : linha[2].toString()))
                        .toList());
    }

    public Uni<PagedResponse<UsuarioLogadoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<UsuarioLogadoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("UsuarioLogado not found"))
                .map(this::toResponse);
    }

    public Uni<UsuarioLogadoResponse> create(UsuarioLogadoRequest r) {
        var e = new UsuarioLogado();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<UsuarioLogadoResponse> update(Long id, UsuarioLogadoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("UsuarioLogado not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("UsuarioLogado not found")));
    }

    private void apply(UsuarioLogado e, UsuarioLogadoRequest r) { e.usuarioId = r.usuarioId(); }

    private UsuarioLogadoResponse toResponse(UsuarioLogado e) {
        return new UsuarioLogadoResponse(e.id, e.usuarioId);
    }
}

package br.com.sol7.olimpio.login.controller;

import br.com.sol7.olimpio.login.permissao.service.ModulePermissionService;
import br.com.sol7.olimpio.login.repository.LoginRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;

import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

@Path("/api/permissao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PermissaoController {

    @Inject
    ModulePermissionService modulePermissions;
    @Inject
    LoginRepository loginRepository;

    /**
     * Permissões por coluna (outcome) do usuário autenticado, resolvidas do banco
     * a partir de bas_usuario_perfil, bas_perfil e bas_perfil_modulo. Formato igual
     * ao campo modulePermissions do LoginResponse (JWT), permitindo fallback no frontend.
     */
    @GET
    @Path("/me")
    public Uni<Map<String, Set<String>>> me(@Context ContainerRequestContext context) {
        return resolveByUsername(currentUsername(context));
    }

    /**
     * Permissões de uma tela/outcome específico como Set&lt;String&gt;. Colunas: READ (listagem),
     * CREATE (Novo), UPDATE (Editar), DELETE (Excluir), EXECUTE (ações customizadas).
     */
    @GET
    @Path("/me/{outcome: .+}")
    public Uni<Set<String>> outcome(@Context ContainerRequestContext context,
                                    @PathParam("outcome") String outcome) {
        String normalized = normalizar(outcome);
        return resolveByUsername(currentUsername(context))
                .map(map -> map.getOrDefault(normalized, Set.of("READ")));
    }

    /**
     * Permissões de bas_perfil_modulo por caminho/outcome. Retorna {novo, editar, remover, relatorio}
     * usadas pelo DataTable para controlar visibilidade de colunas de ação.
     */
    @GET
    @Path("/permissoes")
    public Uni<Map<String, Boolean>> permissoes(@Context ContainerRequestContext context,
                                                @jakarta.ws.rs.QueryParam("caminho") String caminho) {
        if (caminho == null || caminho.isBlank()) {
            return Uni.createFrom().item(Map.of("novo", false, "editar", false, "remover", false, "relatorio", false));
        }
        String normalized = normalizar(caminho);
        return resolveByUsername(currentUsername(context))
                .map(map -> {
                    Set<String> perms = map.getOrDefault(normalized, Set.of());
                    return Map.of(
                            "novo", perms.contains("CREATE"),
                            "editar", perms.contains("UPDATE"),
                            "remover", perms.contains("DELETE"),
                            "relatorio", perms.contains("EXECUTE")
                    );
                });
    }

    private String currentUsername(ContainerRequestContext context) {
        Object value = context.getProperty("authenticatedUser");
        return value instanceof String username ? username : null;
    }

    private Uni<Map<String, Set<String>>> resolveByUsername(String username) {
        if (username == null || username.isBlank()) return Uni.createFrom().item(Map.of());
        return loginRepository.findByUsername(username.trim().toLowerCase())
                .onItem().transformToUni(login -> modulePermissions.resolve(login == null ? null : login.idUsuario));
    }

    private String normalizar(String value) {
        String resultado = value.trim();
        if (resultado.toLowerCase(java.util.Locale.ROOT).endsWith(".xhtml")) {
            resultado = resultado.substring(0, resultado.length() - ".xhtml".length());
        }
        while (resultado.startsWith("/")) resultado = resultado.substring(1);
        while (resultado.endsWith("/")) resultado = resultado.substring(0, resultado.length() - 1);
        return resultado;
    }
}

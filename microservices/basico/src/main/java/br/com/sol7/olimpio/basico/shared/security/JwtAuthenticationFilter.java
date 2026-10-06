package br.com.sol7.olimpio.basico.shared.security;

import br.com.sol7.olimpio.basico.shared.security.JwtTokenService;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.util.Map;
import java.util.Set;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class JwtAuthenticationFilter implements ContainerRequestFilter {
    @Inject
    JwtTokenService jwt;

    @Override
    public void filter(ContainerRequestContext context) {
        String path = context.getUriInfo().getPath();
        if (path.startsWith("/")) path = path.substring(1);
        if (path.equals("api/login/authenticate") || path.equals("api/login/bootstrap") || path.equals("api/basico/modulo/menu")) return;
        String authorization = context.getHeaderString("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            reject(context, Response.Status.UNAUTHORIZED, "Token Bearer ausente");
            return;
        }
try {
            var claims = jwt.verify(authorization.substring(7));
            if (!isConsultaDeAcesso(path)) {
                String required = requiredPermission(context, path);
                if (!isAuthorized(claims, required, context.getMethod(), path)) {
                    reject(context, Response.Status.FORBIDDEN, "Permiss\u00e3o insuficiente: " + required);
                    return;
                }
            }
            context.getHeaders().putSingle("X-Authenticated-Permissions", String.join(",", claims.permissions()));
            context.getHeaders().putSingle("X-Authenticated-Username", claims.subject());
            context.setProperty("modulePermissions", claims.modulePermissions());
            context.setProperty("authenticatedUser", claims.subject());
        } catch (IllegalArgumentException exception) {
            reject(context, Response.Status.UNAUTHORIZED, "Token inválido ou expirado");
        }
    }

    /**
     * A consulta de acesso valida apenas a autenticacao do token. Exigir uma
     * permissao aqui criaria uma circularidade: o usuario que precisa descobrir o
     * que pode fazer na tela nao tem como passar por um gate que depende da
     * resposta desta mesma consulta.
     */
    private boolean isConsultaDeAcesso(String path) {
        return path.equals("api/basico/verificar-acesso") || path.startsWith("api/basico/verificar-acesso/");
    }

    private String requiredPermission(ContainerRequestContext context, String path) {
        if (path.startsWith("api/view") || path.endsWith("/search")) return "READ";
        return switch (context.getMethod()) {
            case "POST" ->"CREATE";
            case "PUT","PATCH" ->"UPDATE";
            case "DELETE" ->"DELETE";
            default ->"READ";
        } ;
    }

    /**
     * Uma requisicao e autorizada quando a permissao vem das permissoes globais do
     * token ou quando a tela que usa o recurso libera a permissao. O segundo caso
     * aplica a regra de negocio bas_perfil_modulo tambem no backend, e nao apenas
     * na interface. Recurso sem tela mapeada cai so no primeiro caso.
     */
    private boolean isAuthorized(JwtTokenService.Claims claims, String required, String method, String path) {
        if (claims.permissions().contains(required)) return true;
        for (String outcome : OutcomeRoutes.outcomesOf(method, path)) {
            Set<String> concedidas = claims.modulePermissions().get(outcome);
            if (concedidas != null && concedidas.contains(required)) return true;
        }
        return false;
    }

    private void reject(ContainerRequestContext context, Response.Status status, String error) {
        context.abortWith(Response.status(status).type(MediaType.APPLICATION_JSON).entity(Map.of("error", error)).build());
    }
}
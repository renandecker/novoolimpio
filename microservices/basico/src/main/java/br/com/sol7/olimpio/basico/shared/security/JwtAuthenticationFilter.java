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

@Provider
@Priority(Priorities.AUTHENTICATION)
public class JwtAuthenticationFilter implements ContainerRequestFilter {
    @Inject JwtTokenService jwt;
    @Override public void filter(ContainerRequestContext context) {
        String path = context.getUriInfo().getPath();
        if (path.startsWith("/")) path = path.substring(1);
        if (path.equals("api/login/authenticate") || path.equals("api/login/bootstrap")) return;
        String authorization = context.getHeaderString("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) { reject(context, Response.Status.UNAUTHORIZED, "Token Bearer ausente"); return; }
        try {
            var claims = jwt.verify(authorization.substring(7));
            String required = requiredPermission(context, path);
            if (!claims.permissions().contains(required)) { reject(context, Response.Status.FORBIDDEN, "Permissão insuficiente: " + required); return; }
            context.getHeaders().putSingle("X-Authenticated-Permissions", String.join(",", claims.permissions()));
            context.getHeaders().putSingle("X-Authenticated-Username", claims.subject());
            context.setProperty("modulePermissions", claims.modulePermissions());
            context.setProperty("authenticatedUser", claims.subject());
        } catch (IllegalArgumentException exception) { reject(context, Response.Status.UNAUTHORIZED, "Token inválido ou expirado"); }
    }
    private String requiredPermission(ContainerRequestContext context, String path) {
        if (path.startsWith("api/view") || path.contains("/actions/")) return "READ";
        return switch (context.getMethod()) { case "POST" -> "CREATE"; case "PUT", "PATCH" -> "UPDATE"; case "DELETE" -> "DELETE"; default -> "READ"; };
    }
    private void reject(ContainerRequestContext context, Response.Status status, String error) { context.abortWith(Response.status(status).type(MediaType.APPLICATION_JSON).entity(Map.of("error", error)).build()); }
}
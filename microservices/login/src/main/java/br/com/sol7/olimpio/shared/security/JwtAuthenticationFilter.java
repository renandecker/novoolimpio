package br.com.sol7.olimpio.shared.security;

import br.com.sol7.olimpio.login.repository.LoginSessionRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;

@ApplicationScoped
public class JwtAuthenticationFilter {
    @Inject JwtTokenService jwt;
    @Inject LoginSessionRepository sessions;
    @ServerRequestFilter(priority = 2000)
    public Uni<Void> filter(ContainerRequestContext context) {
        String path = context.getUriInfo().getPath();
        if (path.startsWith("/")) path = path.substring(1);
        final String normalizedPath = path;
        if (normalizedPath.equals("api/login/authenticate") || normalizedPath.equals("api/login/bootstrap") || normalizedPath.equals("api/login/forgot-password")) return Uni.createFrom().voidItem();
        String authorization = context.getHeaderString("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) { reject(context, Response.Status.UNAUTHORIZED, "Token Bearer ausente"); return Uni.createFrom().voidItem(); }
        try {
            var claims = jwt.verify(authorization.substring(7));
            return sessions.isActive(claims.jti()).flatMap(active -> {
                if (!active) { reject(context, Response.Status.UNAUTHORIZED, "Sessão encerrada"); return Uni.createFrom().voidItem(); }
                if (!normalizedPath.startsWith("api/permissao") && !normalizedPath.equals("api/login/logout") && !normalizedPath.equals("api/login/change-password")) {
                    String required = requiredPermission(context, normalizedPath);
                    if (!claims.permissions().contains(required)) { reject(context, Response.Status.FORBIDDEN, "Permissão insuficiente: " + required); return Uni.createFrom().voidItem(); }
                }
                context.getHeaders().putSingle("X-Authenticated-Permissions", String.join(",", claims.permissions()));
                context.setProperty("modulePermissions", claims.modulePermissions());
                context.setProperty("authenticatedUser", claims.subject());
                return Uni.createFrom().voidItem();
            });
        } catch (IllegalArgumentException exception) { reject(context, Response.Status.UNAUTHORIZED, "Token inválido ou expirado"); return Uni.createFrom().voidItem(); }
    }
    private String requiredPermission(ContainerRequestContext context, String path) {
        if (path.startsWith("api/view") || path.contains("/actions/")) return "READ";
        return switch (context.getMethod()) { case "POST" -> "CREATE"; case "PUT", "PATCH" -> "UPDATE"; case "DELETE" -> "DELETE"; default -> "READ"; };
    }
    private void reject(ContainerRequestContext context, Response.Status status, String error) { context.abortWith(Response.status(status).type(MediaType.APPLICATION_JSON).entity(Map.of("error", error)).build()); }
}

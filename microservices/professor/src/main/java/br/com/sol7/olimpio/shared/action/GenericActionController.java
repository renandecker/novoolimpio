package br.com.sol7.olimpio.shared.action;
import br.com.sol7.olimpio.shared.security.Permission;
import br.com.sol7.olimpio.shared.security.PermissionGuard;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Path("/api/professor/actions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GenericActionController {
    @Inject GenericActionService service;
    @Inject PermissionGuard permissions;

    @GET
    @Path("/catalog")
    public Uni<Map<String, List<String>>> catalog() {
        return service.catalog();
    }

    @POST
    @Path("/{resource}/{action}")
    public Uni<ActionResponse> execute(@Context ContainerRequestContext context,
                                       @HeaderParam("X-Authenticated-Permissions") String granted,
                                       @HeaderParam("X-Screen-Outcome") String outcome,
                                       @PathParam("resource") String resource,
                                       @PathParam("action") String action,
                                       ActionRequest request) {
        permissions.requireModule(modulePermissionsOf(context), granted, outcome, Permission.EXECUTE);
        return service.execute("professor", resource, action, request);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Set<String>> modulePermissionsOf(ContainerRequestContext context) {
        Object value = context.getProperty("modulePermissions");
        return value instanceof Map ? (Map<String, Set<String>>) value : null;
    }
}

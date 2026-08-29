package br.com.sol7.olimpio.basico.view.controller;

import br.com.sol7.olimpio.basico.view.service.ViewService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.security.Permission;
import br.com.sol7.olimpio.shared.security.PermissionGuard;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Path("/api/view")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ViewResource {
    @Inject
    ViewService service;
    @Inject
    PermissionGuard permissions;

    @GET
    @Path("/{feature}/{resource}/paged")
    public Uni<PagedResponse<Map<String, Object>>> paged(@PathParam("feature") String feature,
                                                         @PathParam("resource") String resource,
                                                         @QueryParam("page") Integer page,
                                                         @QueryParam("size") Integer size) {
        return service.paged(feature, resource, page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{feature}/{resource}")
    public Uni<List<Map<String, Object>>> list(@PathParam("feature") String feature,
                                               @PathParam("resource") String resource) {
        return service.list(feature, resource);
    }

    @GET
    @Path("/{feature}/{resource}/refs")
    public Uni<Map<String, List<Map<String, Object>>>> refs(@PathParam("feature") String feature,
                                                            @PathParam("resource") String resource) {
        return service.refs(feature, resource);
    }

    @POST
    @Path("/{feature}/{resource}")
    public Uni<Response> create(@Context ContainerRequestContext context,
                                @HeaderParam("X-Authenticated-Permissions") String granted,
                                @PathParam("feature") String feature,
                                @PathParam("resource") String resource,
                                Map<String, Object> body) {
        permissions.requireModule(modulePermissionsOf(context), granted, outcome(feature, resource), Permission.CREATE);
        return service.create(feature, resource, body == null ? Map.of() : body)
                .map(row -> Response.status(Response.Status.CREATED).entity(row).build())
                .onFailure().recoverWithItem(failure ->
                        Response.status(Response.Status.BAD_REQUEST)
                                .entity(Map.of("error", String.valueOf(failure.getMessage()))).build());
    }

    @PUT
    @Path("/{feature}/{resource}/{id}")
    public Uni<Response> update(@Context ContainerRequestContext context,
                                @HeaderParam("X-Authenticated-Permissions") String granted,
                                @PathParam("feature") String feature,
                                @PathParam("resource") String resource,
                                @PathParam("id") Long id,
                                Map<String, Object> body) {
        permissions.requireModule(modulePermissionsOf(context), granted, outcome(feature, resource), Permission.UPDATE);
        return service.update(feature, resource, id, body == null ? Map.of() : body)
                .map(row -> Response.status(Response.Status.OK).entity(row).build())
                .onFailure().recoverWithItem(failure ->
                        Response.status(Response.Status.BAD_REQUEST)
                                .entity(Map.of("error", String.valueOf(failure.getMessage()))).build());
    }

    @DELETE
    @Path("/{feature}/{resource}/{id}")
    public Uni<Response> delete(@Context ContainerRequestContext context,
                                @HeaderParam("X-Authenticated-Permissions") String granted,
                                @PathParam("feature") String feature,
                                @PathParam("resource") String resource,
                                @PathParam("id") Long id) {
        permissions.requireModule(modulePermissionsOf(context), granted, outcome(feature, resource), Permission.DELETE);
        return service.delete(feature, resource, id)
                .map(ignored -> Response.status(Response.Status.NO_CONTENT).build())
                .onFailure().recoverWithItem(failure ->
                        Response.status(Response.Status.BAD_REQUEST)
                                .entity(Map.of("error", String.valueOf(failure.getMessage()))).build());
    }

    @GET
    @Path("/{feature}/{resource}/{id}")
    public Uni<Map<String, Object>> findById(@PathParam("feature") String feature,
                                              @PathParam("resource") String resource,
                                              @PathParam("id") Long id) {
        return service.findById(feature, resource, id);
    }

    private String outcome(String feature, String resource) {
        return "view/" + feature + "/" + resource;
    }

    @SuppressWarnings("unchecked")
    @POST
    @Path("/{feature}/{resource}/search")
    public Uni<PagedResponse<Map<String, Object>>> search(@PathParam("feature") String feature,
                                                           @PathParam("resource") String resource,
                                                           @QueryParam("page") Integer page,
                                                           @QueryParam("size") Integer size,
                                                           Map<String, Object> filters) {
        return service.search(feature, resource, page == null ? 0 : page, size == null ? 10 : size, filters == null ? Map.of() : filters);
    }

    private Map<String, Set<String>> modulePermissionsOf(ContainerRequestContext context) {
        Object value = context.getProperty("modulePermissions");
        return value instanceof Map ? (Map<String, Set<String>>) value : null;
    }
}

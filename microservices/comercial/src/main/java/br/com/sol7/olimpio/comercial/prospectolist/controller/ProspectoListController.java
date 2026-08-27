package br.com.sol7.olimpio.comercial.prospectolist;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Map;

@Path("/api/comercial/prospecto-list")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProspectoListController {
    @Inject
    ProspectoListService service;

    @GET
    public Uni<List<ProspectoListResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ProspectoListResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ProspectoListResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ProspectoListRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ProspectoListResponse> update(@PathParam("id") Long id, @Valid ProspectoListRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/carregar-quantidade-ligacao")
    public Uni<List<Map<String, Object>>> carregarQuantidadeLigacao(@QueryParam("prospectoId") Long prospectoId) {
        return service.carregarQuantidadeLigacao(prospectoId);
    }

    @GET
    @Path("/carregar-historico-ligacao")
    public Uni<List<Map<String, Object>>> carregarHistoricoLigacao(@QueryParam("prospectoId") Long prospectoId) {
        return service.carregarHistoricoLigacao(prospectoId);
    }

    @GET
    @Path("/carregar-prospectos-link")
    public Uni<List<Map<String, Object>>> carregarProspectosLink() {
        return service.carregarProspectosLink();
    }

    @POST
    @Path("/salvar-prospecto-link")
    public Uni<Response> salvarProspectoLink(Map<String, Object> r) {
        return service.salvarProspectoLink(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @POST
    @Path("/inativar")
    public Uni<Response> inativar(@QueryParam("id") Long id) {
        return service.inativar(id).map(item -> Response.ok(item).build());
    }


}
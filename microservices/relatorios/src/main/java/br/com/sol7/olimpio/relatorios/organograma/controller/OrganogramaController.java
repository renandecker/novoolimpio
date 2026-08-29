package br.com.sol7.olimpio.relatorios.organograma;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/relatorios/organograma")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrganogramaController {
    @Inject
    OrganogramaService service;

    @GET
    public Uni<List<OrganogramaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<OrganogramaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<OrganogramaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    /**
     * Executa, em tempo real e sem persistir nada, o SQL cadastrado no organograma e devolve
     * os nós já normalizados (id, parentId, name, job, department, location, status, avatar)
     * com a cor calculada por departamento, prontos para o AG Charts Org Chart.
     */
    @GET
    @Path("/{id}/dados")
    public Uni<OrganogramaDadosResponse> dados(@PathParam("id") Long id) {
        return service.dados(id);
    }

    @POST
    public Uni<Response> create(@Valid OrganogramaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<OrganogramaResponse> update(@PathParam("id") Long id, @Valid OrganogramaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/buscar-unidades")
    public Uni<List<Long>> buscarUnidades(@QueryParam("id") Long id) {
        return service.buscarUnidades(id);
    }


    @GET
    @Path("/buscar-perfils")
    public Uni<List<Long>> buscarPerfils(@QueryParam("id") Long id) {
        return service.buscarPerfils(id);
    }


    @GET
    @Path("/buscar-usuarios")
    public Uni<List<Long>> buscarUsuarios(@QueryParam("id") Long id) {
        return service.buscarUsuarios(id);
    }

}
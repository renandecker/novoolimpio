package br.com.sol7.olimpio.comercial.consultor;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/comercial/consultor")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ConsultorController {
    @Inject
    ConsultorService service;

    @GET
    public Uni<List<ConsultorResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ConsultorResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ConsultorResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ConsultorRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ConsultorResponse> update(@PathParam("id") Long id, @Valid ConsultorRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-com-unidade")
    public Uni<List<Long>> autoCompleteComUnidade(@QueryParam("query") String query) {
        return service.autoCompleteComUnidade(query);
    }


    @GET
    @Path("/buscar-consultor-com-turnos")
    public Uni<Long> buscarConsultorComTurnos(@QueryParam("entityId") Long entityId) {
        return service.buscarConsultorComTurnos(entityId);
    }


    @GET
    @Path("/buscar-usuario-no-consultor")
    public Uni<Long> buscarUsuarioNoConsultor(@QueryParam("entityId") Long entityId) {
        return service.buscarUsuarioNoConsultor(entityId);
    }

}
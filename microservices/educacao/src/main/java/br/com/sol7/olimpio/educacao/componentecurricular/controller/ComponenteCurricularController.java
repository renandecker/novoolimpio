package br.com.sol7.olimpio.educacao.componentecurricular;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/componente-curricular")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ComponenteCurricularController {
    @Inject
    ComponenteCurricularService service;

    @GET
    public Uni<List<ComponenteCurricularResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ComponenteCurricularResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ComponenteCurricularResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ComponenteCurricularRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ComponenteCurricularResponse> update(@PathParam("id") Long id, @Valid ComponenteCurricularRequest r) {
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
    @Path("/autocomplete")
    public Uni<List<Long>> autocomplete(@QueryParam("query") String query) {
        return service.autocomplete(query);
    }


    @GET
    @Path("/autocomplete-componente-ativo-professor")
    public Uni<List<Long>> autocompleteComponenteAtivoProfessor(@QueryParam("query") String query) {
        return service.autocompleteComponenteAtivoProfessor(query);
    }


    @GET
    @Path("/autocomplete-componente-ativo")
    public Uni<List<Long>> autocompleteComponenteAtivo(@QueryParam("query") String query) {
        return service.autocompleteComponenteAtivo(query);
    }


    @GET
    @Path("/buscar-componente-curricular-com-base-tecnologica")
    public Uni<Long> buscarComponenteCurricularComBaseTecnologica(@QueryParam("entityId") Long entityId) {
        return service.buscarComponenteCurricularComBaseTecnologica(entityId);
    }


    @GET
    @Path("/buscar-componente-curricular-com-referencia-bibliografica")
    public Uni<Long> buscarComponenteCurricularComReferenciaBibliografica(@QueryParam("entityId") Long entityId) {
        return service.buscarComponenteCurricularComReferenciaBibliografica(entityId);
    }


    @GET
    @Path("/buscar-componente-curricular-com-cronograma")
    public Uni<Long> buscarComponenteCurricularComCronograma(@QueryParam("entityId") Long entityId) {
        return service.buscarComponenteCurricularComCronograma(entityId);
    }


    @GET
    @Path("/buscar-existencia-em-oferecimento")
    public Uni<List<Long>> buscarExistenciaEmOferecimento(@QueryParam("entityId") Long entityId) {
        return service.buscarExistenciaEmOferecimento(entityId);
    }

}

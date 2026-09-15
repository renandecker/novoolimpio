package br.com.sol7.olimpio.educacao.tipocurso;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Map;

@Path("/api/educacao/tipo-curso")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TipoCursoController {
    @Inject
    TipoCursoService service;

    @GET
    public Uni<List<TipoCursoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<TipoCursoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<TipoCursoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid TipoCursoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<TipoCursoResponse> update(@PathParam("id") Long id, @Valid TipoCursoRequest r) {
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
    @Path("/opcoes")
    public Uni<List<Map<String, Object>>> opcoes(@QueryParam("query") String query) {
        return service.list().map(list -> {
            String q = query == null ? "" : query.toLowerCase().trim();
            return list.stream()
                    .filter(r -> q.isEmpty() || (r.descricao() != null && r.descricao().toLowerCase().contains(q)))
                    .map(r -> {
                        Map<String, Object> m = new java.util.LinkedHashMap<>();
                        m.put("id", r.id());
                        m.put("label", r.descricao() != null ? r.descricao() : "#" + r.id());
                        m.put("descricao", r.descricao());
                        return m;
                    }).toList();
        });
    }

}

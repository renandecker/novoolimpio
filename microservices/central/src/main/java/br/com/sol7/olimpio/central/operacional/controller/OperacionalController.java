package br.com.sol7.olimpio.central.operacional;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/central/operacional")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OperacionalController {
    @Inject
    OperacionalService service;

    @GET
    public Uni<List<OperacionalResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<OperacionalResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<OperacionalResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid OperacionalRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<OperacionalResponse> update(@PathParam("id") Long id, @Valid OperacionalRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-operacionais-do-coordenador")
    public Uni<List<Long>> buscarOperacionaisDoCoordenador() {
        return service.buscarOperacionaisDoCoordenador();
    }


    @GET
    @Path("/buscar-filtros")
    public Uni<List<Long>> buscarFiltros(@QueryParam("operacionalId") Long operacionalId) {
        return service.buscarFiltros(operacionalId);
    }


    @GET
    @Path("/buscar-todos")
    public Uni<List<Long>> buscarTodos() {
        return service.buscarTodos();
    }


    @GET
    @Path("/buscar-prospectos")
    public Uni<List<Long>> buscarProspectos(@QueryParam("opId") Long opId) {
        return service.buscarProspectos(opId);
    }


    @GET
    @Path("/buscar-ligacoes")
    public Uni<List<Long>> buscarLigacoes(@QueryParam("opId") Long opId) {
        return service.buscarLigacoes(opId);
    }


    @GET
    @Path("/buscar-ligacoes-com-usuario")
    public Uni<List<Long>> buscarLigacoesComUsuario(@QueryParam("usuarioId") Long usuarioId) {
        return service.buscarLigacoesComUsuario(usuarioId);
    }


    @GET
    @Path("/buscar-operacional-com-coordenador")
    public Uni<Long> buscarOperacionalComCoordenador(@QueryParam("id") Integer id) {
        return service.buscarOperacionalComCoordenador(id);
    }


    @GET
    @Path("/buscar-operacionais-do-coordenador2")
    public Uni<List<Long>> buscarOperacionaisDoCoordenador2(@QueryParam("coordenadorId") Long coordenadorId) {
        return service.buscarOperacionaisDoCoordenador2(coordenadorId);
    }


    @GET
    @Path("/buscar-coordenador-operacional")
    public Uni<Long> buscarCoordenadorOperacional(@QueryParam("operacionalId") Long operacionalId) {
        return service.buscarCoordenadorOperacional(operacionalId);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<OperacionalResponse>> search(SearchFilterRequest request,
            @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.search(request, page == null ? 0 : page, size == null ? 10 : size);
    }

}
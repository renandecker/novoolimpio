package br.com.sol7.olimpio.bibliotecavirtual.filaespera.controller;

import br.com.sol7.olimpio.bibliotecavirtual.filaespera.dto.FilaEsperaDigitalRequest;
import br.com.sol7.olimpio.bibliotecavirtual.filaespera.dto.FilaEsperaDigitalResponse;
import br.com.sol7.olimpio.bibliotecavirtual.filaespera.service.FilaEsperaDigitalService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.action.GenericActionController;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/biblioteca-virtual/fila-espera")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FilaEsperaDigitalController extends GenericActionController {

    @Inject
    FilaEsperaDigitalService service;

    @GET
    public Uni<PagedResponse<FilaEsperaDigitalResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FilaEsperaDigitalResponse>> paged(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<FilaEsperaDigitalResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/{id}")
    public Uni<FilaEsperaDigitalResponse> buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @POST
    public Uni<Response> entrarNaFila(@Valid FilaEsperaDigitalRequest request) {
        return service.entrarNaFila(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/livro/{livroDigitalId}/notificar-proximo")
    public Uni<FilaEsperaDigitalResponse> notificarProximoDaFila(@PathParam("livroDigitalId") Long livroDigitalId) {
        return service.notificarProximoDaFila(livroDigitalId);
    }

    @PUT
    @Path("/{id}/resgatar")
    public Uni<FilaEsperaDigitalResponse> resgatar(@PathParam("id") Long id) {
        return service.resgatar(id);
    }

    @PUT
    @Path("/{id}/cancelar")
    public Uni<FilaEsperaDigitalResponse> cancelar(@PathParam("id") Long id) {
        return service.cancelar(id);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> excluir(@PathParam("id") Long id) {
        return service.excluir(id)
                .onItem().transform(v -> Response.noContent().build());
    }

    @GET
    @Path("/usuario/{usuarioId}")
    public Uni<List<FilaEsperaDigitalResponse>> buscarPorUsuario(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarPorUsuario(usuarioId);
    }

    @GET
    @Path("/livro/{livroDigitalId}")
    public Uni<List<FilaEsperaDigitalResponse>> buscarPorLivroDigital(@PathParam("livroDigitalId") Long livroDigitalId) {
        return service.buscarPorLivroDigital(livroDigitalId);
    }
}
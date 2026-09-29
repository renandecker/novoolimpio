package br.com.sol7.olimpio.biblioteca.emprestimo.controller;

import br.com.sol7.olimpio.biblioteca.emprestimo.dto.EmprestimoRequest;
import br.com.sol7.olimpio.biblioteca.emprestimo.dto.EmprestimoResponse;
import br.com.sol7.olimpio.biblioteca.emprestimo.service.EmprestimoService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.action.GenericActionController;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Path("/api/biblioteca-fisica/emprestimo")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmprestimoController extends GenericActionController {

    @Inject
    EmprestimoService service;

    @GET
    public Uni<PagedResponse<EmprestimoResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<EmprestimoResponse>> paged(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<EmprestimoResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/{id}")
    public Uni<EmprestimoResponse> buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @POST
    public Uni<Response> criar(@Valid EmprestimoRequest request) {
        return service.criar(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/{id}/devolver")
    public Uni<EmprestimoResponse> devolver(
            @PathParam("id") Long id,
            @QueryParam("dataDevolucao") LocalDateTime dataDevolucao) {
        return service.devolver(id, dataDevolucao);
    }

    @PUT
    @Path("/{id}/renovar")
    public Uni<EmprestimoResponse> renovar(
            @PathParam("id") Long id,
            @QueryParam("novaDataPrevista") LocalDate novaDataPrevista) {
        return service.renovar(id, novaDataPrevista);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> excluir(@PathParam("id") Long id) {
        return service.excluir(id)
                .onItem().transform(v -> Response.noContent().build());
    }

    @GET
    @Path("/usuario/{usuarioId}")
    public Uni<List<EmprestimoResponse>> buscarPorUsuario(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarPorUsuario(usuarioId);
    }

    @GET
    @Path("/usuario/{usuarioId}/ativos")
    public Uni<List<EmprestimoResponse>> buscarAtivosPorUsuario(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarAtivosPorUsuario(usuarioId);
    }

    @GET
    @Path("/atrasados")
    public Uni<List<EmprestimoResponse>> buscarAtrasados() {
        return service.buscarAtrasados();
    }
}
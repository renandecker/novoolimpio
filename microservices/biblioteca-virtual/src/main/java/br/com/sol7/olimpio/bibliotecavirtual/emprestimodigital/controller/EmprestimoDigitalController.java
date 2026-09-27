package br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.controller;

import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.dto.EmprestimoDigitalRequest;
import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.dto.EmprestimoDigitalResponse;
import br.com.sol7.olimpio.bibliotecavirtual.emprestimodigital.service.EmprestimoDigitalService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.action.GenericActionController;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.List;

@Path("/api/biblioteca-virtual/emprestimo-digital")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmprestimoDigitalController extends GenericActionController {

    @Inject
    EmprestimoDigitalService service;

    @GET
    public Uni<PagedResponse<EmprestimoDigitalResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<EmprestimoDigitalResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/{id}")
    public Uni<EmprestimoDigitalResponse> buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @POST
    public Uni<Response> criar(@Valid EmprestimoDigitalRequest request) {
        return service.criar(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/{id}/devolver")
    public Uni<EmprestimoDigitalResponse> devolverAntecipadamente(@PathParam("id") Long id) {
        return service.devolverAntecipadamente(id);
    }

    @PUT
    @Path("/{id}/renovar")
    public Uni<EmprestimoDigitalResponse> renovar(
            @PathParam("id") Long id,
            @QueryParam("novaDataExpiracao") LocalDateTime novaDataExpiracao) {
        return service.renovar(id, novaDataExpiracao);
    }

    @PUT
    @Path("/{id}/progresso")
    public Uni<EmprestimoDigitalResponse> atualizarProgresso(
            @PathParam("id") Long id,
            @QueryParam("progresso") Integer progresso,
            @QueryParam("ultimaPagina") Integer ultimaPagina) {
        return service.atualizarProgresso(id, progresso, ultimaPagina);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> excluir(@PathParam("id") Long id) {
        return service.excluir(id)
                .onItem().transform(v -> Response.noContent().build());
    }

    @GET
    @Path("/usuario/{usuarioId}")
    public Uni<List<EmprestimoDigitalResponse>> buscarPorUsuario(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarPorUsuario(usuarioId);
    }

    @GET
    @Path("/usuario/{usuarioId}/ativos")
    public Uni<List<EmprestimoDigitalResponse>> buscarAtivosPorUsuario(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarAtivosPorUsuario(usuarioId);
    }

    @POST
    @Path("/processar-expiracao")
    public Uni<Response> processarExpiracao() {
        return service.processarExpiracao()
                .onItem().transform(v -> Response.ok().build());
    }
}
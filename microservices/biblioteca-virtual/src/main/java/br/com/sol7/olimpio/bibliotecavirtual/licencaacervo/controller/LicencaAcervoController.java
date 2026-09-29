package br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.controller;

import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.dto.LicencaAcervoRequest;
import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.dto.LicencaAcervoResponse;
import br.com.sol7.olimpio.bibliotecavirtual.licencaacervo.service.LicencaAcervoService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.action.GenericActionController;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/biblioteca-virtual/licenca")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LicencaAcervoController extends GenericActionController {

    @Inject
    LicencaAcervoService service;

    @GET
    public Uni<PagedResponse<LicencaAcervoResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<LicencaAcervoResponse>> paged(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<LicencaAcervoResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/livro/{livroDigitalId}")
    public Uni<LicencaAcervoResponse> buscarPorLivroDigitalId(@PathParam("livroDigitalId") Long livroDigitalId) {
        return service.buscarPorLivroDigitalId(livroDigitalId);
    }

    @POST
    public Uni<Response> criar(@Valid LicencaAcervoRequest request) {
        return service.criar(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/livro/{livroDigitalId}")
    public Uni<LicencaAcervoResponse> atualizar(@PathParam("livroDigitalId") Long livroDigitalId, @Valid LicencaAcervoRequest request) {
        return service.atualizar(livroDigitalId, request);
    }

    @PUT
    @Path("/livro/{livroDigitalId}/ocupar")
    public Uni<LicencaAcervoResponse> ocuparLicenca(@PathParam("livroDigitalId") Long livroDigitalId) {
        return service.ocuparLicenca(livroDigitalId);
    }

    @PUT
    @Path("/livro/{livroDigitalId}/liberar")
    public Uni<LicencaAcervoResponse> liberarLicenca(@PathParam("livroDigitalId") Long livroDigitalId) {
        return service.liberarLicenca(livroDigitalId);
    }

    @DELETE
    @Path("/livro/{livroDigitalId}")
    public Uni<Response> excluir(@PathParam("livroDigitalId") Long livroDigitalId) {
        return service.excluir(livroDigitalId)
                .onItem().transform(v -> Response.noContent().build());
    }
}
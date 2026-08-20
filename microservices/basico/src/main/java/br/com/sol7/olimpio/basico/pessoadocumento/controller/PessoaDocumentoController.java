package br.com.sol7.olimpio.basico.pessoadocumento.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.pessoadocumento.dto.PessoaDocumentoRequest;
import br.com.sol7.olimpio.basico.pessoadocumento.dto.PessoaDocumentoResponse;
import br.com.sol7.olimpio.basico.pessoadocumento.service.PessoaDocumentoService;

@Path("/api/basico/pessoa-documento")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PessoaDocumentoController {
    @Inject
    PessoaDocumentoService service;

    @GET
    public Uni<List<PessoaDocumentoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<PessoaDocumentoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<PessoaDocumentoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid PessoaDocumentoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<PessoaDocumentoResponse> update(@PathParam("id") Long id, @Valid PessoaDocumentoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-pessoa-documento")
    public Uni<List<Long>> buscarPessoaDocumento(@QueryParam("pessoaId") Long pessoaId) {
        return service.buscarPessoaDocumento(pessoaId);
    }

}
package br.com.sol7.olimpio.basico.documento.controller;

import br.com.sol7.olimpio.basico.documento.dto.DocumentoConfiguracaoRequest;
import br.com.sol7.olimpio.basico.documento.dto.DocumentoConfiguracaoResponse;
import br.com.sol7.olimpio.basico.documento.service.DocumentoConfiguracaoService;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;

@Path("/api/basico/documento/configuracao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DocumentoConfiguracaoController {

    private final DocumentoConfiguracaoService service = new DocumentoConfiguracaoService();

    @GET
    @Path("/")
    public Response listar() {
        return service.listar()
            .map(responses -> Response.ok(responses).build())
            .defaultIfEmpty(Response.status(404).entity("Nenhum documento configurado").build())
            .orElse(Response.serverError().build());
    }

    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response salvar(DocumentoConfiguracaoRequest request) {
        return service.salvar(request)
            .map(Response::ok)
            .defaultIfEmpty(Response.serverError().build())
            .orElse(Response.serverError().build());
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response atualizar(@PathParam("id") Long id, DocumentoConfiguracaoRequest request) {
        return service.atualizar(id, request)
            .map(Response::ok)
            .defaultIfEmpty(Response.status(404).build())
            .orElse(Response.serverError().build());
    }

    @DELETE
    @Path("/{id}")
    public Response deletar(@PathParam("id") Long id) {
        return service.deletar(id)
            .map(Response::ok)
            .defaultIfEmpty(Response.status(404).build())
            .orElse(Response.serverError().build());
    }
}
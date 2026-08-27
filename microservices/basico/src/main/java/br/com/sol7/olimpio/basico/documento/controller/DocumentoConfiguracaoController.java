package br.com.sol7.olimpio.basico.documento.controller;

import br.com.sol7.olimpio.basico.documento.dto.DocumentoConfiguracaoRequest;
import br.com.sol7.olimpio.basico.documento.dto.DocumentoConfiguracaoResponse;
import br.com.sol7.olimpio.basico.documento.service.DocumentoConfiguracaoService;
import io.smallrye.mutiny.Uni;
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
    public Uni<Response> listar() {
        return service.listar()
            .map(responses -> responses.isEmpty() ? 
                Response.status(404).entity("Nenhum documento configurado").build() : 
                Response.ok(responses).build());
    }

    @POST
    @Path("/")
    @Consumes(MediaType.APPLICATION_JSON)
    public Uni<Response> salvar(DocumentoConfiguracaoRequest request) {
        return service.salvar(request)
            .map(res -> Response.ok(res).build());
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Uni<Response> atualizar(@PathParam("id") Long id, DocumentoConfiguracaoRequest request) {
        return service.atualizar(id, request)
            .map(res -> Response.ok(res).build());
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> deletar(@PathParam("id") Long id) {
        return service.deletar(id)
            .map(v -> Response.ok().build());
    }
}
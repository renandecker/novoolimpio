package br.com.sol7.olimpio.central.filaprioritaria;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/central/fila-prioritaria")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FilaPrioritariaController {
    @Inject
    FilaPrioritariaService service;

    @GET
    public Uni<List<FilaPrioritariaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FilaPrioritariaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<FilaPrioritariaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid FilaPrioritariaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<FilaPrioritariaResponse> update(@PathParam("id") Long id, @Valid FilaPrioritariaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/por-usuario/{usuarioId}")
    public Uni<List<FilaPrioritariaResponse>> buscarPorUsuario(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarPorUsuario(usuarioId);
    }

    @GET
    @Path("/por-ordem-ligacao/{ordemLigacaoId}")
    public Uni<List<FilaPrioritariaResponse>> buscarPorOrdemLigacao(@PathParam("ordemLigacaoId") Long ordemLigacaoId) {
        return service.buscarPorOrdemLigacao(ordemLigacaoId);
    }

    @GET
    @Path("/proximo-retorno/{usuarioId}")
    public Uni<FilaPrioritariaResponse> buscarProximaRetorno(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarProximaRetorno(usuarioId);
    }

    @GET
    @Path("/contar/{usuarioId}/{status}")
    public Uni<Long> contarPorUsuarioEStatus(@PathParam("usuarioId") Long usuarioId, @PathParam("status") String status) {
        return service.contarPorUsuarioEStatus(usuarioId, status);
    }

    @POST
    @Path("/agendar-retorno")
    public Uni<FilaPrioritariaResponse> agendarRetorno(@QueryParam("ligacaoId") Long ligacaoId,
                                                        @QueryParam("ordemLigacaoId") Long ordemLigacaoId,
                                                        @QueryParam("data") String data,
                                                        @QueryParam("usuarioId") Long usuarioId) {
        // data vem como ISO string, converter
        return service.agendarRetorno(ligacaoId, ordemLigacaoId, java.sql.Timestamp.valueOf(data.replace("T", " ")), usuarioId);
    }

    @PUT
    @Path("/{id}/concluir")
    public Uni<FilaPrioritariaResponse> concluirRetorno(@PathParam("id") Long id) {
        return service.concluirRetorno(id);
    }

    @PUT
    @Path("/{id}/cancelar")
    public Uni<FilaPrioritariaResponse> cancelarRetorno(@PathParam("id") Long id) {
        return service.cancelarRetorno(id);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<FilaPrioritariaResponse>> search(SearchFilterRequest request,
            @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.search(request, page == null ? 0 : page, size == null ? 10 : size);
    }
}
package br.com.sol7.olimpio.comercial.prospectoradar;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/comercial/prospecto-radar")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProspectoRadarController {
    @Inject
    ProspectoRadarService service;

    @GET
    public Uni<List<ProspectoRadarResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ProspectoRadarResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ProspectoRadarResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ProspectoRadarRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ProspectoRadarResponse> update(@PathParam("id") Long id, @Valid ProspectoRadarRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/carregar-prospecto-para-visualizacao")
    public Uni<Void> carregarProspectoParaVisualizacao(@QueryParam("entityId") Long entityId) {
        return service.carregarProspectoParaVisualizacao(entityId);
    }


    @GET
    @Path("/carregar-formulario-da-acao-com-llnk")
    public Uni<String> carregarFormularioDaAcaoComLlnk(@QueryParam("acaoId") Long acaoId, @QueryParam("unidadeId") Long unidadeId) {
        return service.carregarFormularioDaAcaoComLlnk(acaoId, unidadeId);
    }


    @GET
    @Path("/carregar-formulario-da-acao")
    public Uni<Void> carregarFormularioDaAcao() {
        return service.carregarFormularioDaAcao();
    }


    @POST
    @Path("/atualizar-radar")
    public Uni<Void> atualizarRadar(@QueryParam("pro") String pro) {
        return service.atualizarRadar(pro);
    }

}